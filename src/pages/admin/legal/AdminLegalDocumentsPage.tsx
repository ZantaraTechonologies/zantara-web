import React, { useState, useEffect } from 'react';
import API from '../../../services/api/apiClient';
import toast from 'react-hot-toast';
import { normalizeAdminLegalDocument, adminLegalDocumentUrl } from './adminLegalDocument';

interface Doc {
    id: string;
    documentType: string;
    title: string;
    version: number | null;
    status: string;
    acceptanceMode: string;
    requiresAcceptance: boolean;
    requiresReacceptance: boolean;
    isPublic: boolean;
    changeSummary: string;
}

interface FullDoc extends Doc {
    sourceMarkdown: string;
    contentHtml: string;
}

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-700',
    published: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-slate-100 text-slate-500',
};

const EMPTY_FORM = {
    documentType: 'terms',
    title: '',
    sourceMarkdown: '',
    changeSummary: '',
    acceptanceMode: 'agreement',
    requiresReacceptance: false,
    isPublic: true,
};

const AdminLegalDocumentsPage: React.FC = () => {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState<FullDoc | null>(null);
    const [editDoc, setEditDoc] = useState<FullDoc | null>(null);
    const [publishTarget, setPublishTarget] = useState<Doc | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const res = await API.get('/legal/admin/documents');
            setDocs((res.data?.data || []).map(normalizeAdminLegalDocument));
        } catch {
            toast.error('Failed to load legal documents');
        }
        setLoading(false);
    };

    useEffect(() => { fetchDocs(); }, []);

    const openCreate = () => {
        setEditDoc(null);
        setForm({ ...EMPTY_FORM });
        setCreateOpen(true);
    };

    const openEdit = async (doc: Doc) => {
        try {
            const res = await API.get(adminLegalDocumentUrl('get', doc));
            const full: FullDoc = normalizeAdminLegalDocument(res.data?.data);
            setEditDoc(full);
            setForm({
                documentType: full.documentType,
                title: full.title,
                sourceMarkdown: full.sourceMarkdown || '',
                changeSummary: full.changeSummary || '',
                acceptanceMode: full.acceptanceMode,
                requiresReacceptance: !!full.requiresReacceptance,
                isPublic: full.isPublic ?? true,
            });
            setCreateOpen(true);
        } catch {
            toast.error('Failed to load document');
        }
    };

    const openPreview = async (doc: Doc) => {
        try {
            const res = await API.get(adminLegalDocumentUrl('get', doc));
            setPreview(normalizeAdminLegalDocument(res.data?.data));
        } catch {
            toast.error('Failed to load preview');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editDoc) {
                await API.put(adminLegalDocumentUrl('update', editDoc), form);
                toast.success('Draft updated');
            } else {
                await API.post('/legal/admin/documents', form);
                toast.success('Draft created');
            }
            setCreateOpen(false);
            setEditDoc(null);
            setForm({ ...EMPTY_FORM });
            fetchDocs();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Save failed');
        }
        setSaving(false);
    };

    const handlePublish = async () => {
        if (!publishTarget) return;
        setSaving(true);
        try {
            await API.post(adminLegalDocumentUrl('publish', publishTarget));
            toast.success('Document published');
            setPublishTarget(null);
            fetchDocs();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Publish failed');
        }
        setSaving(false);
    };

    const handleArchive = async (doc: Doc) => {
        try {
            await API.post(adminLegalDocumentUrl('archive', doc));
            toast.success('Document archived');
            fetchDocs();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Archive failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-brand-navy">Legal Documents</h1>
                <button
                    onClick={openCreate}
                    className="bg-brand-emerald hover:bg-brand-emerald-600 text-white font-bold px-4 py-2 rounded-xl shadow-btn transition-all"
                >
                    Create Draft
                </button>
            </div>

            <div className="bg-surface border border-slate-100 rounded-2xl overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                            <tr>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Version</th>
                                <th className="px-4 py-3">Mode</th>
                                <th className="px-4 py-3">Reaccept</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-medium">Loading…</td></tr>
                            ) : docs.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-medium">No documents found</td></tr>
                            ) : docs.map(doc => (
                                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-700">{doc.documentType}</td>
                                    <td className="px-4 py-3 text-slate-600 max-w-[220px] truncate">{doc.title}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_COLORS[doc.status] || 'bg-slate-100 text-slate-500'}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-slate-500">{doc.version ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-500">{doc.acceptanceMode}</td>
                                    <td className="px-4 py-3 text-slate-500">{doc.requiresReacceptance ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => openPreview(doc)} className="text-xs font-bold text-slate-500 hover:text-brand-navy transition-colors">Preview</button>
                                            {doc.status === 'draft' && (
                                                <>
                                                    <button onClick={() => openEdit(doc)} className="text-xs font-bold text-brand-emerald hover:underline transition-colors">Edit</button>
                                                    <button onClick={() => setPublishTarget(doc)} className="text-xs font-bold text-brand-navy hover:underline transition-colors">Publish</button>
                                                </>
                                            )}
                                            {doc.status === 'published' && doc.acceptanceMode === 'none' && (
                                                <button onClick={() => handleArchive(doc)} className="text-xs font-bold text-rose-600 hover:underline transition-colors">Archive</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {createOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-surface rounded-2xl shadow-xl max-w-2xl w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-brand-navy">{editDoc ? 'Edit Draft' : 'Create Draft'}</h2>
                            <button onClick={() => { setCreateOpen(false); setEditDoc(null); }} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Document Type</label>
                                    <select value={form.documentType} onChange={e => setForm({ ...form, documentType: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50">
                                        <option value="terms">Terms of Service</option>
                                        <option value="privacy">Privacy Policy</option>
                                        <option value="refund_complaints">Refund / Complaints Policy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Acceptance Mode</label>
                                    <select value={form.acceptanceMode} onChange={e => setForm({ ...form, acceptanceMode: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50">
                                        <option value="agreement">Agreement (mandatory)</option>
                                        <option value="acknowledgement">Acknowledgement (mandatory)</option>
                                        <option value="none">Informational (optional)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Title</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50" placeholder="Document title" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Source Markdown</label>
                                <textarea value={form.sourceMarkdown} onChange={e => setForm({ ...form, sourceMarkdown: e.target.value })} rows={12} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 resize-y" placeholder="Write markdown content…" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Change Summary</label>
                                <input value={form.changeSummary} onChange={e => setForm({ ...form, changeSummary: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50" placeholder="Brief summary of changes" />
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={form.requiresReacceptance} onChange={e => setForm({ ...form, requiresReacceptance: e.target.checked })} className="w-5 h-5 text-brand-emerald border-slate-200 rounded-lg focus:ring-brand-emerald/20" />
                                    Require re-acceptance on next publish
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} className="w-5 h-5 text-brand-emerald border-slate-200 rounded-lg focus:ring-brand-emerald/20" />
                                    Public
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => { setCreateOpen(false); setEditDoc(null); }} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl transition-colors">Cancel</button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !form.title.trim()}
                                    className="bg-brand-emerald hover:bg-brand-emerald-600 text-white font-bold px-5 py-2 rounded-xl shadow-btn transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving…' : editDoc ? 'Update Draft' : 'Create Draft'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {publishTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold text-brand-navy mb-2">Publish Document?</h2>
                        <p className="text-slate-500 text-sm mb-1">
                            <span className="font-semibold">{publishTarget.title}</span> ({publishTarget.documentType})
                        </p>
                        {publishTarget.acceptanceMode !== 'none' && (
                            <p className="text-amber-600 text-xs font-semibold mt-2 mb-4">
                                This publishes a new version requiring user acceptance.
                                {publishTarget.requiresReacceptance ? ' Existing users will be prompted to re-accept.' : ''}
                            </p>
                        )}
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setPublishTarget(null)} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl transition-colors">Cancel</button>
                            <button
                                onClick={handlePublish}
                                disabled={saving}
                                className="bg-brand-navy hover:bg-brand-navy/90 text-white font-bold px-5 py-2 rounded-xl shadow-btn transition-all disabled:opacity-50"
                            >
                                {saving ? 'Publishing…' : 'Confirm Publish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-surface rounded-2xl shadow-xl max-w-3xl w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-brand-navy">{preview.title}</h2>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">
                                    {preview.documentType} · v{preview.version ?? 'draft'} · {preview.status} · {preview.acceptanceMode}
                                </p>
                            </div>
                            <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
                        </div>
                        <div
                            className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed border border-slate-100 rounded-xl p-6 bg-white max-h-[70vh] overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: preview.contentHtml }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLegalDocumentsPage;