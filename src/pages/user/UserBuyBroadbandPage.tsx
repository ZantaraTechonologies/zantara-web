import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Info, ShieldCheck, UserCheck, Wifi } from "lucide-react";
import { toast } from "react-hot-toast";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Input, Row, SubmitButton } from "../../components/buy/Buy";
import SecurePinModal from "../../components/modals/SecurePinModal";
import apiClient from "../../services/api/apiClient";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useAuthStore } from "../../store/auth/authStore";
import { createOwnedRouteState, getSessionIdentity } from "../../utils/sessionRouteState";
import { getVtuPurchasePresentation, normalizeVtuPurchaseResponse } from "../../utils/vtuPurchaseOutcome";

type PurchaseMode = "plan" | "amount";
type IdentifierKind = "text" | "phone" | "numeric" | "email";
type IdentifierNormalization = "none" | "trim" | "lowercase" | "uppercase" | "digits_only";
type VerificationMode = "none" | "optional" | "required";

interface IdentifierPolicy {
    label?: string;
    kind?: IdentifierKind;
    placeholder?: string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    normalization?: IdentifierNormalization;
}

interface VerificationPolicy {
    mode?: VerificationMode;
}

interface AmountPolicy {
    min?: number;
    max?: number;
    step?: number;
    currency?: string;
}

interface BroadbandIdentity {
    serviceIdentityId?: string;
    name: string;
    purchaseMode?: PurchaseMode | string;
    identifierPolicy?: IdentifierPolicy;
    verificationPolicy?: VerificationPolicy;
    amountPolicy?: AmountPolicy | null;
    brand?: { logoUrl?: string } | null;
    brandId?: { logoUrl?: string } | null;
}

interface BroadbandPlan {
    planId?: string;
    serviceIdentityId?: string;
    name: string;
    price?: {
        salePrice?: number;
        referencePrice?: number | null;
        savings?: number | null;
        currency?: string;
    };
}

interface BroadbandVerification {
    verified?: boolean;
    status?: "verified" | "verification_not_required" | string;
    message?: string;
    customerName?: string;
    identifierMasked?: string;
    verificationContext: string;
    idempotencyKey: string;
    serviceIdentityId: string;
    planId?: string;
    expiresAt: string;
    price: {
        salePrice: number;
        referencePrice?: number | null;
        savings?: number | null;
        currency?: string;
    };
}

interface StoredVerification {
    attemptId: string;
    identityId: string;
    normalizedIdentifier: string;
    planId?: string;
    amount?: number;
    result: BroadbandVerification;
}

interface IdentifierValidation {
    normalized: string;
    error: string | null;
}

interface AmountValidation {
    value: number | null;
    error: string | null;
}

const IDENTIFIER_KINDS: IdentifierKind[] = ["text", "phone", "numeric", "email"];
const IDENTIFIER_NORMALIZATIONS: IdentifierNormalization[] = ["none", "trim", "lowercase", "uppercase", "digits_only"];
const VERIFICATION_MODES: VerificationMode[] = ["none", "optional", "required"];

const getCanonicalId = (value: unknown) => typeof value === "string" ? value.trim() : "";
const getIdentityId = (identity?: BroadbandIdentity | null) => getCanonicalId(identity?.serviceIdentityId);
const getPlanId = (plan?: BroadbandPlan | null) => getCanonicalId(plan?.planId);

const toMinorUnits = (value: number) => {
    const minorUnits = Math.round(value * 100);
    return Number.isSafeInteger(minorUnits) ? minorUnits : null;
};

const createClientAttemptId = () => {
    if (typeof globalThis.crypto?.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }

    if (typeof globalThis.crypto?.getRandomValues === "function") {
        const values = new Uint32Array(4);
        globalThis.crypto.getRandomValues(values);
        return Array.from(values, value => value.toString(16).padStart(8, "0")).join("-");
    }

    return `broadband-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const getIdentifierConfigurationError = (policy?: IdentifierPolicy) => {
    if (typeof policy?.label !== "string" || !policy.label.trim() || !policy.kind || !policy.normalization) {
        return "This Broadband service does not have a complete identifier policy.";
    }
    if (!IDENTIFIER_KINDS.includes(policy.kind) || !IDENTIFIER_NORMALIZATIONS.includes(policy.normalization)) {
        return "This Broadband service has an unsupported identifier policy.";
    }
    if (policy.minLength != null && (!Number.isInteger(policy.minLength) || policy.minLength < 0)) {
        return "This Broadband service has an invalid minimum identifier length.";
    }
    if (policy.maxLength != null && (!Number.isInteger(policy.maxLength) || policy.maxLength < 0)) {
        return "This Broadband service has an invalid maximum identifier length.";
    }
    if (policy.minLength != null && policy.maxLength != null && policy.maxLength < policy.minLength) {
        return "This Broadband service has an invalid identifier length range.";
    }
    if (policy.placeholder != null && typeof policy.placeholder !== "string") {
        return "This Broadband service has an invalid identifier placeholder configuration.";
    }
    if (policy.pattern != null && typeof policy.pattern !== "string") {
        return "This Broadband service has an invalid identifier format configuration.";
    }
    if (policy.pattern) {
        try {
            new RegExp(policy.pattern);
        } catch {
            return "This Broadband service has an invalid identifier format configuration.";
        }
    }
    return null;
};

const validateIdentifier = (value: string, policy?: IdentifierPolicy): IdentifierValidation => {
    const configurationError = getIdentifierConfigurationError(policy);
    if (configurationError || !policy?.kind || !policy.normalization) {
        return { normalized: "", error: configurationError || "Customer identifier is not configured." };
    }

    if (value.length > 512) {
        return { normalized: "", error: "Customer identifier is too long." };
    }

    let normalized = value;
    if (policy.normalization === "trim") normalized = value.trim();
    if (policy.normalization === "lowercase") normalized = value.trim().toLowerCase();
    if (policy.normalization === "uppercase") normalized = value.trim().toUpperCase();
    if (policy.normalization === "digits_only") {
        if (value && !/^[\d\s()+-]+$/.test(value)) {
            return { normalized: "", error: "Customer identifier contains unsupported characters." };
        }
        normalized = value.replace(/[^\d]/g, "");
    }

    if (!normalized || !normalized.trim()) {
        return { normalized, error: `${policy.label} is required.` };
    }
    if (policy.minLength != null && normalized.length < policy.minLength) {
        return { normalized, error: `${policy.label} must be at least ${policy.minLength} characters.` };
    }
    if (policy.maxLength != null && normalized.length > policy.maxLength) {
        return { normalized, error: `${policy.label} must be at most ${policy.maxLength} characters.` };
    }
    if (policy.kind === "numeric" && !/^\d+$/.test(normalized)) {
        return { normalized, error: `${policy.label} must contain only digits.` };
    }
    if (policy.kind === "phone" && !/^\+?\d{7,15}$/.test(normalized)) {
        return { normalized, error: `${policy.label} must be a valid phone number.` };
    }
    if (policy.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return { normalized, error: `${policy.label} must be a valid email address.` };
    }
    if (policy.pattern && !new RegExp(policy.pattern).test(normalized)) {
        return { normalized, error: `${policy.label} format is invalid.` };
    }

    return { normalized, error: null };
};

const getAmountConfigurationError = (policy?: AmountPolicy | null) => {
    const minimum = Number(policy?.min);
    const maximum = Number(policy?.max);
    const step = Number(policy?.step);
    const minimumMinor = toMinorUnits(minimum);
    const maximumMinor = toMinorUnits(maximum);
    const stepMinor = toMinorUnits(step);
    if (!policy
        || !Number.isFinite(minimum)
        || minimum <= 0
        || !Number.isFinite(maximum)
        || maximum < minimum
        || !Number.isFinite(step)
        || step <= 0
        || minimumMinor == null
        || maximumMinor == null
        || stepMinor == null
        || stepMinor <= 0) {
        return "This Broadband service does not have a valid amount policy.";
    }
    if (policy.currency !== "NGN") {
        return "This Broadband service has an unsupported currency configuration.";
    }
    return null;
};

const validateAmount = (value: string, policy?: AmountPolicy | null): AmountValidation => {
    const configurationError = getAmountConfigurationError(policy);
    if (configurationError || !policy) return { value: null, error: configurationError };
    if (!value.trim()) return { value: null, error: "Enter an amount." };
    if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) {
        return { value: null, error: "Amount cannot have more than two decimal places." };
    }

    const amount = Number(value);
    const minimum = Number(policy.min);
    const maximum = Number(policy.max);
    const step = Number(policy.step);
    if (!Number.isFinite(amount)) return { value: null, error: "Enter a valid amount." };
    if (amount < minimum || amount > maximum) {
        return { value: amount, error: `Amount must be between ${minimum} and ${maximum}.` };
    }

    const amountMinor = toMinorUnits(amount);
    const minimumMinor = toMinorUnits(minimum);
    const stepMinor = toMinorUnits(step);
    if (amountMinor == null || minimumMinor == null || stepMinor == null || stepMinor <= 0) {
        return { value: amount, error: "Enter a valid amount." };
    }
    if ((amountMinor - minimumMinor) % stepMinor !== 0) {
        return { value: amount, error: `Amount must increase in steps of ${step}.` };
    }

    return { value: amount, error: null };
};

const formatMoney = (amount: number, currency = "NGN") => {
    try {
        return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString()}`;
    }
};

const UserBuyBroadbandPage: React.FC = () => {
    const navigate = useNavigate();
    const { balance, currency, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();

    const [identities, setIdentities] = useState<BroadbandIdentity[]>([]);
    const [identitiesLoading, setIdentitiesLoading] = useState(true);
    const [identityLoadError, setIdentityLoadError] = useState<string | null>(null);
    const [selectedIdentityId, setSelectedIdentityId] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [identifierTouched, setIdentifierTouched] = useState(false);
    const [plans, setPlans] = useState<BroadbandPlan[]>([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [plansError, setPlansError] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [amount, setAmount] = useState("");
    const [amountTouched, setAmountTouched] = useState(false);
    const [verification, setVerification] = useState<StoredVerification | null>(null);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [purchasing, setPurchasing] = useState(false);

    const verificationGenerationRef = useRef(0);
    const planRequestGenerationRef = useRef(0);
    const verificationInFlightGenerationRef = useRef<number | null>(null);
    const purchaseInFlightRef = useRef(false);
    const purchaseAttemptIdRef = useRef("");
    const mountedRef = useRef(true);
    if (!purchaseAttemptIdRef.current) purchaseAttemptIdRef.current = createClientAttemptId();

    const selectedIdentity = identities.find(identity => getIdentityId(identity) === selectedIdentityId) || null;
    const selectedPlan = plans.find(plan => getPlanId(plan) === selectedPlanId) || null;
    const purchaseMode = selectedIdentity?.purchaseMode;
    const verificationMode = selectedIdentity?.verificationPolicy?.mode;
    const identifierValidation = validateIdentifier(identifier, selectedIdentity?.identifierPolicy);
    const amountValidation = validateAmount(amount, selectedIdentity?.amountPolicy);
    const verificationExpiresAt = verification ? Date.parse(verification.result.expiresAt) : Number.NaN;
    const currentVerification = verification?.attemptId === purchaseAttemptIdRef.current
        && Number.isFinite(verificationExpiresAt)
        && verificationExpiresAt > Date.now()
        ? verification
        : null;

    const getIdentityAvailabilityError = (identity: BroadbandIdentity | null) => {
        if (!identity) return "Select an Internet Service to continue.";
        if (identity.purchaseMode !== "plan" && identity.purchaseMode !== "amount") {
            return "This Broadband service is temporarily unavailable.";
        }
        const identifierError = getIdentifierConfigurationError(identity.identifierPolicy);
        if (identifierError) return identifierError;
        if (!identity.verificationPolicy?.mode || !VERIFICATION_MODES.includes(identity.verificationPolicy.mode)) {
            return "This Broadband service does not have a supported verification policy.";
        }
        if (identity.purchaseMode === "amount") {
            return getAmountConfigurationError(identity.amountPolicy);
        }
        return null;
    };

    const identityAvailabilityError = getIdentityAvailabilityError(selectedIdentity);

    const invalidateForMaterialChange = () => {
        verificationGenerationRef.current += 1;
        verificationInFlightGenerationRef.current = null;
        purchaseAttemptIdRef.current = createClientAttemptId();
        setVerification(null);
        setVerificationLoading(false);
        setVerificationError(null);
        setPinError(null);
        setShowPinModal(false);
    };

    const invalidateVerificationContext = () => {
        verificationGenerationRef.current += 1;
        verificationInFlightGenerationRef.current = null;
        setVerification(null);
        setVerificationLoading(false);
        setPinError(null);
    };

    const resetAfterDefinitiveFailure = (message: string) => {
        invalidateForMaterialChange();
        setVerificationError(message);
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            verificationGenerationRef.current += 1;
            planRequestGenerationRef.current += 1;
        };
    }, []);

    useEffect(() => {
        if (!verification) return;
        const expiresAt = Date.parse(verification.result.expiresAt);
        const delay = expiresAt - Date.now();
        if (!Number.isFinite(expiresAt) || delay <= 0) {
            invalidateVerificationContext();
            setVerificationError("Your Broadband verification has expired. Please verify again.");
            setShowPinModal(false);
            return;
        }

        const timer = window.setTimeout(() => {
            if (purchaseInFlightRef.current) return;
            invalidateVerificationContext();
            setVerificationError("Your Broadband verification has expired. Please verify again.");
            setShowPinModal(false);
        }, delay);
        return () => window.clearTimeout(timer);
    }, [verification]);

    useEffect(() => {
        let active = true;

        const loadIdentities = async () => {
            setIdentitiesLoading(true);
            setIdentityLoadError(null);
            try {
                const response = await apiClient.get("/services/identities?category=broadband");
                if (!active) return;
                const rawList = Array.isArray(response.data?.data) ? response.data.data as BroadbandIdentity[] : [];
                const list = rawList.filter(identity => (
                    identity
                    && typeof identity.name === "string"
                    && Boolean(identity.name.trim())
                    && Boolean(getIdentityId(identity))
                ));
                setIdentities(list);
                if (list.length > 0) {
                    purchaseAttemptIdRef.current = createClientAttemptId();
                    verificationGenerationRef.current += 1;
                    setSelectedIdentityId(getIdentityId(list[0]));
                }
            } catch (error: any) {
                if (!active) return;
                const message = error.response?.data?.message || "Broadband services could not be loaded.";
                setIdentityLoadError(message);
                toast.error(message);
            } finally {
                if (active) setIdentitiesLoading(false);
            }
        };

        void loadIdentities();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const identityId = getIdentityId(selectedIdentity);
        const requestGeneration = ++planRequestGenerationRef.current;
        let active = true;

        if (!identityId || selectedIdentity?.purchaseMode !== "plan") {
            setPlans([]);
            setPlansLoading(false);
            setPlansError(null);
            return () => {
                active = false;
            };
        }

        const loadPlans = async () => {
            setPlans([]);
            setSelectedPlanId("");
            setPlansLoading(true);
            setPlansError(null);
            try {
                const response = await apiClient.get(`/services/identities/${identityId}/plans`);
                if (!active || requestGeneration !== planRequestGenerationRef.current) return;
                const responseIdentityId = getCanonicalId(response.data?.data?.identity?.serviceIdentityId);
                const rawList = response.data?.data?.plans;
                if (responseIdentityId !== identityId || !Array.isArray(rawList)) {
                    throw new Error("Invalid Broadband plan response");
                }
                const list = (rawList as BroadbandPlan[]).filter(plan => (
                    plan
                    && typeof plan.name === "string"
                    && Boolean(plan.name.trim())
                    && Boolean(getPlanId(plan))
                    && getCanonicalId(plan.serviceIdentityId) === identityId
                ));
                setPlans(list);
            } catch (error: any) {
                if (!active || requestGeneration !== planRequestGenerationRef.current) return;
                const message = error.response?.data?.message || "Broadband plans could not be loaded.";
                setPlansError(message);
                toast.error(message);
            } finally {
                if (active && requestGeneration === planRequestGenerationRef.current) setPlansLoading(false);
            }
        };

        void loadPlans();
        return () => {
            active = false;
        };
    }, [selectedIdentityId, selectedIdentity]);

    const handleIdentityChange = (identity: BroadbandIdentity) => {
        if (purchasing || verificationLoading) return;
        const identityId = getIdentityId(identity);
        if (!identityId || identityId === selectedIdentityId) return;
        invalidateForMaterialChange();
        planRequestGenerationRef.current += 1;
        setSelectedIdentityId(identityId);
        setIdentifier("");
        setIdentifierTouched(false);
        setPlans([]);
        setPlansError(null);
        setSelectedPlanId("");
        setAmount("");
        setAmountTouched(false);
    };

    const handleIdentifierChange = (value: string) => {
        if (value === identifier) return;
        invalidateForMaterialChange();
        setIdentifier(value);
    };

    const handlePlanChange = (planId: string) => {
        if (planId === selectedPlanId) return;
        invalidateForMaterialChange();
        setSelectedPlanId(planId);
    };

    const handleAmountChange = (value: string) => {
        if (value === amount) return;
        invalidateForMaterialChange();
        setAmount(value);
    };

    const getVerificationInput = () => {
        if (!selectedIdentity || identityAvailabilityError) {
            return { error: identityAvailabilityError || "Select an Internet Service to continue." };
        }

        const identityId = getIdentityId(selectedIdentity);
        if (!identityId) return { error: "This Broadband service is temporarily unavailable." };
        if (identifierValidation.error) return { error: identifierValidation.error };

        if (purchaseMode === "plan") {
            if (plansLoading) return { error: "Please wait while Broadband plans load." };
            if (!selectedPlan || getCanonicalId(selectedPlan.serviceIdentityId) !== identityId) {
                return { error: "Select a Broadband plan." };
            }
            return {
                error: null,
                identityId,
                normalizedIdentifier: identifierValidation.normalized,
                planId: selectedPlanId,
                payload: {
                    serviceIdentityId: identityId,
                    planId: selectedPlanId,
                    identifier: identifierValidation.normalized
                }
            };
        }

        if (purchaseMode === "amount") {
            if (amountValidation.error || amountValidation.value == null) {
                return { error: amountValidation.error || "Enter a valid amount." };
            }
            return {
                error: null,
                identityId,
                normalizedIdentifier: identifierValidation.normalized,
                amount: amountValidation.value,
                payload: {
                    serviceIdentityId: identityId,
                    identifier: identifierValidation.normalized,
                    amount: amountValidation.value
                }
            };
        }

        return { error: "This Broadband service is temporarily unavailable." };
    };

    const prepareVerification = async (showSuccessMessage: boolean): Promise<StoredVerification | null> => {
        if (currentVerification) return currentVerification;
        if (verificationLoading || verificationInFlightGenerationRef.current != null) return null;

        setIdentifierTouched(true);
        if (purchaseMode === "amount") setAmountTouched(true);
        const input = getVerificationInput();
        if (input.error || !input.payload || !input.identityId || !input.normalizedIdentifier) {
            const message = input.error || "Broadband verification could not be prepared.";
            setVerificationError(message);
            toast.error(message);
            return null;
        }

        const generation = ++verificationGenerationRef.current;
        const attemptId = purchaseAttemptIdRef.current;
        verificationInFlightGenerationRef.current = generation;
        setVerificationLoading(true);
        setVerificationError(null);

        try {
            const response = await apiClient.post("/services/broadband/verify", input.payload, { timeout: 20000 });
            if (!mountedRef.current || generation !== verificationGenerationRef.current || attemptId !== purchaseAttemptIdRef.current) {
                return null;
            }

            const result = response.data?.data as BroadbandVerification | undefined;
            const expiresAt = Date.parse(result?.expiresAt || "");
            if (
                typeof result?.verificationContext !== "string"
                || !result.verificationContext.trim()
                || typeof result.idempotencyKey !== "string"
                || !result.idempotencyKey.trim()
                || getCanonicalId(result.serviceIdentityId) !== input.identityId
                || (purchaseMode === "plan" && getCanonicalId(result.planId) !== input.planId)
                || (purchaseMode === "amount" && result.planId != null)
                || typeof result.price?.salePrice !== "number"
                || !Number.isFinite(result.price.salePrice)
                || result.price.salePrice <= 0
                || result.price.currency !== "NGN"
                || !Number.isFinite(expiresAt)
                || expiresAt <= Date.now()
                || (result.status !== "verified" && result.status !== "verification_not_required")
                || (result.status === "verified" && result.verified !== true)
                || (result.status === "verification_not_required" && result.verified !== false)
            ) {
                throw new Error("Broadband verification returned an incomplete purchase context.");
            }
            if (verificationMode === "required" && (result.status !== "verified" || result.verified !== true)) {
                throw new Error("Customer verification is required before this purchase can continue.");
            }

            const stored: StoredVerification = {
                attemptId,
                identityId: input.identityId,
                normalizedIdentifier: input.normalizedIdentifier,
                planId: input.planId,
                amount: input.amount,
                result
            };
            setVerification(stored);
            if (showSuccessMessage) toast.success(result.message || "Broadband details verified.");
            return stored;
        } catch (error: any) {
            if (!mountedRef.current || generation !== verificationGenerationRef.current || attemptId !== purchaseAttemptIdRef.current) {
                return null;
            }
            const message = error.response?.data?.message || error.message || "Broadband verification failed.";
            setVerificationError(message);
            toast.error(message);
            return null;
        } finally {
            if (verificationInFlightGenerationRef.current === generation) {
                verificationInFlightGenerationRef.current = null;
            }
            if (generation === verificationGenerationRef.current && attemptId === purchaseAttemptIdRef.current) {
                setVerificationLoading(false);
            }
        }
    };

    const handleVerify = () => {
        void prepareVerification(true);
    };

    const handleInitiate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (purchasing || verificationLoading) return;

        setIdentifierTouched(true);
        if (purchaseMode === "amount") setAmountTouched(true);
        const input = getVerificationInput();
        if (input.error) {
            setVerificationError(input.error);
            toast.error(input.error);
            return;
        }

        let prepared = currentVerification;
        if (!prepared) {
            if (verificationMode === "required") {
                const message = "Verify the customer details before continuing.";
                setVerificationError(message);
                toast.error(message);
                return;
            }
            prepared = await prepareVerification(false);
        }
        if (!prepared) return;

        if (prepared.result.price.salePrice > balance) {
            toast.error("Insufficient wallet balance.");
            return;
        }

        setPinError(null);
        setShowPinModal(true);
    };

    const navigateToStatus = (
        status: "success" | "pending" | "failed" | "timeout",
        message: string,
        reference?: string
    ) => {
        const prepared = currentVerification;
        const transactionAmount = prepared?.result.price.salePrice
            ?? (purchaseMode === "amount" ? amountValidation.value : selectedPlan?.price?.salePrice)
            ?? 0;
        const serviceName = selectedPlan
            ? `${selectedIdentity?.name || "Broadband"} - ${selectedPlan.name}`
            : selectedIdentity?.name || "Broadband";

        navigate("/app/services/status", {
            state: createOwnedRouteState(getSessionIdentity(user), {
                status,
                message,
                transaction: {
                    service: serviceName,
                    amount: transactionAmount,
                    target: prepared?.normalizedIdentifier || identifierValidation.normalized,
                    reference,
                    timestamp: new Date().toLocaleTimeString()
                }
            })
        });
    };

    const handleConfirm = async (pin: string) => {
        if (purchaseInFlightRef.current || purchasing) return;
        const prepared = currentVerification;
        const expiresAt = Date.parse(prepared?.result.expiresAt || "");
        if (!prepared
            || prepared.attemptId !== purchaseAttemptIdRef.current
            || !Number.isFinite(expiresAt)
            || expiresAt <= Date.now()) {
            setPinError("Your Broadband verification has expired. Please verify again.");
            setShowPinModal(false);
            invalidateVerificationContext();
            return;
        }

        purchaseInFlightRef.current = true;
        setPurchasing(true);
        setPinError(null);

        const body: Record<string, unknown> = {
            verificationContext: prepared.result.verificationContext,
            pin,
            expectedPrice: prepared.result.price.salePrice
        };
        if (purchaseMode === "amount") body.amount = prepared.amount;

        try {
            const response = await apiClient.post("/services/broadband", body, {
                headers: { "Idempotency-Key": prepared.result.idempotencyKey },
                timeout: 30000
            });
            const result = getVtuPurchasePresentation(
                normalizeVtuPurchaseResponse(response),
                "Broadband purchase successful.",
                "Broadband purchase failed."
            );

            if (!mountedRef.current) return;

            if (result.status === "failed") {
                void fetchBalance();
                setShowPinModal(false);
                navigateToStatus(
                    "timeout",
                    "We could not confirm the final status of this Broadband purchase. Do not make the purchase again while its status is being checked.",
                    result.reference
                );
                return;
            }

            if (result.status === "pending") void fetchBalance();
            else await fetchBalance();
            if (!mountedRef.current) return;
            setShowPinModal(false);
            navigateToStatus(result.status, result.message, result.reference);
        } catch (error: any) {
            if (!mountedRef.current) return;
            const isTimeout = error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout");
            const responseCode = error.response?.data?.error || error.response?.data?.code;
            const responseStatus = Number(error.response?.status);
            const uncertainOutcome = isTimeout
                || !error.response
                || responseStatus === 408
                || responseStatus === 500
                || responseStatus === 502
                || responseStatus === 504
                || responseCode === "BROADBAND_PURCHASE_UNAVAILABLE";
            if (uncertainOutcome) {
                void fetchBalance();
                setShowPinModal(false);
                navigateToStatus(
                    "timeout",
                    "This transaction is taking longer than expected. Do not make the purchase again while its status is being confirmed."
                );
                return;
            }

            const message = error.response?.data?.message || "Broadband purchase failed.";
            if (responseCode === "PRICE_CHANGED"
                || responseCode === "INVALID_BROADBAND_CONTEXT"
                || responseCode === "IDEMPOTENCY_CONFLICT"
                || (responseStatus === 409 && !responseCode)) {
                invalidateVerificationContext();
                setVerificationError(message);
                setShowPinModal(false);
            } else if (error.response?.status === 400 && !responseCode) {
                resetAfterDefinitiveFailure(message);
            } else {
                const contextExpired = Date.parse(prepared.result.expiresAt) <= Date.now();
                if (contextExpired) {
                    invalidateVerificationContext();
                    setVerificationError("Your Broadband verification has expired. Please verify again.");
                    setShowPinModal(false);
                } else {
                    setPinError(message);
                }
            }
            toast.error(message);
        } finally {
            purchaseInFlightRef.current = false;
            if (mountedRef.current) setPurchasing(false);
        }
    };

    const identifierKind = selectedIdentity?.identifierPolicy?.kind;
    const inputType = identifierKind === "email" ? "email" : identifierKind === "phone" ? "tel" : "text";
    const inputMode = identifierKind === "numeric" ? "numeric" : identifierKind === "phone" ? "tel" : identifierKind === "email" ? "email" : "text";
    const quote = currentVerification?.result.price;
    const displayedPlanPrice = selectedPlan?.price?.salePrice;
    const displayedCurrency = quote?.currency || selectedPlan?.price?.currency || selectedIdentity?.amountPolicy?.currency || "NGN";
    const displayedAmount = quote?.salePrice
        ?? (purchaseMode === "plan" ? displayedPlanPrice : amountValidation.value);
    const insufficient = quote ? quote.salePrice > balance : purchaseMode === "plan" && Number.isFinite(displayedPlanPrice) && Number(displayedPlanPrice) > balance;
    const canContinue = Boolean(
        selectedIdentity
        && !identityAvailabilityError
        && !identifierValidation.error
        && (purchaseMode !== "plan" || (
            !plansLoading
            && Boolean(selectedPlan)
            && getCanonicalId(selectedPlan?.serviceIdentityId) === selectedIdentityId
        ))
        && (purchaseMode !== "amount" || !amountValidation.error)
        && (verificationMode !== "required" || currentVerification?.result.verified)
        && !insufficient
    );
    const interactionLocked = purchasing || verificationLoading;

    return (
        <PurchaseLayout title="Broadband" subtitle="Pay for broadband plans and internet services securely.">
            <form onSubmit={handleInitiate}>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Internet Service</p>
                            {identitiesLoading ? (
                                <div className="flex gap-3 flex-wrap">
                                    {Array.from({ length: 3 }, (_, index) => (
                                        <div key={index} className="w-28 h-24 bg-slate-100 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : identityLoadError ? (
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm font-semibold text-red-700">
                                    {identityLoadError}
                                </div>
                            ) : identities.length === 0 ? (
                                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm font-semibold text-slate-500">
                                    No Broadband services are currently available.
                                </div>
                            ) : (
                                <div className="flex gap-3 flex-wrap">
                                    {identities.map(identity => {
                                        const identityId = getIdentityId(identity);
                                        const selected = selectedIdentityId === identityId;
                                        const logoUrl = identity.brandId?.logoUrl || identity.brand?.logoUrl;
                                        return (
                                            <button
                                                key={identityId}
                                                type="button"
                                                onClick={() => handleIdentityChange(identity)}
                                                disabled={interactionLocked}
                                                className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 p-3 w-28 h-24 rounded-2xl font-bold transition-all border-2 disabled:cursor-not-allowed disabled:opacity-60 ${selected
                                                    ? "bg-emerald-50 border-emerald-500 shadow-lg text-emerald-900"
                                                    : "bg-surface text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                                }`}
                                            >
                                                {logoUrl ? (
                                                    <img src={logoUrl} alt={identity.name} className="w-10 h-10 object-contain rounded-full bg-surface shadow-sm" />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${selected ? "bg-emerald-200 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                                                        {identity.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-[11px] text-center leading-tight line-clamp-2 w-full">{identity.name}</span>
                                                {selected && <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {identityAvailabilityError && selectedIdentity && (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start text-amber-800">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold">Service temporarily unavailable</p>
                                    <p className="text-xs font-medium mt-1">{identityAvailabilityError}</p>
                                </div>
                            </div>
                        )}

                        {selectedIdentity && !getIdentifierConfigurationError(selectedIdentity.identifierPolicy) && (
                            <Row label={selectedIdentity.identifierPolicy?.label || "Customer Identifier"}>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Wifi size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            type={inputType}
                                            inputMode={inputMode}
                                            autoComplete={identifierKind === "email" ? "email" : "off"}
                                            placeholder={selectedIdentity.identifierPolicy?.placeholder || ""}
                                            value={identifier}
                                            onChange={event => handleIdentifierChange(event.target.value)}
                                            onBlur={() => setIdentifierTouched(true)}
                                            disabled={interactionLocked}
                                            className={`${verificationMode !== "none" ? "pl-12 pr-24" : "pl-12"}`}
                                            required
                                        />
                                        {verificationMode !== "none" && (
                                            <button
                                                type="button"
                                                onClick={handleVerify}
                                                disabled={interactionLocked || Boolean(identifierValidation.error) || Boolean(currentVerification)}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${currentVerification
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-brand-emerald text-white hover:bg-brand-emerald-600 disabled:opacity-40"
                                                }`}
                                            >
                                                {verificationLoading ? "..." : currentVerification ? "Ready" : "Verify"}
                                            </button>
                                        )}
                                    </div>
                                    {identifierTouched && identifierValidation.error && (
                                        <p className="text-xs font-semibold text-red-600">{identifierValidation.error}</p>
                                    )}
                                    {currentVerification && (
                                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                                            {currentVerification.result.verified ? (
                                                <UserCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                            ) : (
                                                <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                                                    {currentVerification.result.verified ? "Customer verified" : "Purchase details ready"}
                                                </p>
                                                {currentVerification.result.customerName && (
                                                    <p className="text-sm font-black text-emerald-900 break-words">{currentVerification.result.customerName}</p>
                                                )}
                                                {currentVerification.result.identifierMasked && (
                                                    <p className="text-xs font-mono font-semibold text-emerald-700 mt-1">{currentVerification.result.identifierMasked}</p>
                                                )}
                                                {currentVerification.result.message && !currentVerification.result.customerName && (
                                                    <p className="text-xs font-semibold text-emerald-800 mt-1">{currentVerification.result.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {verificationError && !currentVerification && (
                                        <p className="text-xs font-semibold text-red-600">{verificationError}</p>
                                    )}
                                </div>
                            </Row>
                        )}

                        {purchaseMode === "plan" && !identityAvailabilityError && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Plans</p>
                                {plansLoading ? (
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {Array.from({ length: 4 }, (_, index) => (
                                            <div key={index} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : plansError ? (
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm font-semibold text-red-700">{plansError}</div>
                                ) : plans.length === 0 ? (
                                    <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm font-semibold text-slate-500">
                                        No Broadband plans are currently available.
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                                        {plans.map(plan => {
                                            const planId = getPlanId(plan);
                                            const selected = planId === selectedPlanId;
                                            const salePrice = plan.price?.salePrice;
                                            return (
                                                <button
                                                    key={planId}
                                                    type="button"
                                                    onClick={() => handlePlanChange(planId)}
                                                    disabled={interactionLocked || !planId}
                                                    className={`text-left p-4 rounded-2xl border-2 transition-all disabled:opacity-50 ${selected
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                                        : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200"
                                                    }`}
                                                >
                                                    <p className="font-bold text-sm leading-tight">{plan.name}</p>
                                                    {Number.isFinite(salePrice) && (
                                                        <div className="flex items-baseline gap-2 mt-2">
                                                            <span className="font-black text-base">{formatMoney(Number(salePrice), plan.price?.currency)}</span>
                                                            {Number(plan.price?.referencePrice) > Number(salePrice) && (
                                                                <span className="text-[10px] text-slate-400 line-through">{formatMoney(Number(plan.price?.referencePrice), plan.price?.currency)}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {purchaseMode === "amount" && !identityAvailabilityError && selectedIdentity?.amountPolicy && (
                            <Row label="Amount">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">NGN</span>
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={event => handleAmountChange(event.target.value)}
                                            onBlur={() => setAmountTouched(true)}
                                            disabled={interactionLocked}
                                            className="pl-16 text-lg font-black"
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        Minimum {formatMoney(Number(selectedIdentity.amountPolicy.min), selectedIdentity.amountPolicy.currency)}, maximum {formatMoney(Number(selectedIdentity.amountPolicy.max), selectedIdentity.amountPolicy.currency)}, in steps of {formatMoney(Number(selectedIdentity.amountPolicy.step), selectedIdentity.amountPolicy.currency)}.
                                    </p>
                                    {amountTouched && amountValidation.error && (
                                        <p className="text-xs font-semibold text-red-600">{amountValidation.error}</p>
                                    )}
                                </div>
                            </Row>
                        )}

                        <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start border border-slate-100">
                            <Info size={17} className="text-indigo-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Confirm the Internet Service and customer identifier before continuing. Pricing and fulfillment are confirmed securely by Zantara's server.
                            </p>
                        </div>
                    </div>

                    <div className="lg:w-80 space-y-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-5 sticky top-4 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Summary</p>

                            <div className="bg-surface border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                                {selectedIdentity && (selectedIdentity.brandId?.logoUrl || selectedIdentity.brand?.logoUrl) ? (
                                    <img
                                        src={selectedIdentity.brandId?.logoUrl || selectedIdentity.brand?.logoUrl}
                                        alt={selectedIdentity.name}
                                        className="w-11 h-11 object-contain rounded-full"
                                    />
                                ) : (
                                    <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                        <Wifi size={20} />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Internet Service</p>
                                    <p className="font-black text-slate-900 truncate">{selectedIdentity?.name || "-"}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">{selectedIdentity?.identifierPolicy?.label || "Identifier"}</span>
                                    <span className="font-bold text-slate-900 text-right font-mono break-all">
                                        {identifierValidation.normalized || identifier || "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">{purchaseMode === "amount" ? "Amount" : "Plan"}</span>
                                    <span className="font-bold text-slate-900 text-right">
                                        {purchaseMode === "amount"
                                            ? (amountValidation.value != null ? formatMoney(amountValidation.value, selectedIdentity?.amountPolicy?.currency) : "-")
                                            : selectedPlan?.name || "-"}
                                    </span>
                                </div>
                                {currentVerification && (
                                    <div className="flex justify-between gap-4 items-center">
                                        <span className="text-slate-500">Verification</span>
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                            <CheckCircle2 size={14} />
                                            {currentVerification.result.customerName || (currentVerification.result.verified ? "Verified" : "Ready")}
                                        </span>
                                    </div>
                                )}
                                {quote && Number(quote.savings) > 0 && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">Savings</span>
                                        <span className="font-bold text-emerald-600">{formatMoney(Number(quote.savings), quote.currency)}</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 pt-3 flex justify-between items-center gap-4">
                                    <div>
                                        <span className="font-bold text-slate-700">{quote ? "Amount Payable" : purchaseMode === "amount" ? "Entered Amount" : "Plan Price"}</span>
                                        {!quote && purchaseMode === "amount" && (
                                            <p className="text-[9px] text-slate-400 mt-0.5">Final charge confirmed by server</p>
                                        )}
                                    </div>
                                    <span className="font-black text-slate-900 text-lg text-right">
                                        {displayedAmount != null && Number.isFinite(Number(displayedAmount))
                                            ? formatMoney(Number(displayedAmount), displayedCurrency)
                                            : "-"}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200/60 pt-4 space-y-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wallet Balance</p>
                                <p className={`text-xl font-black tracking-tight ${insufficient ? "text-red-500" : "text-slate-900"}`}>
                                    {currency}{balance.toLocaleString()}
                                </p>
                                {insufficient && <p className="text-[10px] font-semibold text-red-500">Insufficient wallet balance</p>}
                            </div>

                            <div className="[&>button]:w-full">
                                <SubmitButton
                                    loading={verificationLoading}
                                    disabled={!canContinue || purchasing || identitiesLoading || plansLoading}
                                >
                                    Continue
                                </SubmitButton>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <SecurePinModal
                isOpen={showPinModal}
                onClose={() => {
                    if (purchasing) return;
                    setShowPinModal(false);
                    setPinError(null);
                }}
                onConfirm={handleConfirm}
                loading={purchasing}
                error={pinError}
                title="Authorize Broadband Purchase"
            />
        </PurchaseLayout>
    );
};

export default UserBuyBroadbandPage;
