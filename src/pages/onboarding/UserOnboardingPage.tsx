import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    FileCheck2,
    LockKeyhole,
    Mail,
    Phone,
    RefreshCw,
    Send,
    UserRound,
} from 'lucide-react';
import OnboardingShell from '../../components/onboarding/OnboardingShell';
import { useAuthStore } from '../../store/auth/authStore';
import * as onboardingService from '../../services/onboarding/onboardingService';
import * as userService from '../../services/user/userService';
import {
    resolvePostAuthPath,
    validateBasicKyc,
    validatePin,
} from '../../utils/onboarding';

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

function BasicKycStep() {
    const user = useAuthStore(state => state.user);
    const hydrateAuthResponse = useAuthStore(state => state.hydrateAuthResponse);
    const [fields, setFields] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const validation = validateBasicKyc(fields);
        setErrors(validation.errors);
        if (!validation.valid) return;

        setSubmitting(true);
        try {
            const response = await userService.updateProfile(validation.values);
            hydrateAuthResponse(response);
            toast.success('Profile details confirmed');
        } catch (error: any) {
            const data = error.response?.data;
            const fieldErrors: Record<string, string> = {};
            for (const field of data?.data?.missingFields || []) fieldErrors[field] = 'This field is required.';
            for (const field of data?.data?.invalidFields || []) fieldErrors[field] = 'Check this value and try again.';
            setErrors(fieldErrors);
            toast.error(data?.message || 'Unable to save your profile details');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <StepCard icon={<UserRound size={23} />} title="Confirm your profile" description="Use your legal name and active contact details. Government IDs, BVN and document uploads are not required for this step.">
            <form onSubmit={submit} className="space-y-5" noValidate>
                <label className="block text-sm font-bold text-slate-700">
                    Full legal name
                    <input className={`${inputClass} mt-2`} autoComplete="name" value={fields.name} onChange={event => setFields({ ...fields, name: event.target.value })} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'basic-name-error' : undefined} />
                    <FieldError id="basic-name-error" message={errors.name} />
                </label>
                <label className="block text-sm font-bold text-slate-700">
                    Email address
                    <input className={`${inputClass} mt-2`} type="email" autoComplete="email" value={fields.email} onChange={event => setFields({ ...fields, email: event.target.value })} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'basic-email-error' : undefined} />
                    <FieldError id="basic-email-error" message={errors.email} />
                </label>
                <label className="block text-sm font-bold text-slate-700">
                    Nigerian phone number
                    <input className={`${inputClass} mt-2`} type="tel" inputMode="tel" autoComplete="tel" placeholder="08012345678" value={fields.phone} onChange={event => setFields({ ...fields, phone: event.target.value })} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'basic-phone-error' : undefined} />
                    <FieldError id="basic-phone-error" message={errors.phone} />
                </label>
                <button className={primaryButtonClass} disabled={submitting} type="submit">
                    {submitting ? 'Saving profile…' : 'Save and continue'} <ArrowRight size={17} />
                </button>
            </form>
        </StepCard>
    );
}

function ContactChannel({
    type,
    verified,
    destination,
}: {
    type: 'phone' | 'email';
    verified: boolean;
    destination: string;
}) {
    const [code, setCode] = useState('');
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [sent, setSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const Icon = type === 'phone' ? Phone : Mail;
    const label = type === 'phone' ? 'Phone number' : 'Email address';

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
        return () => window.clearTimeout(timer);
    }, [cooldown]);

    const send = async () => {
        setSending(true);
        try {
            if (type === 'phone') await onboardingService.sendPhoneVerificationCode();
            else await onboardingService.sendEmailVerificationCode();
            setSent(true);
            setCooldown(60);
            toast.success(`Verification code sent to your ${type}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Unable to send the ${type} verification code`);
        } finally {
            setSending(false);
        }
    };

    const verify = async () => {
        if (!/^\d{6}$/.test(code)) {
            toast.error('Enter the complete 6-digit code');
            return;
        }
        setVerifying(true);
        try {
            const response = type === 'phone'
                ? await onboardingService.verifyPhoneCode(code)
                : await onboardingService.verifyEmailCode(code);
            useAuthStore.getState().hydrateAuthResponse(response);
            setCode('');
            toast.success(`${label} verified`);
        } catch (error: any) {
            setCode('');
            toast.error(error.response?.data?.message || 'The code is invalid or expired');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${verified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {verified ? <CheckCircle2 size={21} /> : <Icon size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-800">{label}</p>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${verified ? 'text-emerald-600' : 'text-amber-600'}`}>{verified ? 'Verified' : 'Required'}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{destination}</p>
                </div>
            </div>

            {!verified && (
                <div className="mt-4 space-y-3">
                    {sent && (
                        <input
                            className={inputClass}
                            aria-label={`${label} verification code`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="6-digit code"
                            value={code}
                            onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        />
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        {sent && <button type="button" onClick={verify} disabled={verifying} className={`${primaryButtonClass} sm:flex-1`}>{verifying ? 'Verifying…' : 'Verify code'}</button>}
                        <button type="button" onClick={send} disabled={sending || cooldown > 0} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                            <Send size={15} /> {sending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : sent ? 'Resend code' : 'Send code'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ContactVerificationStep() {
    const user = useAuthStore(state => state.user);
    const onboarding = useAuthStore(state => state.onboarding);
    const contact = onboarding?.contactVerification;

    return (
        <StepCard icon={<Phone size={23} />} title="Verify your contact details" description="We send separate one-time codes to your phone and email. Codes expire and are never stored by this app.">
            <div className="space-y-4">
                <ContactChannel type="phone" verified={contact?.phoneVerified === true} destination={user?.phone || 'Your registered phone'} />
                <ContactChannel type="email" verified={contact?.emailVerified === true} destination={user?.email || 'Your registered email'} />
            </div>
        </StepCard>
    );
}

function LegalAcceptanceStep() {
    const hydrateAuthResponse = useAuthStore(state => state.hydrateAuthResponse);
    const refreshOnboarding = useAuthStore(state => state.refreshOnboarding);
    const [requirements, setRequirements] = useState<onboardingService.LegalRequirements | null>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState<string | null>(null);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setRequirements(await onboardingService.getLegalRequirements());
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || 'Unable to load the required agreements.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const accept = async (document: onboardingService.LegalDocumentRequirement) => {
        setAccepting(document.documentType);
        try {
            const response = await onboardingService.acceptLegalDocument(document);
            hydrateAuthResponse(response);
            if (response.data?.requirements) setRequirements(response.data.requirements);
            toast.success(`${document.title} accepted`);
        } catch (requestError: any) {
            toast.error(requestError.response?.data?.message || 'Unable to record your acceptance');
        } finally {
            setAccepting(null);
        }
    };

    const requiredDocuments = requirements?.documents?.filter(document => document.acceptanceRequired) || [];
    const mandatoryUnavailable = requirements?.missingMandatoryDocuments?.length;

    return (
        <StepCard icon={<FileCheck2 size={23} />} title="Review required agreements" description="Only new or materially updated mandatory documents are shown. Agreements you already accepted remain valid.">
            {loading && <div className="py-10 text-center text-sm font-semibold text-slate-400">Loading agreements…</div>}
            {!loading && error && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-bold">Agreements are temporarily unavailable</p>
                    <p className="mt-1">{error}</p>
                    <button type="button" onClick={load} className="mt-4 inline-flex items-center gap-2 font-bold"><RefreshCw size={15} /> Try again</button>
                </div>
            )}
            {!loading && !error && !!mandatoryUnavailable && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">A mandatory document is temporarily unavailable. Please try again later.</div>
            )}
            {!loading && !error && !mandatoryUnavailable && (
                <div className="space-y-4">
                    {requiredDocuments.map(document => (
                        <article key={document.documentType} className="rounded-2xl border border-slate-200 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-bold text-slate-800">{document.title}</h2>
                                    <p className="mt-1 text-xs text-slate-400">Version {document.version}{document.pendingReacceptance ? ' · Updated agreement' : ''}</p>
                                </div>
                                <Link target="_blank" rel="noreferrer" to={document.documentType === 'terms' ? '/terms' : document.documentType === 'privacy' ? '/privacy' : '/refund-policy'} className="text-sm font-bold text-brand-emerald hover:underline">Read</Link>
                            </div>
                            <button type="button" disabled={accepting !== null} onClick={() => accept(document)} className={`${primaryButtonClass} mt-5`}>
                                {accepting === document.documentType ? 'Recording acceptance…' : document.acceptanceMode === 'agreement' ? 'I agree' : 'I acknowledge'}
                            </button>
                        </article>
                    ))}
                    {requiredDocuments.length === 0 && (
                        <button type="button" onClick={() => { void refreshOnboarding(true).catch(() => {}); }} className={primaryButtonClass}>Refresh status <RefreshCw size={16} /></button>
                    )}
                </div>
            )}
        </StepCard>
    );
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

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const validationError = validatePin(pin, confirmPin);
        setError(validationError || '');
        if (validationError) return;
        if (onboarding?.transactionPin?.isSet) {
            await refreshOnboarding(true).catch(() => {});
            return;
        }

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
    if (onboardingStatus === 'ready' && onboarding?.enforced && onboarding.status !== 'unavailable') {
        if (currentStep === 'basic_kyc') content = <BasicKycStep />;
        if (currentStep === 'contact_verification') content = <ContactVerificationStep />;
        if (currentStep === 'legal_acceptance') content = <LegalAcceptanceStep />;
        if (currentStep === 'transaction_pin') content = <TransactionPinStep />;
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
