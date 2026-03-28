import React, { useState, useEffect, useMemo } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useAuthStore } from "../../store/auth/authStore";
import { useNavigate } from "react-router-dom";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-toastify";
import { Wifi, Phone, AlertCircle, Info } from "lucide-react";
import { ServiceSkeleton } from "../../components/feedback/Skeletons";

const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"] as const;
const SERVICE_ID_MAP: Record<(typeof NETWORKS)[number], string> = {
    MTN: "mtn-data",
    Airtel: "airtel-data",
    Glo: "glo-data",
    "9mobile": "9mobile-data",
};

const UserBuyDataPage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [network, setNetwork] = useState<(typeof NETWORKS)[number]>("MTN");
    const [phone, setPhone] = useState("");
    const [plans, setPlans] = useState<any[]>([]);
    const [planId, setPlanId] = useState("");
    const [fetchingPlans, setFetchingPlans] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadPlans = async () => {
            setFetchingPlans(true);
            try {
                const res = await vtuService.fetchDataPlans(SERVICE_ID_MAP[network]);
                setPlans(res.data?.variations || res.data || []);
                setPlanId("");
            } catch (err) {
                console.error("Failed to fetch data plans", err);
                toast.error(`Could not load ${network} plans.`);
            } finally {
                setFetchingPlans(false);
            }
        };
        loadPlans();
    }, [network]);

    const handleNetworkChange = (val: string) => {
        setNetwork(val as any);
    };

    const selectedPlan = useMemo(() => 
        plans.find((p) => p.variation_code === planId), 
    [plans, planId]);

    const discount = user?.role === 'agent' ? 0.05 : 0;
    const originalAmount = Number(selectedPlan?.variation_amount || 0);
    const finalAmount = originalAmount * (1 - discount);
    const insufficient = finalAmount > balance;

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        
        const phoneRegex = /^(070|080|081|090|091|071|082|092)\d{8}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("Please enter a valid 11-digit Nigerian phone number");
            return;
        }

        if (!planId) {
            toast.error("Please select a data plan");
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
        setShowPinModal(false);

        const serviceTitle = `${network} Data - ${selectedPlan?.name}`;

        try {
            const res = await vtuService.buyData({
                serviceID: SERVICE_ID_MAP[network],
                variation_code: planId,
                phone,
                amount: finalAmount,
                pin
            });

            await fetchBalance();
            navigate('/app/services/status', {
                state: {
                    status: 'success',
                    message: res.message || 'Data purchase successful.',
                    transaction: {
                        service: serviceTitle,
                        amount: finalAmount,
                        target: phone,
                        reference: res.data?.reference || res.data?.requestId || res.requestId,
                        timestamp: new Date().toLocaleTimeString()
                    }
                }
            });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Purchase failed. Check your connection.";
            toast.error(msg);
            navigate('/app/services/status', {
                state: {
                    status: 'error',
                    message: msg,
                    transaction: {
                        service: serviceTitle,
                        amount: finalAmount,
                        target: phone,
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
            {fetchingPlans && plans.length === 0 ? (
                <ServiceSkeleton />
            ) : (
                <form className="space-y-8" onSubmit={handleInitiate}>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Row label="Provider">
                            <Select value={network} onChange={(e) => handleNetworkChange(e.target.value)}>
                                {NETWORKS.map((net) => (
                                    <option key={net} value={net}>
                                        {net}
                                    </option>
                                ))}
                            </Select>
                        </Row>

                        <Row label="Mobile Number">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Phone size={18} />
                                </div>
                                <Input
                                    placeholder="08012345678"
                                    value={phone}
                                    onChange={(e: any) => setPhone(e.target.value)}
                                    className="pl-12"
                                    required
                                />
                            </div>
                        </Row>
                    </div>

                    <Row label="Select Plan">
                        <Select 
                            value={planId} 
                            onChange={(e) => setPlanId(e.target.value)}
                            disabled={fetchingPlans}
                        >
                            <option value="">Choose a data package...</option>
                            {plans.map((plan) => (
                                <option key={plan.variation_code} value={plan.variation_code}>
                                    {plan.name} — {currency}{Number(plan.variation_amount).toLocaleString()}
                                </option>
                            ))}
                        </Select>
                    </Row>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-8 border-t border-slate-50 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Balance</p>
                                <p className="text-sm font-bold text-slate-900">{currency}{balance.toLocaleString()}</p>
                            </div>
                            {discount > 0 && (
                                <div className="h-10 w-px bg-slate-100 mx-2"></div>
                            )}
                            {discount > 0 && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Agent Discount</p>
                                    <p className="text-xs font-bold text-emerald-600">5% Applied</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payable</p>
                             <SubmitButton loading={loading} disabled={loading || insufficient || fetchingPlans || !planId}>
                                Pay {currency}{finalAmount.toLocaleString()}
                            </SubmitButton>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start border border-white">
                        <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Data bundles are typically delivered within 60 seconds. Ensure the recipient number is correct as data purchases are irreversible once delivered.
                        </p>
                    </div>
                </form>
            )}

            <SecurePinModal 
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirm}
                loading={loading}
                title={`Verify ${network} Data`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyDataPage;
