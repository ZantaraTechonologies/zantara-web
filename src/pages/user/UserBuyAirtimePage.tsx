import React, { useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useAuthStore } from "../../store/auth/authStore";
import { useNavigate } from "react-router-dom";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-toastify";
import { Zap, Phone, AlertCircle } from "lucide-react";

const NETWORKS = [
    { id: "mtn", label: "MTN", color: "bg-amber-400", textColor: "text-amber-900", ring: "ring-amber-400", emoji: "🟡" },
    { id: "airtel", label: "Airtel", color: "bg-red-500", textColor: "text-white", ring: "ring-red-500", emoji: "🔴" },
    { id: "glo", label: "Glo", color: "bg-green-500", textColor: "text-white", ring: "ring-green-500", emoji: "🟢" },
    { id: "9mobile", label: "9mobile", color: "bg-teal-500", textColor: "text-white", ring: "ring-teal-500", emoji: "🔵" },
] as const;

const NETWORK_PREFIXES: Record<string, string[]> = {
    mtn: ['0803', '0806', '0814', '0810', '0813', '0816', '0703', '0706', '0903', '0906', '0913', '0916', '0704'],
    airtel: ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901', '0912', '0911'],
    glo: ['0805', '0807', '0811', '0705', '0905', '0915'],
    "9mobile": ['0809', '0818', '0817', '0909', '0908'],
};

const UserBuyAirtimePage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [network, setNetwork] = useState(NETWORKS[0].id);
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [networkWarning, setNetworkWarning] = useState(false);

    React.useEffect(() => {
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
        const cleanVal = val.replace(/\D/g, '').slice(0, 11);
        setPhone(cleanVal);
        
        // Auto select if first 4 digits typed 
        if (cleanVal.length === 4) {
             let detectedNetwork: string | null = null;
             Object.keys(NETWORK_PREFIXES).forEach(net => {
                 if (NETWORK_PREFIXES[net].includes(cleanVal)) {
                     detectedNetwork = net;
                 }
             });
             if (detectedNetwork) setNetwork(detectedNetwork);
        }
    };

    const selectedNetwork = NETWORKS.find(n => n.id === network) || NETWORKS[0];
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
            toast.error(`Minimum airtime purchase is ${currency}100`);
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
        const serviceTitle = `${selectedNetwork.label} Airtime VTU`;
        try {
            const res = await vtuService.buyAirtime({
                serviceID: network,
                amount: Number(amount),
                phone,
                pin
            });
            await fetchBalance();
            navigate('/app/services/status', {
                state: {
                    status: 'success',
                    message: res.message || 'Airtime purchase successful.',
                    transaction: { service: serviceTitle, amount: finalAmount, target: phone, reference: res.data?.reference || res.data?.requestId, timestamp: new Date().toLocaleTimeString() }
                }
            });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Purchase failed. Check your connection.";
            toast.error(msg);
            navigate('/app/services/status', {
                state: { status: 'error', message: msg, transaction: { service: serviceTitle, amount: finalAmount, target: phone, timestamp: new Date().toLocaleTimeString() } }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout title="Buy Airtime" subtitle="Top up any mobile network instantly.">
            <form onSubmit={handleInitiate}>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT: Form */}
                    <div className="flex-1 space-y-6">
                        {/* Network Icon Pills */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Network Provider</p>
                            <div className="flex gap-3 flex-wrap">
                                {NETWORKS.map(net => (
                                    <button
                                        key={net.id}
                                        type="button"
                                        onClick={() => setNetwork(net.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                                            network === net.id
                                                ? `${net.color} ${net.textColor} border-transparent shadow-lg scale-105`
                                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        <span className="text-base">{net.emoji}</span>
                                        <span>{net.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Phone Number */}
                        <Row label="Recipient Number">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="08012345678"
                                        value={phone}
                                        onChange={(e: any) => handlePhoneChange(e.target.value)}
                                        className="pl-12"
                                        required maxLength={11} type="tel"
                                    />
                                </div>
                                {networkWarning && (
                                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle size={12} />
                                        Heads up: Number prefix doesn't match {selectedNetwork.label} (Unless ported)
                                    </p>
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

                        {/* Amount */}
                        <Row label={`Amount (${currency})`}>
                            <div className="relative">
                                <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input type="number" placeholder={`Min ${currency}100`} value={amount}
                                    onChange={(e: any) => setAmount(e.target.value)} className="pl-12" required />
                            </div>
                        </Row>

                        {/* Disclaimer */}
                        <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start border border-slate-100">
                            <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                VTU airtime drops within 1–5 seconds. Verify the recipient number — airtime is irreversible.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Summary & Pay */}
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
                                    <span className="text-slate-500">Amount</span>
                                    <span className="font-bold text-slate-900">{currency}{Number(amount || 0).toLocaleString()}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span className="font-medium">Agent Discount (3%)</span>
                                        <span className="font-bold">-{currency}{(Number(amount || 0) * discount).toLocaleString()}</span>
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

                            <SubmitButton loading={loading} disabled={loading || insufficient || !amount || !phone}>
                                Pay {currency}{finalAmount.toLocaleString()}
                            </SubmitButton>
                        </div>
                    </div>
                </div>
            </form>

            <SecurePinModal isOpen={showPinModal} onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirm} loading={loading} title={`Verify ${selectedNetwork.label} Airtime`} />
        </PurchaseLayout>
    );
};

export default UserBuyAirtimePage;
