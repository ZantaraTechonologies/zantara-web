export type OnboardingStep =
    | 'basic_kyc'
    | 'contact_verification'
    | 'legal_acceptance'
    | 'transaction_pin'
    | 'complete';

export type OnboardingMode = 'off' | 'observe' | 'new_users';

export interface OnboardingState {
    policyVersion: number | null;
    mode: OnboardingMode;
    enrolled: boolean | null;
    enforced: boolean;
    observed?: boolean;
    status: 'complete' | 'incomplete' | 'unavailable' | 'not_applicable';
    currentStep: OnboardingStep | null;
    complete: boolean;
    dashboardAllowed: boolean;
    code?: string;
    basicKyc?: {
        status: 'complete' | 'incomplete';
        missingFields: string[];
        invalidFields: string[];
    };
    contactVerification?: {
        status: 'complete' | 'required';
        phoneVerified: boolean;
        emailVerified: boolean;
        missing: string[];
    };
    legalAcceptance?: {
        status: 'complete' | 'required' | 'unavailable';
        missingDocumentTypes: string[];
        missingMandatoryDocuments: string[];
    };
    transactionPin?: {
        status: 'complete' | 'required';
        isSet: boolean;
    };
    identityVerification?: {
        status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
        tier: number | null;
        rejectionReason?: string;
    };
}

export const ONBOARDING_STEP_PATHS: Record<Exclude<OnboardingStep, 'complete'>, string> = {
    basic_kyc: '/onboarding/basic-kyc',
    contact_verification: '/onboarding/contact-verification',
    legal_acceptance: '/onboarding/legal-acceptance',
    transaction_pin: '/onboarding/transaction-pin',
};

export const ONBOARDING_STEPS: Array<{ step: Exclude<OnboardingStep, 'complete'>; label: string }> = [
    { step: 'basic_kyc', label: 'Profile' },
    { step: 'contact_verification', label: 'Verify' },
    { step: 'legal_acceptance', label: 'Agreements' },
    { step: 'transaction_pin', label: 'Security' },
];

export function getOnboardingPath(onboarding?: OnboardingState | null) {
    if (!onboarding || onboarding.status === 'unavailable') return '/onboarding/unavailable';
    if (onboarding.currentStep && onboarding.currentStep !== 'complete') {
        return ONBOARDING_STEP_PATHS[onboarding.currentStep] || '/onboarding/unavailable';
    }
    return '/app';
}

export function resolvePostAuthPath(
    onboarding: OnboardingState | null | undefined,
    requestedPath = '/app',
) {
    if (!onboarding) return '/onboarding/unavailable';
    if (!onboarding.enforced) return requestedPath;
    if (onboarding.complete && onboarding.currentStep === 'complete') return requestedPath;
    return getOnboardingPath(onboarding);
}

export function shouldRestrictDashboard(onboarding?: OnboardingState | null) {
    if (!onboarding) return true;
    return onboarding.enforced && !(onboarding.complete && onboarding.currentStep === 'complete');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIGERIAN_PHONE_RE = /^(?:0[789]\d{9}|\+?234[789]\d{9})$/;

export interface RegistrationFields {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    referrerCode?: string;
}

export function validateBasicKyc(fields: Pick<RegistrationFields, 'name' | 'email' | 'phone'>) {
    const errors: Partial<Record<'name' | 'email' | 'phone', string>> = {};
    const name = fields.name.trim().replace(/\s+/g, ' ');
    const email = fields.email.trim().toLowerCase();
    const phone = fields.phone.trim();

    if (name.length < 2 || name.length > 120) errors.name = 'Enter your full legal name.';
    if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Enter a valid email address.';
    if (!NIGERIAN_PHONE_RE.test(phone)) errors.phone = 'Use a Nigerian number such as 08012345678.';

    return { errors, values: { name, email, phone }, valid: Object.keys(errors).length === 0 };
}

export function validateRegistration(fields: RegistrationFields) {
    const profile = validateBasicKyc(fields);
    const errors: Record<string, string> = { ...profile.errors };
    if (fields.password.length < 8) errors.password = 'Use at least 8 characters.';
    if (fields.confirmPassword !== fields.password) errors.confirmPassword = 'Passwords do not match.';
    return { errors, valid: Object.keys(errors).length === 0, values: profile.values };
}

export function buildRegistrationPayload(
    fields: RegistrationFields,
    legalAcceptances: Array<{ documentType: string; version: number; contentHash: string; channel: 'web' }>,
) {
    const { values } = validateRegistration(fields);
    const referrerCode = fields.referrerCode?.trim();
    return {
        ...values,
        password: fields.password,
        confirmPassword: fields.confirmPassword,
        ...(referrerCode ? { referrerCode } : {}),
        legalAcceptances,
    };
}

export function validatePin(pin: string, confirmPin: string) {
    if (!/^\d{4}$/.test(pin)) return 'Enter a 4-digit PIN.';
    if (pin !== confirmPin) return 'PINs do not match.';
    return null;
}
