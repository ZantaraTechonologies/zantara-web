import React, { useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useAuthStore } from "../../store/auth/authStore";
import { useNavigate } from "react-router-dom";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-toastify";
import { Zap, Phone, AlertCircle, Info } from "lucide-react";
import { ServiceSkeleton } from "../../components/feedback/Skeletons";

const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"] as const;

const UserBuyAirtimePage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [network, setNetwork] = useState<(typeof NETWORKS)[number]>("MTN");
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const discount = user?.role === 'agent' ? 0.03 : 0;
    const finalAmount = Number(amount || 0) * (1 - discount);
    const insufficient = finalAmount > balance;

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        
        const phoneRegex = /^(070|080|081|090|091|071|082|092)\d{8}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("Please enter a valid 11-digit Nigerian phone number");
            return;
        }

        if (!amount || Number(amount) < 100) {
            toast.error("Minimum airtime purchase is ₦100");
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

        const serviceTitle = `${network} Airtime VTU`;

        try {
            const res = await vtuService.buyAirtime({
                serviceID: network.toLowerCase(),
                amount: Number(amount),
                phone,
                pin
            });

            await fetchBalance();
            navigate('/app/services/status', {
                state: {
                    status: 'success',
                    message: res.message || 'Airtime purchase successful.',
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
            title="Buy Airtime" 
            subtitle="Top up any mobile network instantly."
        >
            {loading && !showPinModal ? (
                <ServiceSkeleton />
            ) : (
                <form className="space-y-8" onSubmit={handleInitiate}>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Row label="Network Provider">
                            <Select value={network} onChange={(e) => setNetwork(e.target.value as any)}>
                                {NETWORKS.map((net) => (
                                    <option key={net} value={net}>
                                        {net}
                                    </option>
                                ))}
                            </Select>
                        </Row>

                        <Row label="Recipient Number">
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

                    <Row label="Amount (₦)">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Zap size={18} />
                            </div>
                            <Input
                                type="number"
                                placeholder={`Enter amount (Min ${currency}100)`}
                                value={amount}
                                onChange={(e: any) => setAmount(e.target.value)}
                                className="pl-12"
                                required
                            />
                        </div>
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
                                    <p className="text-xs font-bold text-emerald-600">3% Applied</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Cost</p>
                             <SubmitButton loading={loading} disabled={loading || insufficient || !amount}>
                                Pay {currency}{finalAmount.toLocaleString()}
                            </SubmitButton>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start border border-white">
                        <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            VTU airtime typically drops within 1-5 seconds. Please cross-check the recipient number as airtime transactions are irreversible.
                        </p>
                    </div>
                </form>
            )}

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
