import React, { useEffect, useState } from 'react';
import { Globe, Mail, FileText, X } from 'lucide-react';
import { LEGAL_LINK_TARGETS, normalizeLegalLinkHref } from './legalMarkdownOps';

export interface LegalLinkRequest {
    href: string;
    label: string;
}

interface Props {
    onInsert: (request: LegalLinkRequest) => void;
    onClose: () => void;
}

type LinkKind = 'external' | 'email' | 'internal';

const KIND_OPTIONS: { kind: LinkKind; label: string; icon: React.ReactNode }[] = [
    { kind: 'external', label: 'Web link', icon: <Globe size={16} /> },
    { kind: 'email', label: 'Email address', icon: <Mail size={16} /> },
    { kind: 'internal', label: 'Another policy', icon: <FileText size={16} /> }
];

const LegalLinkModal: React.FC<Props> = ({ onInsert, onClose }) => {
    const [kind, setKind] = useState<LinkKind>('external');
    const [url, setUrl] = useState('');
    const [email, setEmail] = useState('');
    const [internalHref, setInternalHref] = useState(LEGAL_LINK_TARGETS[0].href);
    const [label, setLabel] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { setError(''); }, [kind]);

    const internalTarget = LEGAL_LINK_TARGETS.find(t => t.href === internalHref) || LEGAL_LINK_TARGETS[0];

    const buildRequest = (): LegalLinkRequest | null => {
        let href = '';
        let defaultLabel = '';
        if (kind === 'external') {
            href = normalizeLegalLinkHref(url) || '';
            if (!href) return null;
            defaultLabel = href.replace(/^https?:\/\//i, '');
        } else if (kind === 'email') {
            const clean = (email || '').trim().replace(/\s+/g, '').toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return null;
            href = `mailto:${clean}`;
            defaultLabel = clean;
        } else {
            href = internalTarget.href;
            defaultLabel = internalTarget.label;
        }
        return { href, label: label.trim() || defaultLabel };
    };

    const handleInsert = () => {
        const req = buildRequest();
        if (!req) {
            setError(kind === 'email' ? 'Enter a valid email address.' : 'Enter a valid web address (https://…).');
            return;
        }
        onInsert(req);
    };

    return (
        <div className="fixed inset-0 z-[60] flex bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full m-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-brand-navy">Insert Link</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
                </div>

                <div className="flex gap-2 mb-4">
                    {KIND_OPTIONS.map(o => (
                        <button
                            key={o.kind}
                            type="button"
                            onClick={() => setKind(o.kind)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${kind === o.kind ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-500 hover:text-brand-navy'}`}
                        >
                            {o.icon}{o.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {kind === 'external' && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Web address</label>
                            <input
                                autoFocus
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleInsert(); }}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50"
                                placeholder="https://example.com"
                            />
                        </div>
                    )}
                    {kind === 'email' && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Email address</label>
                            <input
                                autoFocus
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleInsert(); }}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50"
                                placeholder="support@example.com"
                            />
                        </div>
                    )}
                    {kind === 'internal' && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Related policy</label>
                            <select
                                value={internalHref}
                                onChange={e => setInternalHref(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50"
                            >
                                {LEGAL_LINK_TARGETS.map(t => (
                                    <option key={t.href} value={t.href}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Link text <span className="normal-case font-medium">(optional)</span></label>
                        <input
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50"
                            placeholder={kind === 'internal' ? internalTarget.label : 'Link text shown to users'}
                        />
                    </div>
                </div>

                {error && <p className="text-xs font-semibold text-rose-600 mt-3">{error}</p>}

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleInsert} className="bg-brand-emerald hover:bg-brand-emerald-600 text-white font-bold px-5 py-2 rounded-xl shadow-btn transition-all">
                        Insert Link
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalLinkModal;