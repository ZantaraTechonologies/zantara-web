import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api/apiClient';
import { useAuthStore } from '../../store/auth/authStore';
import { useSiteSettings } from '../../app/SiteSettingsContext';

export default function LegalAcceptancePrompt() {
    const { settings } = useSiteSettings();
    const [requirements, setRequirements] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const logout = useAuthStore(s => s.logout);
    const legalActionBlocked = useAuthStore(s => s.legalActionBlocked);

    const fetchRequirements = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/legal/requirements');
            setRequirements(res.data?.data || null);
        } catch {
            setRequirements(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchRequirements(); }, [fetchRequirements]);

    // Re-fetch when a protected action triggers 428 (flag set by apiClient)
    useEffect(() => {
        if (legalActionBlocked) {
            fetchRequirements();
            useAuthStore.getState().setLegalActionBlocked(false);
        }
    }, [legalActionBlocked, fetchRequirements]);

    const handleAccept = async (doc) => {
        setAccepting(doc.documentType);
        try {
            await API.post('/legal/acceptance', {
                documentType: doc.documentType,
                version: doc.version,
                contentHash: doc.contentHash,
                channel: 'web'
            });
            await fetchRequirements();
        } catch {
            setAccepting(null);
        }
    };

    const hasRequired = requirements && (
        (requirements.missingAcceptances && requirements.missingAcceptances.length > 0) ||
        requirements.pendingReacceptance
    );

    if (loading || !hasRequired) return null;

    const requiredDocs = (requirements.documents || []).filter((d) => d.acceptanceRequired);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-brand-navy mb-2">Action Required</h2>
                <p className="text-slate-500 text-sm mb-6">
                    Please accept the updated legal agreements to continue using {settings.SITE_NAME}.
                </p>
                <div className="space-y-4 mb-6">
                    {requiredDocs.map((doc) => (
                        <div key={doc.documentType} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-slate-800 text-sm">{doc.title}</div>
                                <span className="text-xs font-bold text-slate-400 uppercase">v{doc.version}</span>
                            </div>
                            {doc.changeSummary && (
                                <p className="text-xs text-slate-400 mb-3 italic">{doc.changeSummary}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <Link
                                    to={doc.documentType === 'terms' ? '/terms' : doc.documentType === 'privacy' ? '/privacy' : '/refund-policy'}
                                    target="_blank"
                                    className="text-xs font-bold text-brand-emerald hover:underline"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => handleAccept(doc)}
                                    disabled={accepting !== null}
                                    className="ml-auto bg-brand-emerald hover:bg-brand-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                                >
                                    {accepting === doc.documentType ? 'Processing…' : doc.acceptanceMode === 'agreement' ? 'Agree' : 'Acknowledge'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => logout()}
                    className="w-full text-center text-sm font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
