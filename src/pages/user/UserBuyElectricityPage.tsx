import React, { useState, useEffect } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SecurePinModal from '../../components/modals/SecurePinModal';
import { User, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ServiceSkeleton } from '../../components/feedback/Skeletons';

// Initial fallback providers, will be updated from backend
const FALLBACK_PROVIDERS = [
    { id: 'ikeja-electric', name: 'Ikeja Electric (IKEDC)' },
    { id: 'eko-electric', name: 'Eko Electric (EKEDC)' },
];

const UserBuyElectricityPage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const navigate = useNavigate();

    const [providers, setProviders] = useState(FALLBACK_PROVIDERS);
    const [fetchingProviders, setFetchingProviders] = useState(true);
    const [provider, setProvider] = useState(FALLBACK_PROVIDERS[0].id);
    const [meterNumber, setMeterNumber] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [meterType, setMeterType] = useState('prepaid');
    
    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProviders = async () => {
            try {
                const res = await vtuService.fetchDataPlans('electricity-bill');
                const fetched = res.data?.variations || res.data || [];
                if (fetched.length > 0) {
                    const formatted = fetched.map((f: any) => ({
                        id: f.serviceID || f.id || f.variation_code,
                        name: f.name || f.variation_name
                    }));
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
            const res = await vtuService.verifyMerchant({
                serviceID: provider,
                billersCode: meterNumber,
                type: meterType
            });
            setVerifiedUser(res.data);
            setStep(2);
            toast.success("Meter verified successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Could not verify meter number");
        } finally {
            setVerifying(false);
        }
    };

    const handleReset = () => {
        setStep(1);
        setVerifiedUser(null);
    };

    const handleInitiatePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) < 500) {
            toast.error(`Minimum purchase amount is ${currency}500`);
            return;
        }
        if (Number(amount) > balance) {
            toast.error("Insufficient wallet balance");
            return;
        }
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
            const res = await vtuService.buyElectricity({
                serviceID: provider,
                billersCode: meterNumber,
                variation_code: meterType,
                amount: purchaseAmount,
                phone: verifiedUser?.Customer_Phone || '',
                pin
            });

            await fetchBalance();
            navigate('/app/services/status', {
                state: {
                    status: 'success',
                    message: res.message || 'Power purchase successful.',
                    transaction: {
                        service: serviceTitle,
                        amount: purchaseAmount,
                        target: meterNumber,
                        reference: res.data?.reference || res.data?.requestId || res.requestId,
                        timestamp: new Date().toLocaleTimeString(),
                        token: res.data?.token || res.token
                    }
                }
            });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Purchase failed. Please try again or contact support.";
            toast.error(msg);
            navigate('/app/services/status', {
                state: {
                    status: 'error',
                    message: msg,
                    transaction: {
                        service: serviceTitle,
                        amount: purchaseAmount,
                        target: meterNumber,
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
            title="Electricity Bills" 
            subtitle={step === 1 ? "Verify your meter details to proceed." : "Confirm customer details and enter amount."}
        >
            {fetchingProviders ? (
                <ServiceSkeleton />
            ) : (
                <div className="space-y-6">
                    {step === 1 ? (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <Row label="Provider">
                                    <Select value={provider} onChange={(e) => { setProvider(e.target.value); handleReset(); }} disabled={fetchingProviders}>
                                        {providers.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </Select>
                                </Row>
                                <Row label="Meter Type">
                                    <Select value={meterType} onChange={(e) => { setMeterType(e.target.value); handleReset(); }}>
                                        <option value="prepaid">Prepaid</option>
                                        <option value="postpaid">Postpaid</option>
                                    </Select>
                                </Row>
                            </div>

                            <Row label="Meter Number">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Zap size={18} />
                                    </div>
                                    <Input
                                        placeholder="Enter meter number"
                                        value={meterNumber}
                                        onChange={(e: any) => { setMeterNumber(e.target.value); handleReset(); }}
                                        className="pl-12"
                                        required
                                    />
                                </div>
                            </Row>

                            <SubmitButton loading={verifying} disabled={verifying || !meterNumber}>
                                Verify Meter
                            </SubmitButton>
                        </form>
                    ) : (
                        <form onSubmit={handleInitiatePurchase} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Verified User Details */}
                            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3 text-emerald-600 mb-1">
                                    <CheckCircle2 size={18} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Ownership Confirmed</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest">Customer Name</p>
                                        <p className="font-bold text-slate-900 text-sm">{verifiedUser?.Customer_Name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest">Address</p>
                                        <p className="font-medium text-slate-600 text-xs line-clamp-1">{verifiedUser?.Address || 'N/A'}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={handleReset} className="text-[10px] font-bold text-emerald-600 underline uppercase tracking-widest">Change Meter</button>
                            </div>

                            <Row label={`Amount (${currency})`}>
                                <Input
                                    type="number"
                                    placeholder={`Min ${currency}500`}
                                    value={amount}
                                    onChange={(e: any) => setAmount(e.target.value)}
                                    required
                                />
                            </Row>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wallet Balance</p>
                                    <p className="text-sm font-bold text-slate-900">{currency}{balance.toLocaleString()}</p>
                                </div>
                                <SubmitButton loading={loading} disabled={loading || !amount || Number(amount) > balance}>
                                    Confirm & Pay {currency}{Number(amount || 0).toLocaleString()}
                                </SubmitButton>
                            </div>
                        </form>
                    )}

                    <div className="flex items-start gap-4 p-5 bg-slate-950 rounded-2xl text-slate-400">
                        <AlertCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-medium leading-relaxed">
                            Tokens are generated instantly after payment verification. Ensure your meter is connected to the network to receive your credit.
                        </p>
                    </div>
                </div>
            )}

            <SecurePinModal 
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirmPurchase}
                loading={loading}
                title={`Power Settlement`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyElectricityPage;
