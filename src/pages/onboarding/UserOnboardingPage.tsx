import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    AlertCircle,
    ArrowRight,
    LockKeyhole,
    RefreshCw,
} from 'lucide-react';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import { useAuthStore } from '../../store/auth/authStore';
import * as userService from '../../services/user/userService';
import { resolvePostAuthPath, validatePin } from '../../utils/onboarding';

const inputClass = 'block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-emerald/50 focus:ring-4 focus:ring-brand-emerald/10 disabled:cursor-not-allowed disabled:opacity-60';
const primaryButtonClass = 'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-emerald px-5 py-3 text-sm font-bold text-white shadow-btn transition hover:bg-brand-emerald-600 disabled:cursor-not-allowed disabled:opacity-60';

function StepCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
    return (
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/30 sm:p-8">
            <div className="mb-7 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-mint text-brand-emerald">{icon}</div>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-brand-navy sm:text-2xl">{title}</h1>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function FieldError({ id, message }: { id: string; message?: string }) {
    return message ? <p id={id} role="alert" className="mt-1.5 text-xs font-semibold text-rose-600">{message}</p> : null;
}

function TransactionPinStep() {
    const onboarding = useAuthStore(state => state.onboarding);
    const hydrateAuthResponse = useAuthStore(state => state.hydrateAuthResponse);
    const refreshOnboarding = useAuthStore(state => state.refreshOnboarding);
    const fetchMe = useAuthStore(state => state.fetchMe);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const pinAlreadySet = onboarding?.transactionPin?.isSet === true;

    useEffect(() => {
        if (pinAlreadySet) void refreshOnboarding(true).catch(() => {});
    }, [pinAlreadySet, refreshOnboarding]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (pinAlreadySet) return;
        const validationError = validatePin(pin, confirmPin);
        setError(validationError || '');
        if (validationError) return;

        setSubmitting(true);
        try {
            const response = await userService.setupPin({ pin, confirmPin });
            hydrateAuthResponse(response);
            setPin('');
            setConfirmPin('');
            await fetchMe();
            toast.success('Transaction PIN created');
        } catch (requestError: any) {
            setPin('');
            setConfirmPin('');
            toast.error(requestError.response?.data?.message || 'Unable to create your transaction PIN');
        } finally {
            setSubmitting(false);
        }
    };

    if (pinAlreadySet) {
        return (
            <StepCard icon={<LockKeyhole size={23} />} title="Transaction PIN secured" description="Your PIN is already set. We are confirming your account readiness with the server.">
                <div className="flex items-center justify-center gap-3 py-8 text-sm font-bold text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin text-brand-emerald" /> Confirming account status...
                </div>
            </StepCard>
        );
    }

    return (
        <StepCard icon={<LockKeyhole size={23} />} title="Create your transaction PIN" description="Choose a private 4-digit PIN. You will use it to authorize sensitive account actions.">
            <form onSubmit={submit} className="space-y-5" autoComplete="off">
                <label className="block text-sm font-bold text-slate-700">
                    Transaction PIN
                    <input className={`${inputClass} mt-2 text-center text-xl tracking-[0.5em]`} aria-label="Transaction PIN" type="password" inputMode="numeric" maxLength={4} autoComplete="off" data-lpignore="true" data-1p-ignore value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} aria-invalid={!!error} aria-describedby={error ? 'pin-error' : undefined} />
                </label>
                <label className="block text-sm font-bold text-slate-700">
                    Confirm PIN
                    <input className={`${inputClass} mt-2 text-center text-xl tracking-[0.5em]`} aria-label="Confirm transaction PIN" type="password" inputMode="numeric" maxLength={4} autoComplete="off" data-lpignore="true" data-1p-ignore value={confirmPin} onChange={event => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 4))} aria-invalid={!!error} aria-describedby={error ? 'pin-error' : undefined} />
                </label>
                <FieldError id="pin-error" message={error} />
                <button type="submit" disabled={submitting} className={primaryButtonClass}>{submitting ? 'Securing your account…' : 'Create PIN and finish'} <ArrowRight size={17} /></button>
                <p className="text-center text-xs leading-relaxed text-slate-400">Your PIN is sent only to the authenticated backend over the application connection. It is not written to browser storage or logs.</p>
            </form>
        </StepCard>
    );
}

function UnavailableState() {
    const refreshOnboarding = useAuthStore(state => state.refreshOnboarding);
    const onboardingError = useAuthStore(state => state.onboardingError);
    const onboardingStatus = useAuthStore(state => state.onboardingStatus);

    return (
        <StepCard icon={<AlertCircle size={23} />} title="Account setup is temporarily unavailable" description="We could not safely confirm your current onboarding step. Your dashboard remains protected until the server responds.">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {onboardingError?.message || 'Please check your connection and try again.'}
            </div>
            <button type="button" onClick={() => { void refreshOnboarding(true).catch(() => {}); }} disabled={onboardingStatus === 'loading'} className={`${primaryButtonClass} mt-5`}>
                <RefreshCw size={16} className={onboardingStatus === 'loading' ? 'animate-spin' : ''} /> {onboardingStatus === 'loading' ? 'Checking…' : 'Check again'}
            </button>
        </StepCard>
    );
}

export default function UserOnboardingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const onboarding = useAuthStore(state => state.onboarding);
    const onboardingStatus = useAuthStore(state => state.onboardingStatus);
    const refreshOnboarding = useAuthStore(state => state.refreshOnboarding);

    useEffect(() => {
        if (onboardingStatus === 'idle') void refreshOnboarding().catch(() => {});
    }, [onboardingStatus, refreshOnboarding]);

    useEffect(() => {
        if (onboardingStatus !== 'ready' || !onboarding) return;
        const destination = resolvePostAuthPath(onboarding, '/app');
        if (destination === '/app') {
            navigate('/app', { replace: true });
            return;
        }
        if (location.pathname !== destination) navigate(destination, { replace: true });
    }, [location.pathname, navigate, onboarding, onboardingStatus]);

    const currentStep = onboarding?.currentStep || null;
    let content = <UnavailableState />;
    if (onboardingStatus === 'ready' && onboarding?.enforced && onboarding.status === 'incomplete') {
        content = <TransactionPinStep />;
    }

    if (onboardingStatus === 'loading' && !onboarding) {
        content = (
            <div className="mx-auto flex min-h-[360px] max-w-2xl items-center justify-center rounded-3xl border border-slate-100 bg-white">
                <div className="text-center"><RefreshCw className="mx-auto animate-spin text-brand-emerald" /><p className="mt-3 text-sm font-bold text-slate-400">Checking account status…</p></div>
            </div>
        );
    }

    return <OnboardingShell currentStep={currentStep}>{content}</OnboardingShell>;
}
