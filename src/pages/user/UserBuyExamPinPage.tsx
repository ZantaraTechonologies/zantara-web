import React, { useState, useEffect, useMemo } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useAuthStore } from "../../store/auth/authStore";
import { useNavigate } from "react-router-dom";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-hot-toast";
import { GraduationCap, Info, AlertCircle, UserCheck, TrendingUp } from "lucide-react";
import apiClient from "../../services/api/apiClient";

const UserBuyExamPinPage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // DYNAMIC IDENTITIES
    const [identities, setIdentities] = useState<any[]>([]);
    const [selectedIdentity, setSelectedIdentity] = useState<any | null>(null);
    const [identitiesLoading, setIdentitiesLoading] = useState(true);

    const [plans, setPlans] = useState<any[]>([]);
    const [planId, setPlanId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [fetchingPlans, setFetchingPlans] = useState(false);
    const [purchasePlan, setPurchasePlan] = useState<any>(null);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [previewPricing, setPreviewPricing] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    // JAMB Specific
    const [profileCode, setProfileCode] = useState("");
    const [customerName, setCustomerName] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const isJamb = selectedIdentity?.slug?.toLowerCase().includes("jamb") || selectedIdentity?.name?.toLowerCase().includes("jamb");

    useEffect(() => {
        const loadIdentities = async () => {
            setIdentitiesLoading(true);
            try {
                const res = await apiClient.get('/services/identities?category=pin');
                setIdentities(res.data.data);
                if (res.data.data.length > 0) {
                    setSelectedIdentity(res.data.data[0]);
                }
            } catch (err) {
                toast.error("Failed to load providers");
            } finally {
                setIdentitiesLoading(false);
            }
        };
        loadIdentities();
    }, []);

    useEffect(() => {
        if (!selectedIdentity) return;
        const loadPlans = async () => {
            setFetchingPlans(true);
            setPlanId("");
            setProfileCode("");
            setCustomerName(null);
            try {
                const res = await vtuService.fetchDataPlans(selectedIdentity.slug);
                const fetchedPlans = res.data?.variations || (Array.isArray(res.data) ? res.data : []);
                setPlans(fetchedPlans);
            } catch (err) {
                toast.error("Could not load packages.");
            } finally {
                setFetchingPlans(false);
            }
        };
        loadPlans();
    }, [selectedIdentity]);

    const handleVerifyProfile = async () => {
        if (!profileCode || !selectedIdentity) return;
        setVerifying(true);
        setCustomerName(null);
        try {
            const res = await vtuService.verifyJambProfile(selectedIdentity.slug, profileCode);
            if (res.data?.content?.Customer_Name) {
                setCustomerName(res.data.content.Customer_Name);
                toast.success(`Verified: ${res.data.content.Customer_Name}`);
            } else {
                toast.error("Could not verify profile code.");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const currentPlan = useMemo(() => {
        const p = plans.find(p => p.variation_code === planId);
        if (p) setPurchasePlan(p);
        return p;
    }, [plans, planId]);
    
    const originalAmount = Number(currentPlan?.variation_amount || 0) * Number(quantity);
    const finalAmount = previewPricing?.data?.salePrice || originalAmount;
    const insufficient = finalAmount > balance && originalAmount > 0;

    useEffect(() => {
        if (currentPlan && currentPlan.variation_code) {
            const fetchPreview = async () => {
                setPreviewLoading(true);
                setPreviewPricing(null);
                setPreviewError(false);
                try {
                    const unitAmount = Number(currentPlan.variation_amount) || 0;
                    const res = await vtuService.previewPrice(undefined, unitAmount, currentPlan.variation_code, Number(quantity));
                    if (res && res.success) {
                        setPreviewPricing(res);
                    } else {
                        setPreviewError(true);
                    }
                } catch (e) {
                    setPreviewError(true);
                } finally {
                    setPreviewLoading(false);
                }
            };
            fetchPreview();
        } else {
            setPreviewPricing(null);
            setPreviewError(false);
        }
    }, [currentPlan, quantity]);

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!planId) {
            toast.error("Select an examination board");
            return;
        }
        if (isJamb && !customerName) {
            toast.error("Please verify JAMB profile code first");
            return;
        }
        if (insufficient) {
            toast.error("Insufficient wallet balance");
            return;
        }
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setPinError(null);
        try {
            const res = await vtuService.buyExamPin({ 
                serviceID: selectedIdentity.slug, 
                variation_code: purchasePlan.variation_code, 
                amount: Number(purchasePlan.variation_amount), 
                quantity: Number(quantity),
                phone: user?.phone || "08000000000", 
                billersCode: isJamb ? profileCode : undefined,
                pin, 
                expectedPrice: finalAmount 
            });
            await fetchBalance();
            setShowPinModal(false);
            navigate('/app/services/status', { 
                state: { 
                    status: 'success', 
                    message: res.message || 'PIN purchased successful.', 
                    transaction: { 
                        service: `${selectedIdentity.name} ${purchasePlan.name}`, 
                        amount: finalAmount, 
                        target: isJamb ? profileCode : (user?.phone || user?.email), 
                        reference: res.data?.reference || res.data?.requestId, 
                        token: res.data?.token || res.data?.purchased_code,
                        timestamp: new Date().toLocaleTimeString() 
                    } 
                } 
            });
        } catch (err: any) {
            setPinError(err.response?.data?.message || "Purchase failed.");
            toast.error(err.response?.data?.message || "Purchase failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout title="Exam PINs" subtitle="Purchase registration and result checking pins instantly.">
            <form onSubmit={handleInitiate}>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Examination Board</p>
                            <div className="flex gap-3 flex-wrap">
                                {identitiesLoading ? (
                                    <div className="flex gap-3">
                                        {Array(3).fill(0).map((_, i) => <div key={i} className="w-24 h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : identities.map(identity => (
                                    <button key={identity._id} type="button" onClick={() => setSelectedIdentity(identity)}
                                        className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 p-3 w-24 h-24 rounded-2xl font-bold text-sm transition-all border-2 ${
                                            selectedIdentity?._id === identity._id
                                                ? 'bg-emerald-50 border-emerald-500 shadow-lg scale-105 text-emerald-900'
                                                : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                        }`}>
                                        {identity.brandId?.logoUrl ? (
                                            <img src={identity.brandId.logoUrl} alt={identity.name} className="w-10 h-10 object-contain rounded-full bg-white shadow-sm" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${selectedIdentity?._id === identity._id ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                {identity.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-[11px] text-center leading-tight truncate w-full">{identity.name}</span>
                                        {selectedIdentity?._id === identity._id && (
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50 animate-pulse"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Package</p>
                            {fetchingPlans ? (
                                <div className="space-y-2">
                                    {Array(2).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {plans.length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">No PIN packages found</p>
                                    ) : (
                                        plans.map((plan: any) => (
                                            <button key={plan.variation_code} type="button"
                                                onClick={() => setPlanId(plan.variation_code)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                                                    planId === plan.variation_code
                                                        ? 'border-rose-500 bg-rose-50'
                                                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200'
                                                }`}>
                                                <span className="font-bold text-xs">{plan.name}</span>
                                                <span className="font-extrabold text-xs">{currency}{Number(plan.variation_amount).toLocaleString()}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {isJamb && (
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <UserCheck size={14} className="text-rose-500" />
                                    <span>JAMB Profile Verification</span>
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            placeholder="Enter 10-digit Profile Code" 
                                            value={profileCode}
                                            onChange={(e) => {
                                                setProfileCode(e.target.value);
                                                setCustomerName(null);
                                            }}
                                            className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl font-bold focus:border-rose-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleVerifyProfile}
                                        disabled={!profileCode || verifying || !!customerName}
                                        className="px-6 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {verifying ? 'Verifying...' : customerName ? 'Verified' : 'Verify'}
                                    </button>
                                </div>
                                {customerName && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <p className="text-xs text-emerald-700 font-bold">Candidate: {customerName}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <Row label="Quantity">
                            <div className="flex items-center gap-4">
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="10"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-20 p-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-center text-lg focus:border-rose-500 outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Bulk purchase supported</p>
                            </div>
                        </Row>

                        <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start border border-slate-100">
                            <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Purchased PINs are stored in your history. Verify board selection before payment.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:w-72 space-y-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 sticky top-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Summary</p>

                            <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-center font-bold text-slate-900">
                                {selectedIdentity?.name || '—'}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Board</span>
                                        <span className="font-bold text-slate-900 text-right max-w-[120px] truncate leading-tight">{currentPlan?.name || '—'}</span>
                                    </div>
                                    <div className="flex justify-end">
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/10">
                                            <TrendingUp size={10} />
                                            Your Discount: {currency}{(previewPricing?.data?.savings || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Qty</span>
                                    <span className="font-bold text-slate-900">x{quantity}</span>
                                </div>
                                
                                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-slate-700">Total</span>
                                    <div className="text-right">
                                        {previewLoading ? (
                                             <div className="w-16 h-5 bg-slate-200 animate-pulse rounded"></div>
                                        ) : (previewError && finalAmount === 0) ? (
                                             <span className="text-xs text-red-500 font-bold">Unavailable</span>
                                        ) : (
                                            <span className="font-extrabold text-slate-900">{currency}{finalAmount.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 space-y-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wallet Balance</p>
                                <p className={`text-base font-extrabold ${insufficient ? 'text-red-500' : 'text-slate-900'}`}>
                                    {currency}{balance.toLocaleString()}
                                </p>
                            </div>

                            <SubmitButton loading={loading} disabled={loading || insufficient || fetchingPlans || !planId || previewLoading || (previewError && finalAmount === 0)}>
                                Buy PIN
                            </SubmitButton>
                        </div>
                    </div>
                </div>
            </form>

            <SecurePinModal
                isOpen={showPinModal}
                onClose={() => { setShowPinModal(false); setPinError(null); }}
                onConfirm={handleConfirm}
                loading={loading}
                error={pinError}
                title={`Verify Exam PIN Purchase`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyExamPinPage;
