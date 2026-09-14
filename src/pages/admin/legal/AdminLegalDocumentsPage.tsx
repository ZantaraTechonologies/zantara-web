import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import API from '../../../services/api/apiClient';
import toast from 'react-hot-toast';
import { normalizeAdminLegalDocument, adminLegalDocumentUrl } from './adminLegalDocument';
import { markdownToLegalHtml } from './clientLegalHtml';
import { buildSectionHeading } from './legalMarkdownOps';
import { Info, Plus, Eye, Code2, PenLine } from 'lucide-react';

const LegalVisualEditor = lazy(() => import('./LegalVisualEditor'));
export type { LegalVisualEditorHandle } from './LegalVisualEditor';

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

type EditorMode = 'visual' | 'markdown' | 'preview';

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

const MODE_TABS: { mode: EditorMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'visual', label: 'Visual', icon: <PenLine size={14} /> },
    { mode: 'markdown', label: 'Markdown', icon: <Code2 size={14} /> },
    { mode: 'preview', label: 'Preview', icon: <Eye size={14} /> },
];

const AdminLegalDocumentsPage: React.FC = () => {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState<FullDoc | null>(null);
    const [editDoc, setEditDoc] = useState<FullDoc | null>(null);
    const [publishTarget, setPublishTarget] = useState<Doc | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    const [mode, setMode] = useState<EditorMode>('visual');
    const [visualSeed, setVisualSeed] = useState(0);
    const visualEditorRef = useRef<LegalVisualEditorHandle | null>(null);
    const [sectionOpen, setSectionOpen] = useState(false);
    const [sectionTitle, setSectionTitle] = useState('');

    const draftPreviewHtml = useMemo(
        () => markdownToLegalHtml(form.sourceMarkdown || ''),
        [form.sourceMarkdown]
    );

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

    const enterFormMode = () => {
        setMode('visual');
        setVisualSeed(v => v + 1);
    };

    const openCreate = () => {
        setEditDoc(null);
        setForm({ ...EMPTY_FORM });
        setCreateOpen(true);
        enterFormMode();
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
            enterFormMode();
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

    const switchMode = (next: EditorMode) => {
        setMode(next);
        if (next === 'visual') setVisualSeed(v => v + 1);
    };

    const confirmAddSection = () => {
        const heading = buildSectionHeading(form.sourceMarkdown, sectionTitle);
        if (!heading) {
            toast.error('Enter a section heading');
            return;
        }
        if (mode === 'visual') {
            visualEditorRef.current?.insertHeading(heading);
        } else {
            const base = form.sourceMarkdown.replace(/\s+$/, '');
            setForm(f => ({
                ...f,
                sourceMarkdown: (base ? base + '\n\n' : '') + `## ${heading}` + '\n\n'
            }));
        }
        setSectionTitle('');
        setSectionOpen(false);
        toast.success('Section added');
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
                    <div className="bg-surface rounded-2xl shadow-xl max-w-3xl w-full my-8 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-brand-navy">{editDoc ? 'Edit Draft' : 'Create Draft'}</h2>
                            <button onClick={() => { setCreateOpen(false); setEditDoc(null); }} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
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
                            {editDoc && (
                                <p className="text-xs font-semibold text-slate-400">
                                    Status: <span className="capitalize text-slate-600">{editDoc.status}</span>
                                    {' · '}Version: <span className="text-slate-600">{editDoc.version ?? 'draft'}</span>
                                    {' · '}Linked route: <span className="font-mono text-slate-600">
                                        {form.documentType === 'terms' ? '/terms' : form.documentType === 'privacy' ? '/privacy' : '/refund-policy'}
                                    </span>
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-6">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={form.requiresReacceptance} onChange={e => setForm({ ...form, requiresReacceptance: e.target.checked })} className="w-5 h-5 text-brand-emerald border-slate-200 rounded-lg focus:ring-brand-emerald/20" />
                                    Require re-acceptance on next publish
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} className="w-5 h-5 text-brand-emerald border-slate-200 rounded-lg focus:ring-brand-emerald/20" />
                                    Public status
                                </label>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Change Summary</label>
                                <input value={form.changeSummary} onChange={e => setForm({ ...form, changeSummary: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50" placeholder="Brief summary of changes" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Content</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setSectionTitle(''); setSectionOpen(true); }}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-emerald hover:underline transition-colors"
                                        >
                                            <Plus size={14} /> Add Section
                                        </button>
                                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                            {MODE_TABS.map(tab => (
                                                <button
                                                    key={tab.mode}
                                                    onClick={() => switchMode(tab.mode)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${mode === tab.mode ? 'bg-surface text-brand-navy shadow-sm' : 'text-slate-400 hover:text-brand-navy'}`}
                                                >
                                                    {tab.icon}{tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 mb-3 text-xs text-slate-500">
                                    <Info size={14} className="shrink-0 mt-0.5 text-brand-emerald" />
                                    <span>Use headings to divide sections, lists for multiple items, and links for related policies. You do not need to know Markdown when using Visual mode.</span>
                                </div>

                                {mode === 'visual' && (
                                    <Suspense fallback={<div className="flex items-center justify-center py-20 text-sm text-slate-400">Loading editor…</div>}>
                                        <LegalVisualEditor
                                            key={visualSeed}
                                            ref={visualEditorRef}
                                            initialMarkdown={form.sourceMarkdown || ''}
                                            onMarkdownChange={md => setForm(f => ({ ...f, sourceMarkdown: md }))}
                                        />
                                    </Suspense>
                                )}

                                {mode === 'markdown' && (
                                    <textarea
                                        value={form.sourceMarkdown}
                                        onChange={e => setForm({ ...form, sourceMarkdown: e.target.value })}
                                        rows={14}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 resize-y"
                                        placeholder="Write markdown content…"
                                    />
                                )}

                                {mode === 'preview' && (
                                    <div className="rounded-xl border border-slate-200 bg-surface overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                                            <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                                                Draft Preview
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">Not saved or published</span>
                                        </div>
                                        <div
                                            className="legal-content p-6 max-h-[60vh] overflow-y-auto"
                                            dangerouslySetInnerHTML={{ __html: draftPreviewHtml }}
                                        />
                                    </div>
                                )}
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

            {sectionOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-surface rounded-2xl shadow-xl max-w-sm w-full p-6">
                        <h3 className="text-base font-bold text-brand-navy mb-3">Add Section</h3>
                        <p className="text-xs text-slate-500 mb-3">This inserts a Heading 2 to divide the document.</p>
                        <input
                            autoFocus
                            value={sectionTitle}
                            onChange={e => setSectionTitle(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') confirmAddSection(); }}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50"
                            placeholder="Section heading, e.g. Zantara Services"
                        />
                        <div className="flex justify-end gap-3 mt-5">
                            <button onClick={() => setSectionOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl transition-colors">Cancel</button>
                            <button onClick={confirmAddSection} className="bg-brand-emerald hover:bg-brand-emerald-600 text-white font-bold px-5 py-2 rounded-xl shadow-btn transition-all">
                                Add
                            </button>
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
                    <div className="bg-surface rounded-2xl shadow-xl max-w-3xl w-full my-8 p-6">
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
                            className="legal-content p-6 bg-surface border border-slate-200 rounded-xl max-h-[70vh] overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: preview.contentHtml }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLegalDocumentsPage;