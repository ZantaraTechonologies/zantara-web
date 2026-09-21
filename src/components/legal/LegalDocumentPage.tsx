import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../services/api/apiClient';
import { useSiteSettings } from '../../app/SiteSettingsContext';
import SiteLogo from '../common/SiteLogo';

interface LegalDoc {
    documentType: string;
    title: string;
    version: number;
    contentHtml: string;
    effectiveDate: string;
    acceptanceMode: string;
}

export default function LegalDocumentPage({ type }: { type?: string }) {
    const { settings } = useSiteSettings();
    const { type: paramType } = useParams<{ type: string }>();
    const docType = type || paramType;
    const [doc, setDoc] = useState<LegalDoc | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        setDoc(null);
        API.get(`/legal/documents/${docType}/current`)
            .then(r => { if (!cancelled) setDoc(r.data?.data || r.data); })
            .catch(e => { if (!cancelled) setError(e.response?.data?.message || 'Failed to load document'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [docType]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-emerald/20 border-t-brand-emerald rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <p className="text-red-600 font-semibold mb-2">Unable to load document</p>
                    <p className="text-slate-400 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!doc) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <Link to="/" className="max-w-3xl mx-auto mb-4 flex items-center gap-3 w-fit">
                <SiteLogo src={settings.SITE_LOGO} siteName={settings.SITE_NAME} className="w-9 h-9 rounded-xl object-contain" />
                <span className="text-lg font-black text-brand-navy tracking-tight uppercase">{settings.SITE_NAME}</span>
            </Link>
            <div className="max-w-3xl mx-auto bg-surface p-5 sm:p-8 rounded-xl shadow-md">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{doc.title}</h1>
                <p className="text-sm text-slate-400 mb-6 italic">
                    Effective: {new Date(doc.effectiveDate).toLocaleDateString()} · Version {doc.version}
                </p>
                <div
                    className="legal-content"
                    dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
                />
            </div>
        </div>
    );
}
