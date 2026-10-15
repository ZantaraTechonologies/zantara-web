import type { ReactNode } from 'react';
import { Check, LogOut, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';
import { useSiteSettings } from '../../app/SiteSettingsContext';
import SiteLogo from '../common/SiteLogo';
import { ONBOARDING_STEPS, type OnboardingStep } from '../../utils/onboarding';

interface Props {
    currentStep: OnboardingStep | null;
    children: ReactNode;
}

export default function OnboardingShell({ currentStep, children }: Props) {
    const { settings } = useSiteSettings();
    const logout = useAuthStore(state => state.logout);
    const currentIndex = ONBOARDING_STEPS.findIndex(item => item.step === currentStep);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-mint/50">
            <header className="border-b border-slate-100 bg-white/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <SiteLogo src={settings.SITE_LOGO} siteName={settings.SITE_NAME} className="h-9 w-9 rounded-xl object-contain" />
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight text-brand-navy">{settings.SITE_NAME}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Secure account setup</p>
                        </div>
                    </div>
                    <button type="button" aria-label="Sign out" onClick={() => logout()} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Sign out</span>
                    </button>
                </div>
            </header>

            <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-12">
                <aside className="self-start rounded-3xl border border-slate-100 bg-brand-navy p-5 text-white shadow-xl shadow-slate-300/30 lg:sticky lg:top-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><ShieldCheck size={21} /></div>
                        <div>
                            <p className="text-sm font-bold">Account readiness</p>
                            <p className="text-xs text-white/60">A few secure steps</p>
                        </div>
                    </div>
                    <ol className="grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-1">
                        {ONBOARDING_STEPS.map((item, index) => {
                            const complete = currentIndex > index || currentStep === 'complete';
                            const active = currentIndex === index;
                            return (
                                <li key={item.step} aria-current={active ? 'step' : undefined} className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center lg:flex-row lg:text-left ${active ? 'bg-white/10' : ''}`}>
                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? 'bg-brand-emerald text-white' : active ? 'bg-white text-brand-navy' : 'bg-white/10 text-white/50'}`}>
                                        {complete ? <Check size={14} /> : index + 1}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide lg:text-xs ${active || complete ? 'text-white' : 'text-white/45'}`}>{item.label}</span>
                                </li>
                            );
                        })}
                    </ol>
                </aside>

                <section className="min-w-0">{children}</section>
            </main>
        </div>
    );
}
