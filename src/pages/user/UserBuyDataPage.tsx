import React, { FormEvent, useEffect, useMemo, useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth/authStore";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-toastify";
import { Wifi, Phone, AlertCircle, Info } from "lucide-react";

const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"] as const;
const SERVICE_ID_MAP: Record<(typeof NETWORKS)[number], string> = {
    MTN: "mtn-data",
    Airtel: "airtel-data",
    Glo: "glo-data",
    "9mobile": "9mobile-data",
};

const UserBuyDataPage: React.FC = () => {
    const { balance, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [network, setNetwork] = useState<(typeof NETWORKS)[number]>("MTN");
    const [plans, setPlans] = useState<any[]>([]);
    const [planId, setPlanId] = useState("");
    const [phone, setPhone] = useState("");
    
    const [fetchingPlans, setFetchingPlans] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const to234 = (v: string) => {
        const d = (v || "").replace(/\D+/g, "");
        if (!d) return "";
        if (d.startsWith("0")) return "234" + d.slice(1);
        if (d.startsWith("234")) return d;
        return d;
    };
    
    const isValidNgMobile = (v: string) => /^234[789]\d{9}$/.test(to234(v));
    const phoneOk = isValidNgMobile(phone);

    useEffect(() => {
        const loadPlans = async () => {
            setFetchingPlans(true);
            try {
                const res = await vtuService.fetchDataPlans(SERVICE_ID_MAP[network]);
                const fetchedPlans = res.data?.variations || res.data || [];
                setPlans(fetchedPlans);
                if (fetchedPlans.length > 0) {
                    setPlanId(fetchedPlans[0].variation_code || fetchedPlans[0].id);
                }
            } catch (err) {
                toast.error("Failed to load data plans");
            } finally {
                setFetchingPlans(false);
            }
        };
        loadPlans();
    }, [network]);

    const handleNetworkChange = (val: string) => {
        setNetwork(val as "MTN" | "Airtel" | "Glo" | "9mobile");
        setPlanId('');
        setPlans([]);
    };

    const selectedPlan = useMemo(() => 
        plans.find(p => (p.variation_code || p.id) === planId), 
    [plans, planId]);

    const isAgent = user?.roles?.includes('reseller') || user?.roles?.includes('agent');
    const basePrice = Number(selectedPlan?.variation_amount || selectedPlan?.price || 0);
    const discount = isAgent ? basePrice * 0.05 : 0;
    const amount = basePrice - discount;

    const insufficient = amount > balance || amount <= 0;

    const handleInitiate = (e: FormEvent) => {
        e.preventDefault();
        if (loading) return;
        if (!phoneOk) {
            toast.error("Valid phone number required");
            return;
        }
        if (insufficient) {
            toast.error("Insufficient balance");
            return;
        }
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setShowPinModal(false);

        const serviceTitle = `${network} ${selectedPlan?.name || 'Data'}`;

        try {
            const payload = {
                serviceID: SERVICE_ID_MAP[network],
                billersCode: to234(phone),
                variation_code: planId,
                amount,
                pin
            };
            const res = await vtuService.buyData(payload);
            
            await fetchBalance();
            navigate('/app/services/status', { 
                state: { 
                    status: 'success', 
                    message: res.message || 'Data purchase successful.',
                    transaction: {
                        service: serviceTitle,
                        amount,
                        target: to234(phone),
                        reference: res.data?.reference || res.data?.requestId || res.requestId,
                        timestamp: new Date().toLocaleTimeString()
                    }
                } 
            });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Purchase failed or timed out. Please check your transaction history.";
            toast.error(msg);

            navigate('/app/services/status', { 
                state: { 
                    status: err.code === 'ECONNABORTED' ? 'timeout' : 'error', 
                    message: msg,
                    transaction: {
                        service: serviceTitle,
                        amount,
                        target: to234(phone),
                        timestamp: new Date().toLocaleTimeString()
                    }
                } 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout 
            title="Buy Data" 
            subtitle="Secure high-speed bandwidth delivered instantly."
        >
            <form className="space-y-8" onSubmit={handleInitiate}>
                <div className="grid sm:grid-cols-2 gap-6">
                    <Row label="Provider">
                        <Select value={network} onChange={(e) => handleNetworkChange(e.target.value)}>
                            {NETWORKS.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </Select>
                    </Row>
                    <Row label="Select Plan">
                        <Select 
                            value={planId} 
                            onChange={(e) => setPlanId(e.target.value)}
                            disabled={fetchingPlans}
                        >
                            {fetchingPlans ? (
                                <option>Loading protocols...</option>
                            ) : (
                                plans.map((p) => (
                                    <option key={p.variation_code || p.id} value={p.variation_code || p.id}>
                                        {p.name} — ₦{Number(p.variation_amount || p.price).toLocaleString()}
                                    </option>
                                ))
                            )}
                        </Select>
                    </Row>
                </div>

                <Row label="Recipient Phone">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            <Phone size={18} />
                        </div>
                        <Input
                            type="tel"
                            placeholder="0801 234 5678"
                            value={phone}
                            onChange={(e: any) => setPhone(e.target.value)}
                            className="pl-12"
                            required
                        />
                    </div>
                </Row>

                {isAgent && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                        <Info size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                            Agent Protocol Active — 5% Settlement Discount Applied
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Payable</p>
                        <p className="text-xl font-bold text-slate-900">₦{amount.toLocaleString()}</p>
                    </div>
                    <SubmitButton loading={loading} disabled={loading || insufficient || !phoneOk || fetchingPlans}>
                        Activate Data
                    </SubmitButton>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-950 rounded-2xl text-slate-400">
                    <Wifi size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium leading-relaxed">
                        Data nodes refresh every 60 seconds. If your subscription hasn't arrived within 2 minutes, verify your phone number and network coverage.
                    </p>
                </div>
            </form>

            <SecurePinModal 
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirm}
                loading={loading}
                title={`Confirm ${network} Data`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyDataPage;
