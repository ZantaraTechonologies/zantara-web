import React, { useState, useEffect } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SecurePinModal from '../../components/modals/SecurePinModal';
import { User, Zap, AlertCircle, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { ServiceSkeleton } from '../../components/feedback/Skeletons';

const FALLBACK_PROVIDERS = [
    { id: 'ikeja-electric', name: 'Ikeja Electric (IKEDC)' },
    { id: 'eko-electric', name: 'Eko Electric (EKEDC)' },
    { id: 'abuja-electric', name: 'Abuja Electric (AEDC)' },
    { id: 'kano-electric', name: 'Kano Electric (KEDCO)' },
    { id: 'phed', name: 'Port Harcourt Elec. (PHED)' },
    { id: 'jos-electric', name: 'Jos Electric (JED)' },
    { id: 'kaduna-electric', name: 'Kaduna Electric (KAEDCO)' },
    { id: 'enugu-electric', name: 'Enugu Electric (EEDC)' },
    { id: 'ibadan-electric', name: 'Ibadan Electric (IBEDC)' },
    { id: 'benin-electric', name: 'Benin Electric (BEDC)' },
    { id: 'aba-power', name: 'Aba Power (ABA)' },
];

const UserBuyElectricityPage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const navigate = useNavigate();

    const [providers, setProviders] = useState(FALLBACK_PROVIDERS);
    const [fetchingProviders, setFetchingProviders] = useState(true);
    const [provider, setProvider] = useState(FALLBACK_PROVIDERS[0].id);
    const [meterNumber, setMeterNumber] = useState('');
    const [meterType, setMeterType] = useState('prepaid');
    const [amount, setAmount] = useState<number | ''>('');
    const [phone, setPhone] = useState('');

    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProviders = async () => {
            try {
                const res = await vtuService.fetchDataPlans('electricity-bill');
                const fetched = res.data?.content?.variations || res.data?.variations || (Array.isArray(res.data) ? res.data : []);
                if (fetched.length > 0) {
                    const formatted = fetched.map((f: any) => ({ id: f.serviceID || f.id || f.variation_code, name: f.name || f.variation_name }));
                    setProviders(formatted);
                    setProvider(formatted[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch electricity providers", err);
            } finally {
                setFetchingProviders(false);
            }
        };
        loadProviders();
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!meterNumber || verifying) return;
        setVerifying(true);
        try {
            const res = await vtuService.verifyMerchant({ serviceID: provider, billersCode: meterNumber, type: meterType });
            const verified = res.data?.content || res.data;
            setVerifiedUser(verified);
            // Auto-fill phone from verified data
            if (verified?.Customer_Phone) setPhone(verified.Customer_Phone);
            setStep(2);
            toast.success("Meter verified successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Could not verify meter number");
        } finally {
            setVerifying(false);
        }
    };

    const handleReset = () => { setStep(1); setVerifiedUser(null); setPhone(''); };

    const handleInitiatePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) < 500) { toast.error(`Minimum purchase is ${currency}500`); return; }
        if (Number(amount) > balance) { toast.error("Insufficient wallet balance"); return; }
        if (!phone) { toast.error("Please enter a phone number"); return; }
        setShowPinModal(true);
    };

    const handleConfirmPurchase = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setShowPinModal(false);
        const providerName = providers.find(p => p.id === provider)?.name;
        const serviceTitle = `${providerName} (${meterType.toUpperCase()})`;
        const purchaseAmount = Number(amount);
        try {
            const res = await vtuService.buyElectricity({ serviceID: provider, billersCode: meterNumber, variation_code: meterType, amount: purchaseAmount, phone, pin });
            await fetchBalance();
            navigate('/app/services/status', { state: { status: 'success', message: res.message || 'Power purchase successful.', transaction: { service: serviceTitle, amount: purchaseAmount, target: meterNumber, reference: res.data?.reference || res.data?.requestId, timestamp: new Date().toLocaleTimeString(), token: res.data?.token || res.token } } });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Purchase failed.";
            toast.error(msg);
            navigate('/app/services/status', { state: { status: 'error', message: msg, transaction: { service: serviceTitle, amount: purchaseAmount, target: meterNumber, timestamp: new Date().toLocaleTimeString() } } });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout title="Electricity Bills" subtitle={step === 1 ? "Verify your meter to proceed." : "Confirm details and enter amount."}>
            {fetchingProviders ? (
                <ServiceSkeleton />
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT: Form */}
                    <div className="flex-1 space-y-6">
                        {step === 1 ? (
                            <form onSubmit={handleVerify} className="space-y-5">
                                <Row label="Electricity Provider">
                                    <Select value={provider} onChange={(e) => { setProvider(e.target.value); handleReset(); }}>
                                        {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </Select>
                                </Row>
                                <Row label="Meter Type">
                                    <Select value={meterType} onChange={(e) => { setMeterType(e.target.value); handleReset(); }}>
                                        <option value="prepaid">Prepaid</option>
                                        <option value="postpaid">Postpaid</option>
                                    </Select>
                                </Row>
                                <Row label="Meter Number">
                                    <div className="relative">
                                        <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input placeholder="Enter meter number" value={meterNumber}
                                            onChange={(e: any) => { const val = e.target.value.replace(/\D/g, '').slice(0, 15); setMeterNumber(val); handleReset(); }}
                                            className="pl-12" required maxLength={15} type="tel" />
                                    </div>
                                </Row>
                                <SubmitButton loading={verifying} disabled={verifying || !meterNumber}>
                                    Verify Meter
                                </SubmitButton>
                            </form>
                        ) : (
                            <form onSubmit={handleInitiatePurchase} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
                                <Row label={`Amount (${currency})`}>
                                    <div className="relative">
                                        <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input type="number" placeholder={`Min ${currency}500`} value={amount}
                                            onChange={(e: any) => setAmount(e.target.value)} className="pl-12" required />
                                    </div>
                                </Row>
                                <Row label="Phone Number (for token delivery)">
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input placeholder="08012345678" value={phone}
                                            onChange={(e: any) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                            className="pl-12" required maxLength={11} type="tel" />
                                    </div>
                                </Row>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wallet Balance</p>
                                        <p className={`font-extrabold ${Number(amount) > balance ? 'text-red-500' : 'text-slate-900'}`}>
                                            {currency}{balance.toLocaleString()}
                                        </p>
                                    </div>
                                    <SubmitButton loading={loading} disabled={loading || !amount || Number(amount) > balance || !phone}>
                                        Pay {currency}{Number(amount || 0).toLocaleString()}
                                    </SubmitButton>
                                </div>
                            </form>
                        )}

                        <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                Tokens are generated instantly. Ensure your meter is connected to receive the credit. Minimum purchase is {currency}500.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Meter Info Panel */}
                    <div className="lg:w-72 space-y-4">
                        <div className="sticky top-4 space-y-4">
                            {/* Provider summary */}
                            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                    <Zap size={14} className="text-amber-400" />
                                    Electricity Provider
                                </div>
                                <p className="font-bold text-base">{providers.find(p => p.id === provider)?.name}</p>
                                <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${meterType === 'prepaid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {meterType}
                                </span>
                            </div>

                            {/* Verified meter info */}
                            {verifiedUser ? (
                                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <CheckCircle2 size={18} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Meter Verified</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <User size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[9px] text-emerald-600/60 font-bold uppercase tracking-widest">Customer Name</p>
                                                <p className="font-bold text-slate-900 text-sm">{verifiedUser.Customer_Name || 'N/A'}</p>
                                            </div>
                                        </div>
                                        {verifiedUser.Address && (
                                            <div className="flex items-start gap-3">
                                                <MapPin size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-[9px] text-emerald-600/60 font-bold uppercase tracking-widest">Address</p>
                                                    <p className="text-xs font-medium text-slate-600 leading-tight">{verifiedUser.Address}</p>
                                                </div>
                                            </div>
                                        )}
                                        {verifiedUser.Customer_Phone && (
                                            <div className="flex items-start gap-3">
                                                <Phone size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-[9px] text-emerald-600/60 font-bold uppercase tracking-widest">Phone</p>
                                                    <p className="font-bold text-slate-900 font-mono text-sm">{verifiedUser.Customer_Phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button type="button" onClick={handleReset} className="text-[10px] font-bold text-emerald-600 underline uppercase tracking-widest">
                                        Change Meter
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-slate-50 border border-dashed border-slate-200 p-10 rounded-2xl text-center">
                                    <Zap size={32} className="text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 text-xs font-medium">Meter details will appear here after verification.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <SecurePinModal isOpen={showPinModal} onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirmPurchase} loading={loading} title="Power Settlement" />
        </PurchaseLayout>
    );
};

export default UserBuyElectricityPage;
