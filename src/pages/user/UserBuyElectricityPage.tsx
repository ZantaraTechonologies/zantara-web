import React, { useState, useEffect } from 'react';
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SecurePinModal from '../../components/modals/SecurePinModal';
import { User, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

const PROVIDERS = [
    { id: 'ikeja-electric', name: 'Ikeja Electric (IKEDC)' },
    { id: 'eko-electric', name: 'Eko Electric (EKEDC)' },
    { id: 'kano-electric', name: 'Kano Electric (KEDCO)' },
    { id: 'port-harcourt-electric', name: 'Port Harcourt (PHED)' },
    { id: 'jos-electric', name: 'Jos Electric (JED)' },
    { id: 'ibadan-electric', name: 'Ibadan Electric (IBEDC)' },
    { id: 'kaduna-electric', name: 'Kaduna Electric (KAEDCO)' },
    { id: 'enugu-electric', name: 'Enugu Electric (EEDC)' },
    { id: 'abuja-electric', name: 'Abuja Electric (AEDC)' },
    { id: 'benin-electric', name: 'Benin Electric (BEDC)' },
];

const UserBuyElectricityPage: React.FC = () => {
    const { balance, fetchBalance } = useWalletStore();
    const navigate = useNavigate();

    const [provider, setProvider] = useState(PROVIDERS[0].id);
    const [meterNumber, setMeterNumber] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [meterType, setMeterType] = useState('prepaid');
    
    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<string | null>(null);
    const [step, setStep] = useState(1); // 1: Verify, 2: Pay
    
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!meterNumber || verifying) return;
        
        setVerifying(true);
        try {
            const res = await vtuService.verifyMeter(provider, meterNumber);
            if (res.status === 'success' || res.data?.customerName) {
                setVerifiedUser(res.data.customerName || res.data.name);
                setStep(2);
                toast.success("Meter verified successfully");
            } else {
                toast.error("Could not verify meter number");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const handleReset = () => {
        if (step !== 1) setStep(1);
        if (verifiedUser) setVerifiedUser(null);
        if (amount) setAmount('');
    };

    const handleInitiatePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        if (!amount || Number(amount) < 100) {
            toast.error("Minimum amount is ₦100");
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
        setShowPinModal(false); // Close immediately to prevent interaction

        const providerName = PROVIDERS.find(p => p.id === provider)?.name;
        const serviceTitle = `${providerName} (${meterType.toUpperCase()})`;
        const purchaseAmount = Number(amount);

        try {
            const payload = {
                serviceID: provider,
                billersCode: meterNumber,
                variation_code: meterType,
                amount: purchaseAmount,
                pin
            };
            const res = await vtuService.buyElectricity(payload);
            
            // Critical Data Refresh
            await fetchBalance();
            
            navigate('/app/services/status', { 
                state: { 
                    status: 'success', 
                    message: res.message || 'Electricity unit purchase successful.',
                    transaction: {
                        service: serviceTitle,
                        amount: purchaseAmount,
                        target: meterNumber,
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
            <div className="space-y-6">
                {step === 1 ? (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Row label="Provider">
                                <Select value={provider} onChange={(e) => { setProvider(e.target.value); handleReset(); }}>
                                    {PROVIDERS.map((p) => (
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
                            <Input 
                                type="text"
                                placeholder="Enter meter number"
                                value={meterNumber}
                                onChange={(e: any) => { setMeterNumber(e.target.value); handleReset(); }}
                                required
                            />
                        </Row>
                        <div className="pt-2">
                             <SubmitButton loading={verifying} disabled={verifying || !meterNumber}>
                                Verify Meter
                            </SubmitButton>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleInitiatePurchase} className="space-y-8 animate-in slide-in-from-right duration-500">
                        {/* Verified User Info */}
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                <User size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Verified Customer</p>
                                <h4 className="text-lg font-bold text-slate-900 leading-tight">{verifiedUser}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    <span>Meter No: {meterNumber}</span>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={handleReset}
                                className="ml-auto text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
                            >
                                Change
                            </button>
                        </div>

                        <Row label="Purchase Amount (₦)">
                            <div className="space-y-4">
                                <Input 
                                    type="number"
                                    placeholder="Min ₦100"
                                    value={amount}
                                    onChange={(e: any) => setAmount(e.target.value ? Number(e.target.value) : '')}
                                    required
                                />
                                <div className="grid grid-cols-4 gap-2">
                                    {[1000, 2000, 5000, 10000].map((val) => (
                                        <button 
                                            key={val}
                                            type="button"
                                            onClick={() => setAmount(val)}
                                            className="py-2 text-[10px] font-bold border border-slate-100 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all uppercase tracking-widest text-slate-500 hover:text-emerald-600"
                                        >
                                            ₦{val.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Row>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Settlement</p>
                                <p className="text-xl font-bold text-slate-900">₦{Number(amount || 0).toLocaleString()}</p>
                            </div>
                            <SubmitButton loading={loading} disabled={loading || !amount || Number(amount) < 100 || Number(amount) > balance}>
                                Pay ₦{Number(amount || 0).toLocaleString()}
                            </SubmitButton>
                        </div>
                    </form>
                )}

                {/* Info Card */}
                <div className="bg-slate-50 p-5 rounded-2xl flex items-start gap-4 border border-white">
                    <AlertCircle size={20} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Please ensure the meter number is correct. Token generation is irreversible once processed. A token will be sent via SMS and displayed on the success screen.
                    </p>
                </div>
            </div>

            <SecurePinModal 
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirmPurchase}
                loading={loading}
                title="Verify Electricity Unit Payment"
            />
        </PurchaseLayout>
    );
};

export default UserBuyElectricityPage;
