import React, { FormEvent, useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-toastify";
import { Zap, Phone, AlertCircle } from "lucide-react";

const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"] as const;

const UserBuyAirtimePage: React.FC = () => {
    const { balance, fetchBalance } = useWalletStore();
    const navigate = useNavigate();

    const [network, setNetwork] = useState<(typeof NETWORKS)[number]>("MTN");
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    
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
    const insufficient = Number(amount || 0) > balance || Number(amount || 0) <= 0;

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        if (!phoneOk) {
            toast.error("Valid phone number required");
            return;
        }
        if (!amount || Number(amount) < 50) {
            toast.error("Minimum amount is ₦50");
            return;
        }
        if (Number(amount) > balance) {
            toast.error("Insufficient balance");
            return;
        }
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setShowPinModal(false);

        const serviceTitle = `${network} Airtime`;
        const purchaseAmount = Number(amount);

        try {
            const res = await vtuService.buyAirtime({
                network,
                amount: purchaseAmount,
                phone: to234(phone),
                pin
            });
            
            await fetchBalance();
            navigate('/app/services/status', { 
                state: { 
                    status: 'success', 
                    message: res.message || 'Airtime purchase successful.',
                    transaction: {
                        service: serviceTitle,
                        amount: purchaseAmount,
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
                        amount: purchaseAmount,
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
            title="Buy Airtime" 
            subtitle="Top up any mobile network instantly."
        >
            <form className="space-y-8" onSubmit={handleInitiate}>
                <div className="grid sm:grid-cols-2 gap-6">
                    <Row label="Network Provider">
                        <Select value={network} onChange={(e) => setNetwork(e.target.value as any)}>
                            {NETWORKS.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </Select>
                    </Row>
                    <Row label="Amount (₦)">
                        <Input
                            type="number"
                            placeholder="e.g. 500"
                            value={amount}
                            onChange={(e: any) => setAmount(e.target.value ? Number(e.target.value) : "")}
                            required
                        />
                    </Row>
                </div>

                <Row label="Beneficiary Phone">
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

                <div className="grid grid-cols-4 gap-3">
                    {[100, 200, 500, 1000].map((val) => (
                        <button 
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className="py-3 text-[10px] font-bold border border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all uppercase tracking-widest text-slate-500 hover:text-emerald-600"
                        >
                            ₦{val}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Cost</p>
                        <p className="text-xl font-bold text-slate-900">₦{Number(amount || 0).toLocaleString()}</p>
                    </div>
                    <SubmitButton loading={loading} disabled={loading || insufficient || !phoneOk}>
                        Purchase Airtime
                    </SubmitButton>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-4 border border-white">
                    <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Airtime is typically delivered within 30 seconds. In case of delays, our automated trace will retry the node up to 3 times.
                    </p>
                </div>
            </form>

            <SecurePinModal 
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirm}
                loading={loading}
                title={`Verify ${network} Airtime`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyAirtimePage;
