import React, { useState, useEffect } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useAuthStore } from "../../store/auth/authStore";
import { useNavigate } from "react-router-dom";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-hot-toast";
import { Lightbulb, Zap, Phone, AlertCircle, Info, UserCheck, TrendingUp } from "lucide-react";
import apiClient from "../../services/api/apiClient";

const METER_TYPES = [
    { id: "prepaid", label: "Prepaid" },
    { id: "postpaid", label: "Postpaid" },
];

const UserBuyElectricityPage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [identities, setIdentities] = useState<any[]>([]);
    const [selectedIdentity, setSelectedIdentity] = useState<any | null>(null);
    const [identitiesLoading, setIdentitiesLoading] = useState(true);

    const [meterNumber, setMeterNumber] = useState("");
    const [meterType, setMeterType] = useState("prepaid");
    const [amount, setAmount] = useState("");
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [customerName, setCustomerName] = useState<string | null>(null);
    const [previewPricing, setPreviewPricing] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    useEffect(() => {
        const loadIdentities = async () => {
            setIdentitiesLoading(true);
            try {
                const res = await apiClient.get('/services/identities?category=electricity');
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

    // Reset verification on input changes
    useEffect(() => {
        setCustomerName(null);
    }, [meterType, selectedIdentity]);

    const handleVerifyMeter = async () => {
        if (!meterNumber || !selectedIdentity) return;
        setVerifying(true);
        setCustomerName(null);
        try {
            const res = await vtuService.verifyMeter(selectedIdentity.slug, meterNumber, meterType);
            if (res.data?.content?.Customer_Name) {
                setCustomerName(res.data.content.Customer_Name);
                toast.success(`Verified: ${res.data.content.Customer_Name}`);
            } else {
                toast.error("Could not verify meter number.");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const finalAmount = previewPricing?.data?.salePrice || 0;
    const insufficient = finalAmount > balance && Number(amount) > 0;

    useEffect(() => {
        const amt = Number(amount);
        if (amt >= 500 && selectedIdentity) {
            const fetchPreview = async () => {
                setPreviewLoading(true);
                setPreviewPricing(null);
                setPreviewError(false);
                try {
                    const res = await vtuService.previewPrice(undefined, amt, selectedIdentity.slug);
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
            const timer = setTimeout(fetchPreview, 500);
            return () => clearTimeout(timer);
        } else {
            setPreviewPricing(null);
            setPreviewError(false);
        }
    }, [amount, selectedIdentity]);

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!meterNumber) {
            toast.error("Enter meter number");
            return;
        }
        if (Number(amount) < 500) {
            toast.error("Minimum amount is ₦500");
            return;
        }
        if (insufficient) {
            toast.error("Insufficient wallet balance");
            return;
        }
        if (!customerName) {
            toast.error("Please verify meter number first");
            return;
        }
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setPinError(null);
        try {
            const res = await vtuService.buyElectricity({ 
                serviceID: selectedIdentity.slug, 
                meter_number: meterNumber, 
                billersCode: meterNumber,
                meter_type: meterType,
                variation_code: meterType,
                amount: Number(amount), 
                phone: user?.phone || meterNumber, 
                pin, 
                expectedPrice: finalAmount 
            });
            await fetchBalance();
            setShowPinModal(false);
            navigate('/app/services/status', { 
                state: { 
                    status: 'success', 
                    message: res.message || 'Payment successful.', 
                    transaction: { 
                        service: `${selectedIdentity.name} (${meterType.toUpperCase()})`, 
                        amount: Number(amount), 
                        target: meterNumber, 
                        reference: res.data?.reference || res.data?.requestId, 
                        token: res.data?.token,
                        timestamp: new Date().toLocaleTimeString() 
                    } 
                } 
            });
        } catch (err: any) {
            setPinError(err.response?.data?.message || "Payment failed.");
            toast.error(err.response?.data?.message || "Payment failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout title="Electricity Bill" subtitle="Pay your utility bills instantly.">
            <form onSubmit={handleInitiate}>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">DISCO Provider</p>
                            <div className="relative">
                                {identitiesLoading ? (
                                    <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                                ) : (
                                    <select
                                        value={selectedIdentity?._id || ''}
                                        onChange={(e) => {
                                            const id = identities.find(i => i._id === e.target.value);
                                            if (id) setSelectedIdentity(id);
                                        }}
                                        className="w-full appearance-none bg-slate-50 border-2 border-slate-100 px-4 py-4 rounded-xl font-bold text-sm text-slate-700 outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>Select DISCO Provider</option>
                                        {identities.map(identity => (
                                            <option key={identity._id} value={identity._id}>
                                                {identity.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Meter Type</p>
                            <div className="flex p-1.5 bg-slate-100 rounded-2xl w-full max-w-sm">
                                {METER_TYPES.map(type => (
                                    <button key={type.id} type="button" onClick={() => setMeterType(type.id)}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                            meterType === type.id
                                                ? 'bg-slate-900 text-white shadow-lg'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Row label="Meter Number">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input placeholder="Enter meter number" value={meterNumber}
                                        onChange={(e: any) => {
                                            setMeterNumber(e.target.value.replace(/\D/g, ''));
                                            setCustomerName(null);
                                        }}
                                        className="pl-12 pr-24" required type="tel" />
                                    <button 
                                        type="button"
                                        onClick={handleVerifyMeter}
                                        disabled={verifying || !meterNumber || !!customerName}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                            customerName 
                                                ? 'bg-emerald-100 text-emerald-600 cursor-default' 
                                                : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50'
                                        }`}
                                    >
                                        {verifying ? '...' : customerName ? 'Verified' : 'Verify'}
                                    </button>
                                </div>
                                {customerName && (
                                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
                                            <UserCheck size={16} className="text-emerald-700" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Customer Name</p>
                                            <p className="text-sm font-black text-emerald-900 uppercase">{customerName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Row>

                        <Row label="Recharge Amount">
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                                        <span className="text-slate-400 font-black text-lg">{currency}</span>
                                    </div>
                                    <Input placeholder="0.00" value={amount}
                                        onChange={(e: any) => setAmount(e.target.value.replace(/\D/g, ''))}
                                        className="pl-16 font-black text-2xl h-10 bg-slate-50 border-slate-100 focus:bg-white" required type="tel" />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {[1000, 2000, 5000, 10000, 20000].map(val => (
                                        <button key={val} type="button" onClick={() => setAmount(val.toString())}
                                            className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all shrink-0">
                                            {currency}{val.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Row>

                        <div className="p-5 bg-slate-50 rounded-2xl flex gap-4 items-start border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                <Info size={18} className="text-indigo-500" />
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Tokens are sent via SMS and displayed on the status page. Minimum payment is <span className="font-bold text-slate-900">{currency}500</span>. Ensure your meter number is correct.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:w-80 space-y-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-6 sticky top-4 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Summary</p>

                            <div className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm">
                                {selectedIdentity?.brandId?.logoUrl ? (
                                    <img src={selectedIdentity.brandId.logoUrl} className="w-12 h-12 object-contain" alt="" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">ID</div>
                                )}
                                <span className="font-black text-slate-900 text-center leading-tight">{selectedIdentity?.name || '—'}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Meter No</span>
                                    <span className="font-bold text-slate-900 font-mono text-sm tracking-tighter">{meterNumber || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Type</span>
                                    <span className="font-black text-slate-900 uppercase text-xs">{meterType}</span>
                                </div>
                                
                                <div className="pt-2 flex justify-between items-center">
                                    <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Total Pay</span>
                                    <div className="text-right">
                                        {previewLoading ? (
                                             <div className="w-20 h-6 bg-slate-200 animate-pulse rounded-lg"></div>
                                        ) : previewError ? (
                                             <span className="text-xs text-red-500 font-bold">Unavailable</span>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-slate-900 text-xl tracking-tight">{currency}{finalAmount.toLocaleString()}</span>
                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1 border border-emerald-500/10">
                                                    <TrendingUp size={10} />
                                                    Your Discount: {currency}{(previewPricing?.data?.savings || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200/60 pt-4 space-y-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wallet Balance</p>
                                <p className={`text-xl font-black tracking-tight ${insufficient ? 'text-red-500' : 'text-slate-900'}`}>
                                    {currency}{balance.toLocaleString()}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || insufficient || !selectedIdentity || !meterNumber || !amount || !customerName || previewLoading || previewError}
                                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.1em] transition-all duration-300 shadow-xl ${
                                    loading || insufficient || !selectedIdentity || !meterNumber || !amount || !customerName || previewLoading || previewError
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-slate-900/20'
                                }`}
                            >
                                {loading ? 'Processing...' : 'Pay Utility Bill'}
                            </button>
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
                title={`Verify Electricity Payment`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyElectricityPage;
