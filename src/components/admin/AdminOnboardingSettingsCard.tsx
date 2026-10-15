import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/api/apiClient';
import type { OnboardingMode } from '../../utils/onboarding';

interface AdminOnboardingSettings {
    databaseMode: OnboardingMode;
    environmentCeilingMode: OnboardingMode;
    effectiveMode: OnboardingMode;
    policyVersion: number;
    capped: boolean;
}

const modeOptions: Array<{ value: OnboardingMode; label: string; description: string }> = [
    { value: 'off', label: 'Off', description: 'Do not enforce onboarding.' },
    { value: 'observe', label: 'Observe', description: 'Measure onboarding without blocking users.' },
    { value: 'new_users', label: 'New users', description: 'Require transaction PIN setup for newly enrolled users.' },
];

const modeLabel = (mode: OnboardingMode) => modeOptions.find(option => option.value === mode)?.label || mode;

export default function AdminOnboardingSettingsCard() {
    const [settings, setSettings] = useState<AdminOnboardingSettings | null>(null);
    const [selectedMode, setSelectedMode] = useState<OnboardingMode>('off');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [confirmationOpen, setConfirmationOpen] = useState(false);

    const loadSettings = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const response = await apiClient.get('/admin/settings/onboarding');
            if (!response.data?.success || !response.data?.data) {
                throw new Error(response.data?.message || 'Invalid onboarding settings response');
            }
            setSettings(response.data.data);
            setSelectedMode(response.data.data.databaseMode);
        } catch (error: any) {
            setLoadError(error.response?.data?.message || error.message || 'Failed to load onboarding settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadSettings();
    }, []);

    const openConfirmation = () => {
        setUpdateError('');
        setConfirmationOpen(true);
    };

    const closeConfirmation = () => {
        if (saving) return;
        setConfirmationOpen(false);
        setUpdateError('');
    };

    const confirmChange = async () => {
        if (!settings || selectedMode === settings.databaseMode) return;
        const expectedCurrentMode = settings.databaseMode;
        setSaving(true);
        setUpdateError('');
        try {
            const response = await apiClient.put('/admin/settings/onboarding', {
                mode: selectedMode,
                expectedCurrentMode,
                confirmOnboardingModeChange: `${expectedCurrentMode}-to-${selectedMode}`,
            });
            if (response.data?.success === false) {
                throw new Error(response.data?.message || 'Failed to update onboarding settings');
            }
            if (response.data?.data) {
                setSettings(response.data.data);
                setSelectedMode(response.data.data.databaseMode);
            } else {
                const refreshed = await apiClient.get('/admin/settings/onboarding');
                if (!refreshed.data?.success || !refreshed.data?.data) {
                    throw new Error(refreshed.data?.message || 'Invalid onboarding settings response');
                }
                setSettings(refreshed.data.data);
                setSelectedMode(refreshed.data.data.databaseMode);
            }
            setConfirmationOpen(false);
            toast.success('Onboarding enforcement mode updated');
        } catch (error: any) {
            setUpdateError(error.response?.data?.message || error.message || 'Failed to update onboarding settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section aria-labelledby="onboarding-settings-heading" className="overflow-hidden rounded-2xl border border-violet-200 bg-surface">
            <div className="flex items-center justify-between gap-4 border-b border-violet-100 p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 id="onboarding-settings-heading" className="text-xl font-semibold text-slate-900">User Onboarding Enforcement</h2>
                        <p className="mt-1 text-xs text-slate-500">SuperAdmin policy control, independent of business settings.</p>
                    </div>
                </div>
                <button type="button" aria-label="Refresh onboarding settings" onClick={() => void loadSettings()} disabled={loading || saving} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50">
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="p-6">
                {loading && !settings && <p className="text-sm font-medium text-slate-500">Loading onboarding policy...</p>}
                {!loading && loadError && !settings && (
                    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        <p>{loadError}</p>
                        <button type="button" onClick={() => void loadSettings()} className="mt-3 font-bold hover:underline">Try again</button>
                    </div>
                )}

                {settings && (
                    <div className="space-y-5">
                        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-slate-50 p-4">
                                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Stored mode</dt>
                                <dd className="mt-1 font-semibold text-slate-800">{modeLabel(settings.databaseMode)}</dd>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4">
                                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Environment ceiling</dt>
                                <dd className="mt-1 font-semibold text-slate-800">{modeLabel(settings.environmentCeilingMode)}</dd>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4">
                                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Effective mode</dt>
                                <dd className="mt-1 font-semibold text-slate-800">{modeLabel(settings.effectiveMode)}</dd>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4">
                                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Policy version</dt>
                                <dd className="mt-1 font-semibold text-slate-800">{settings.policyVersion}</dd>
                            </div>
                        </dl>

                        {settings.capped && (
                            <div role="status" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                                <p><strong>Environment cap active.</strong> The stored mode is limited by the environment ceiling, so the effective mode is {modeLabel(settings.effectiveMode)}.</p>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                            <label className="block text-sm font-medium text-slate-600">
                                Stored enforcement mode
                                <select aria-label="Stored enforcement mode" value={selectedMode} onChange={event => setSelectedMode(event.target.value as OnboardingMode)} disabled={saving} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500">
                                    {modeOptions.map(option => <option key={option.value} value={option.value}>{option.label} - {option.description}</option>)}
                                </select>
                            </label>
                            <button type="button" onClick={openConfirmation} disabled={saving || selectedMode === settings.databaseMode} className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
                                Review mode change
                            </button>
                        </div>
                        {loadError && <p role="alert" className="text-sm font-medium text-rose-600">Refresh failed: {loadError}</p>}
                        {updateError && !confirmationOpen && <p role="alert" className="text-sm font-medium text-rose-600">{updateError}</p>}
                    </div>
                )}
            </div>

            {confirmationOpen && settings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
                    <div role="dialog" aria-modal="true" aria-labelledby="confirm-onboarding-mode-heading" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 id="confirm-onboarding-mode-heading" className="text-xl font-bold text-slate-900">Confirm onboarding mode change</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">Change the stored mode from <strong>{modeLabel(settings.databaseMode)}</strong> to <strong>{modeLabel(selectedMode)}</strong>? The environment ceiling may limit the effective mode.</p>
                        {updateError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{updateError}</p>}
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={closeConfirmation} disabled={saving} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                            <button type="button" onClick={() => void confirmChange()} disabled={saving} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">
                                {saving ? 'Updating...' : 'Confirm mode change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
