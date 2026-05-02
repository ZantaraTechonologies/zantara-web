import React, { useState, useEffect, useMemo } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useAuthStore } from "../../store/auth/authStore";
import { useNavigate } from "react-router-dom";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-hot-toast";
import { Monitor, Tv, Phone, AlertCircle, Info, Search, UserCheck, TrendingUp } from "lucide-react";
import { ServiceSkeleton } from "../../components/feedback/Skeletons";
import apiClient from "../../services/api/apiClient";

const UserBuyCablePage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // DYNAMIC IDENTITIES (Kept)
    const [identities, setIdentities] = useState<any[]>([]);
    const [selectedIdentity, setSelectedIdentity] = useState<any | null>(null);
    const [identitiesLoading, setIdentitiesLoading] = useState(true);

    const [smartcard, setSmartcard] = useState("");
    const [plans, setPlans] = useState<any[]>([]);
    const [planId, setPlanId] = useState("");
    const [fetchingPlans, setFetchingPlans] = useState(false);
    const [purchasePlan, setPurchasePlan] = useState<any>(null);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [customerName, setCustomerName] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [previewPricing, setPreviewPricing] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    useEffect(() => {
        const loadIdentities = async () => {
            setIdentitiesLoading(true);
            try {
                const res = await apiClient.get('/services/identities?category=cable-tv');
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
            setCustomerName(null);
            setSmartcard("");
            try {
                const res = await vtuService.fetchDataPlans(selectedIdentity.slug);
                const fetchedPlans = res.data?.variations || (Array.isArray(res.data) ? res.data : []);
                setPlans(fetchedPlans);
            } catch (err) {
                toast.error("Could not load plans.");
            } finally {
                setFetchingPlans(false);
            }
        };
        loadPlans();
    }, [selectedIdentity]);

    const handleVerifySmartcard = async () => {
        if (!smartcard || !selectedIdentity) return;
        setVerifying(true);
        setCustomerName(null);
        try {
            const res = await vtuService.verifyMerchant({
                serviceID: selectedIdentity.slug,
                billersCode: smartcard
            });
            if (res.data?.content?.Customer_Name) {
                setCustomerName(res.data.content.Customer_Name);
                toast.success(`Verified: ${res.data.content.Customer_Name}`);
            } else {
                toast.error("Could not verify smartcard number.");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const selectedPlan = useMemo(() => {
        const p = plans.find(p => p.variation_code === planId);
        if (p) setPurchasePlan(p);
        return p;
    }, [plans, planId]);
    
    const originalAmount = Number(selectedPlan?.variation_amount || 0);
    const finalAmount = previewPricing?.data?.salePrice || 0;
    const insufficient = finalAmount > balance && originalAmount > 0;

    useEffect(() => {
        if (selectedPlan && selectedPlan.variation_code) {
            const fetchPreview = async () => {
                setPreviewLoading(true);
                setPreviewPricing(null);
                setPreviewError(false);
                try {
                    const amount = Number(selectedPlan.variation_amount) || 0;
                    const res = await vtuService.previewPrice(undefined, amount, selectedPlan.variation_code);
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
    }, [selectedPlan]);

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!smartcard) {
            toast.error("Enter smartcard number");
            return;
        }
        if (!planId) {
            toast.error("Select a subscription plan");
            return;
        }
        if (insufficient) {
            toast.error("Insufficient wallet balance");
            return;
        }
        if (!customerName) {
            toast.error("Please verify smartcard first");
            return;
        }
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setPinError(null);
        try {
            const res = await vtuService.buyCable({ 
                serviceID: selectedIdentity.slug, 
                variation_code: purchasePlan.variation_code, 
                amount: Number(purchasePlan.variation_amount), 
                phone: smartcard, 
                billersCode: smartcard,
                pin, 
                expectedPrice: finalAmount 
            });
            await fetchBalance();
            setShowPinModal(false);
            navigate('/app/services/status', { 
                state: { 
                    status: 'success', 
                    message: res.message || 'Subscription successful.', 
                    transaction: { 
                        service: `${selectedIdentity.name} - ${purchasePlan.name}`, 
                        amount: Number(purchasePlan.variation_amount), 
                        target: smartcard, 
                        reference: res.data?.reference || res.data?.requestId, 
                        timestamp: new Date().toLocaleTimeString() 
                    } 
                } 
            });
        } catch (err: any) {
            setPinError(err.response?.data?.message || "Subscription failed.");
            toast.error(err.response?.data?.message || "Subscription failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout title="Cable TV" subtitle="Renew your subscription instantly.">
            <form onSubmit={handleInitiate}>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Provider</p>
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

                        <Row label="Smartcard Number">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Monitor size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input placeholder="Enter decoder number" value={smartcard}
                                        onChange={(e: any) => setSmartcard(e.target.value.replace(/\D/g, ''))}
                                        className="pl-12" required type="tel" />
                                    <button 
                                        type="button"
                                        onClick={handleVerifySmartcard}
                                        disabled={verifying || !smartcard}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-4 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all"
                                    >
                                        {verifying ? '...' : 'Verify'}
                                    </button>
                                </div>
                                {customerName && (
                                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-3">
                                        <UserCheck size={16} className="text-emerald-500" />
                                        <p className="text-xs font-bold text-emerald-700 uppercase">{customerName}</p>
                                    </div>
                                )}
                            </div>
                        </Row>

                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Packages</p>
                            {fetchingPlans ? (
                                <div className="space-y-2">
                                    {Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                                    {plans.length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">No packages found</p>
                                    ) : (
                                        plans.map((plan: any) => (
                                            <button key={plan.variation_code} type="button"
                                                onClick={() => setPlanId(plan.variation_code)}
                                                className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                                                    planId === plan.variation_code
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200'
                                                }`}>
                                                <span className="font-bold text-xs truncate mr-2">{plan.name}</span>
                                                <span className="font-extrabold text-xs shrink-0">{currency}{Number(plan.variation_amount).toLocaleString()}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start border border-slate-100">
                            <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Ensure your decoder is turned on during renewal. activation is typically instant.
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
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Decoder ID</span>
                                    <span className="font-bold text-slate-900 font-mono">{smartcard || '—'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Package</span>
                                        <span className="font-bold text-slate-900 text-right max-w-[120px] truncate leading-tight">{selectedPlan?.name || '—'}</span>
                                    </div>
                                    <div className="flex justify-end">
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/10">
                                            <TrendingUp size={10} />
                                            Your Discount: {currency}{(previewPricing?.data?.savings || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-slate-700">Total</span>
                                    <div className="text-right">
                                        {previewLoading ? (
                                             <div className="w-16 h-5 bg-slate-200 animate-pulse rounded"></div>
                                        ) : previewError ? (
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

                            <SubmitButton loading={loading} disabled={loading || insufficient || fetchingPlans || !planId || !smartcard || !customerName || previewLoading || previewError}>
                                Activate Subscription
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
                title={`Verify ${selectedIdentity?.name} Renewal`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyCablePage;
