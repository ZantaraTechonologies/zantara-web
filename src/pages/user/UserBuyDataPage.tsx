import React, { useState, useEffect, useMemo } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useAuthStore } from "../../store/auth/authStore";
import { useNavigate } from "react-router-dom";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-hot-toast";
import { Wifi, Phone, AlertCircle, Info } from "lucide-react";
import { ServiceSkeleton } from "../../components/feedback/Skeletons";

const NETWORKS = [
    { id: "mtn-data", label: "MTN", color: "bg-amber-400", textColor: "text-amber-900", ring: "ring-amber-400", emoji: "🟡" },
    { id: "airtel-data", label: "Airtel", color: "bg-red-500", textColor: "text-white", ring: "ring-red-500", emoji: "🔴" },
    { id: "glo-data", label: "Glo", color: "bg-green-500", textColor: "text-white", ring: "ring-green-500", emoji: "🟢" },
    { id: "9mobile-data", label: "9mobile", color: "bg-teal-500", textColor: "text-white", ring: "ring-teal-500", emoji: "🔵" },
] as const;

const NETWORK_PREFIXES: Record<string, string[]> = {
    "mtn-data": ['0803', '0806', '0814', '0810', '0813', '0816', '0703', '0706', '0903', '0906', '0913', '0916', '0704'],
    "airtel-data": ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901', '0912', '0911'],
    "glo-data": ['0805', '0807', '0811', '0705', '0905', '0915'],
    "9mobile-data": ['0809', '0818', '0817', '0909', '0908'],
};

const PLAN_CATEGORIES = ["All", "Daily", "Weekly", "Monthly", "SME"] as const;

function categorizePlan(name: string): string {
    const n = name.toLowerCase();
    if (n.includes("sme") || n.includes("corporate")) return "SME";
    if (n.includes("daily") || n.includes("1 day") || n.includes("night")) return "Daily";
    if (n.includes("weekly") || n.includes("7 day") || n.includes("week")) return "Weekly";
    if (n.includes("monthly") || n.includes("30 day") || n.includes("month")) return "Monthly";
    return "Monthly"; // default to Monthly for unlabelled plans
}

const UserBuyDataPage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [network, setNetwork] = useState<string>(NETWORKS[0].id);
    const [phone, setPhone] = useState("");
    const [plans, setPlans] = useState<any[]>([]);
    const [planId, setPlanId] = useState("");
    const [fetchingPlans, setFetchingPlans] = useState(false);
    const [purchasePlan, setPurchasePlan] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>("All");
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [networkWarning, setNetworkWarning] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (phone.length >= 4) {
            const prefix = phone.substring(0, 4);
            let detectedNetwork: string | null = null;
            Object.keys(NETWORK_PREFIXES).forEach(net => {
                if (NETWORK_PREFIXES[net].includes(prefix)) {
                    detectedNetwork = net;
                }
            });

            if (detectedNetwork && detectedNetwork !== network) {
                 setNetworkWarning(true);
            } else {
                 setNetworkWarning(false);
            }
        } else {
            setNetworkWarning(false);
        }
    }, [phone, network]);

    const handlePhoneChange = (val: string) => {
        setFormError(null);
        const cleanVal = val.replace(/\D/g, '').slice(0, 11);
        setPhone(cleanVal);
        
        if (cleanVal.length === 4) {
             let detectedNetwork: string | null = null;
             Object.keys(NETWORK_PREFIXES).forEach(net => {
                 if (NETWORK_PREFIXES[net].includes(cleanVal)) {
                     detectedNetwork = net;
                 }
             });
             if (detectedNetwork) {
                 setNetwork(detectedNetwork);
             }
        }
    };

    useEffect(() => {
        const loadPlans = async () => {
            setFetchingPlans(true);
            setPlanId("");
            try {
                const res = await vtuService.fetchDataPlans(network);
                const fetchedPlans = res.data?.content?.variations || res.data?.variations || (Array.isArray(res.data) ? res.data : []);
                setPlans(fetchedPlans);
            } catch (err) {
                console.error("Failed to fetch data plans", err);
                toast.error("Could not load data plans.");
            } finally {
                setFetchingPlans(false);
            }
        };
        loadPlans();
    }, [network]);

    const selectedNetwork = NETWORKS.find(n => n.id === network) || NETWORKS[0];

    const filteredPlans = useMemo(() => {
        if (activeTab === "All") return plans;
        return plans.filter(p => categorizePlan(p.name || "") === activeTab);
    }, [plans, activeTab]);

    const selectedPlan = useMemo(() => {
        const p = plans.find(p => p.variation_code === planId);
        if (p) setPurchasePlan(p);
        return p;
    }, [plans, planId]);
    
    const discount = user?.role === 'agent' ? 0.05 : 0;
    const originalAmount = Number(selectedPlan?.variation_amount || 0);
    const finalAmount = originalAmount * (1 - discount);
    const insufficient = finalAmount > balance;

    const validateNetworkPrefix = (phone: string, network: string) => {
        const prefixes: Record<string, string[]> = {
            mtn: ['0803', '0806', '0814', '0810', '0813', '0816', '0703', '0706', '0903', '0906', '0913', '0916', '0704', '0702'],
            airtel: ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901', '0912', '0911', '0904'],
            glo: ['0805', '0807', '0811', '0705', '0905', '0915'],
            mobile9: ['0809', '0817', '0818', '0909', '0908'],
        };
        const ntwk = network.toLowerCase().replace('9mobile', 'mobile9');
        const list = prefixes[ntwk] || [];
        if (list.length === 0) return true;
        const prefix = phone.substring(0, 4);
        return list.includes(prefix);
    };

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        const phoneRegex = /^(070|080|081|090|091|071|082|092)\d{8}$/;
        if (!phoneRegex.test(phone)) {
            const err = "Enter a valid 11-digit Nigerian phone number";
            setFormError(err);
            toast.error(err);
            return;
        }
        if (!validateNetworkPrefix(phone, selectedNetwork.label)) {
            toast('Warning: Number does not map to ' + selectedNetwork.label + '. Verify if ported.', { icon: '⚠️', duration: 4000 });
            // Soft-warning bypass
        }
        if (!planId) {
            const err = "Please select a data plan";
            setFormError(err);
            toast.error(err);
            return;
        }
        if (insufficient) {
            const err = "Insufficient wallet balance";
            setFormError(err);
            toast.error(err);
            return;
        }
        setPinError(null);
        setFormError(null);
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setPinError(null);
        const serviceTitle = `${selectedNetwork.label} Data VTU`;
        try {
            const res = await vtuService.buyData({ serviceID: network, variation_code: purchasePlan.variation_code, amount: Number(purchasePlan.variation_amount), phone, pin });
            await fetchBalance();
            setShowPinModal(false);
            navigate('/app/services/status', { state: { status: 'success', message: res.message || 'Data purchase successful.', transaction: { service: serviceTitle, amount: Number(purchasePlan.variation_amount), target: phone, reference: res.data?.reference || res.data?.requestId, timestamp: new Date().toLocaleTimeString() } } });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Purchase failed.";
            setPinError(msg);
            setFormError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout title="Buy Data" subtitle="Secure high-speed bandwidth delivered instantly.">
            <form onSubmit={handleInitiate}>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT */}
                    <div className="flex-1 space-y-6">
                        {formError && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-red-700 animate-in slide-in-from-top-4 duration-500">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold">Transaction Error</p>
                                    <p className="text-xs font-medium opacity-90">{formError}</p>
                                </div>
                            </div>
                        )}
                        {/* Network Icons */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Network Provider</p>
                            <div className="flex gap-3 flex-wrap">
                                {NETWORKS.map(net => (
                                    <button key={net.id} type="button" onClick={() => setNetwork(net.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                                            network === net.id
                                                ? `${net.color} ${net.textColor} border-transparent shadow-lg scale-105`
                                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200'
                                        }`}>
                                        <span className="text-base">{net.emoji}</span>
                                        <span>{net.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Phone */}
                        <Row label="Mobile Number">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input placeholder="08012345678" value={phone}
                                        onChange={(e: any) => handlePhoneChange(e.target.value)}
                                        className="pl-12" required maxLength={11} type="tel" />
                                </div>
                                {networkWarning && (
                                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-start gap-2 text-amber-700 animate-in fade-in zoom-in duration-300 mt-3">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold">Network Mismatch Detected</p>
                                            <p className="text-[10px] font-medium opacity-90">This number typically belongs to another provider. If it was ported to {selectedNetwork.label}, you may proceed.</p>
                                        </div>
                                    </div>
                                )}
                                {(user?.phone || user?.phoneNumber) && (
                                    <button type="button" onClick={() => handlePhoneChange(user?.phone || user?.phoneNumber || "")}
                                        className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 flex items-center gap-1.5 mt-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                                        Use my registered number
                                    </button>
                                )}
                            </div>
                        </Row>

                        {/* Plan Category Tabs */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Data Plan</p>
                            {fetchingPlans ? (
                                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                            ) : (
                                <>
                                    {/* Tabs */}
                                    <div className="flex gap-2 mb-3 flex-wrap">
                                        {PLAN_CATEGORIES.map(tab => (
                                            <button key={tab} type="button" onClick={() => { setActiveTab(tab); setPlanId(""); }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    activeTab === tab
                                                        ? 'bg-slate-900 text-emerald-400 shadow-sm'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}>
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Plan Grid */}
                                    {filteredPlans.length === 0 ? (
                                        <p className="text-xs text-slate-400 font-medium py-4 text-center border border-dashed border-slate-200 rounded-xl">
                                            No {activeTab} plans available
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                            {filteredPlans.map((plan: any) => (
                                                <button key={plan.variation_code} type="button"
                                                    onClick={() => setPlanId(plan.variation_code)}
                                                    className={`text-left p-3 rounded-xl border-2 transition-all text-xs ${
                                                        planId === plan.variation_code
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                                            : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200'
                                                    }`}>
                                                    <p className="font-bold leading-tight line-clamp-2">{plan.name}</p>
                                                    <p className="font-extrabold text-sm mt-1">{currency}{Number(plan.variation_amount).toLocaleString()}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start border border-slate-100">
                            <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Data delivered within 60 seconds. Ensure the recipient number is correct — purchases are irreversible.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:w-72 space-y-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 sticky top-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Summary</p>

                            <div className={`w-full py-4 rounded-xl ${selectedNetwork.color} flex items-center justify-center`}>
                                <span className={`font-black text-lg ${selectedNetwork.textColor}`}>{selectedNetwork.label}</span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Recipient</span>
                                    <span className="font-bold text-slate-900 font-mono">{phone || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Plan</span>
                                    <span className="font-bold text-slate-900 text-right max-w-[120px] leading-tight">{selectedPlan?.name || '—'}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span className="font-medium">Agent Discount (5%)</span>
                                        <span className="font-bold">-{currency}{(originalAmount * discount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 pt-2 flex justify-between">
                                    <span className="font-bold text-slate-700">Total</span>
                                    <span className="font-extrabold text-slate-900">{currency}{finalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 space-y-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wallet Balance</p>
                                <p className={`text-base font-extrabold ${insufficient ? 'text-red-500' : 'text-slate-900'}`}>
                                    {currency}{balance.toLocaleString()}
                                </p>
                                {insufficient && <p className="text-[10px] text-red-500 font-bold">Insufficient balance</p>}
                            </div>

                            <SubmitButton loading={loading} disabled={loading || insufficient || fetchingPlans || !planId || !phone}>
                                Pay {currency}{finalAmount.toLocaleString()}
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
                title={`Verify ${selectedNetwork.label} Data`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyDataPage;
