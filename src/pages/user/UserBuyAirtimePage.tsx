import React, { useState, useEffect } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useAuthStore } from "../../store/auth/authStore";
import { useNavigate } from "react-router-dom";
import SecurePinModal from "../../components/modals/SecurePinModal";
import { toast } from "react-hot-toast";
import { Phone, AlertCircle, Info, TriangleAlert } from "lucide-react";
import apiClient from "../../services/api/apiClient";
import { detectNetwork } from "../../utils/phoneValidation";
import mtnLogo from "../../assets/mtn.png";
import airtelLogo from "../../assets/airtel.png";
import gloLogo from "../../assets/glo.png";
import mobile9Logo from "../../assets/9mobile.png";

const NETWORK_ASSETS: Record<string, string> = {
    mtn: mtnLogo,
    airtel: airtelLogo,
    glo: gloLogo,
    '9mobile': mobile9Logo,
    etisalat: mobile9Logo,
};

const getNetworkAsset = (slug: string) => {
    const key = Object.keys(NETWORK_ASSETS).find(k => (slug || '').toLowerCase().includes(k));
    return key ? NETWORK_ASSETS[key] : null;
};

const sortNetworks = (networks: any[]) => {
    const order = ['mtn', 'airtel', 'glo', '9mobile', 'etisalat'];
    return [...networks].sort((a, b) => {
        const slugA = (a.slug || a.name || '').toLowerCase();
        const slugB = (b.slug || b.name || '').toLowerCase();
        
        let indexA = order.findIndex(net => slugA.includes(net));
        let indexB = order.findIndex(net => slugB.includes(net));
        
        if (indexA === 4) indexA = 3; // Treat etisalat as 9mobile
        if (indexB === 4) indexB = 3;
        
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        
        return indexA - indexB;
    });
};

const UserBuyAirtimePage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // DYNAMIC IDENTITIES (Kept)
    const [identities, setIdentities] = useState<any[]>([]);
    const [selectedIdentity, setSelectedIdentity] = useState<any | null>(null);
    const [identitiesLoading, setIdentitiesLoading] = useState(true);

    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState("");
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [previewPricing, setPreviewPricing] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    useEffect(() => {
        const loadIdentities = async () => {
            setIdentitiesLoading(true);
            try {
                const res = await apiClient.get('/services/identities?category=airtime');
                let list = res.data.data || [];
                list = sortNetworks(list);
                setIdentities(list);
                if (list.length > 0) {
                    setSelectedIdentity(list[0]);
                }
            } catch (err) {
                toast.error("Failed to load providers");
            } finally {
                setIdentitiesLoading(false);
            }
        };
        loadIdentities();
    }, []);

    const handlePhoneChange = (val: string) => {
        setFormError(null);
        const cleanVal = val.replace(/\D/g, '').slice(0, 11);
        setPhone(cleanVal);
    };

    const handleAmountChange = (val: string) => {
        setFormError(null);
        const cleanVal = val.replace(/\D/g, '');
        setAmount(cleanVal);
    };

    const finalAmount = previewPricing?.data?.salePrice || 0;
    const insufficient = finalAmount > balance && Number(amount) > 0;

    useEffect(() => {
        const amt = Number(amount);
        if (amt >= 50 && selectedIdentity) {
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

    const detectedNetwork = detectNetwork(phone);
    const isMismatch = detectedNetwork && selectedIdentity && !selectedIdentity.name.toLowerCase().includes(detectedNetwork.toLowerCase());
    const [showMismatch, setShowMismatch] = useState(false);

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phone.length < 11) {
            toast.error("Enter a valid phone number");
            return;
        }
        if (Number(amount) < 50) {
            toast.error("Minimum amount is ₦50");
            return;
        }
        if (insufficient) {
            toast.error("Insufficient wallet balance");
            return;
        }

        if (isMismatch) {
            setShowMismatch(true);
            return;
        }

        setShowPinModal(true);
    };

    const handleConfirmMismatch = () => {
        setShowMismatch(false);
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setPinError(null);
        try {
            const res = await vtuService.buyAirtime({ 
                network: selectedIdentity.slug, 
                amount: Number(amount), 
                phone, 
                pin, 
                expectedPrice: finalAmount 
            });
            await fetchBalance();
            setShowPinModal(false);
            navigate('/app/services/status', { 
                state: { 
                    status: 'success', 
                    message: res.message || 'Airtime purchase successful.', 
                    transaction: { 
                        service: `${selectedIdentity.name} Airtime`, 
                        amount: Number(amount), 
                        target: phone, 
                        reference: res.data?.reference || res.data?.requestId, 
                        timestamp: new Date().toLocaleTimeString() 
                    } 
                } 
            });
        } catch (err: any) {
            setPinError(err.response?.data?.message || "Purchase failed.");
            toast.error(err.response?.data?.message || "Purchase failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout title="Buy Airtime" subtitle="Top up instantly with zero delays.">
            <form onSubmit={handleInitiate}>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Network</p>
                            <div className="flex gap-3 flex-wrap">
                                {identitiesLoading ? (
                                    <div className="flex gap-3">
                                        {Array(4).fill(0).map((_, i) => <div key={i} className="w-24 h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : identities.map(identity => (
                                    <button key={identity._id} type="button" onClick={() => setSelectedIdentity(identity)}
                                        className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 p-3 w-24 h-24 rounded-2xl font-bold text-sm transition-all border-2 ${
                                            selectedIdentity?._id === identity._id
                                                ? 'bg-emerald-50 border-emerald-500 shadow-lg scale-105 text-emerald-900'
                                                : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                        }`}>
                                        {getNetworkAsset(identity.slug) ? (
                                            <img src={getNetworkAsset(identity.slug) as string} alt={identity.name} className="w-10 h-10 object-contain rounded-full bg-white shadow-sm" />
                                        ) : identity.brandId?.logoUrl ? (
                                            <img src={identity.brandId.logoUrl} alt={identity.name} className="w-10 h-10 object-contain rounded-full bg-white shadow-sm" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${selectedIdentity?._id === identity._id ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                {identity.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-[11px] text-center leading-tight truncate w-full">{identity.name}</span>
                                        {selectedIdentity?._id === identity._id && (
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50 animate-pulse"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Row label="Mobile Number">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input placeholder="08012345678" value={phone}
                                        onChange={(e: any) => handlePhoneChange(e.target.value)}
                                        className="pl-12" required maxLength={11} type="tel" />
                                </div>
                                {isMismatch && (
                                    <p className="text-xs text-amber-600 font-bold flex items-center gap-1.5 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
                                        <TriangleAlert size={14} />
                                        Looks like an {detectedNetwork} number.
                                    </p>
                                )}
                                {(user?.phone || user?.phoneNumber) && !isMismatch && (
                                    <button type="button" onClick={() => handlePhoneChange(user?.phone || user?.phoneNumber || "")}
                                        className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 flex items-center gap-1.5 mt-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                                        Use registered number
                                    </button>
                                )}
                            </div>
                        </Row>

                        <Row label="Recharge Amount">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currency}</span>
                                        <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                    </div>
                                    <Input placeholder="0.00" value={amount}
                                        onChange={(e: any) => handleAmountChange(e.target.value)}
                                        className="pl-16 font-extrabold text-2xl h-10 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-inner" required type="tel" />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {[100, 200, 500, 1000, 2000, 5000].map(val => (
                                        <button key={val} type="button" onClick={() => setAmount(val.toString())}
                                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all shrink-0">
                                            {currency}{val.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Row>

                        <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start border border-slate-100">
                            <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Airtime is delivered instantly. Minimum recharge is {currency}50.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:w-72 space-y-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 sticky top-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Summary</p>

                            <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-center font-bold text-slate-900">
                                {selectedIdentity?.name || '—'}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Recipient</span>
                                    <span className="font-bold text-slate-900 font-mono">{phone || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Value</span>
                                    <span className="font-bold text-slate-900">{currency}{Number(amount || 0).toLocaleString()}</span>
                                </div>
                                
                                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-slate-700">Total</span>
                                    <div className="text-right">
                                        {previewLoading ? (
                                             <div className="w-16 h-5 bg-slate-200 animate-pulse rounded"></div>
                                        ) : previewError ? (
                                             <span className="text-xs text-red-500 font-bold">Unavailable</span>
                                        ) : Number(amount) < 50 ? (
                                            <span className="font-extrabold text-slate-400">—</span>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <span className="font-extrabold text-slate-900">{currency}{finalAmount.toLocaleString()}</span>
                                                {previewPricing?.data?.savings > 0 && (
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1 border border-emerald-500/10">
                                                        Saved {currency}{previewPricing.data.savings.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 space-y-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wallet Balance</p>
                                <p className={`text-base font-extrabold ${insufficient ? 'text-red-500' : 'text-slate-900'}`}>
                                    {currency}{balance.toLocaleString()}
                                </p>
                            </div>

                            <SubmitButton loading={loading} disabled={loading || insufficient || !selectedIdentity || !phone || !amount || previewLoading || previewError}>
                                Confirm Top-up
                            </SubmitButton>
                        </div>
                    </div>
                </div>
            </form>

            {showMismatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TriangleAlert size={32} className="text-amber-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">Network Mismatch</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                This number <span className="font-bold text-slate-700">{phone}</span> appears to belong to <span className="font-bold text-amber-600">{detectedNetwork}</span>, but you selected <span className="font-bold text-slate-900">{selectedIdentity?.name}</span>.
                            </p>
                            <p className="text-xs text-slate-400 font-medium">Do you want to continue with this purchase?</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setShowMismatch(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={handleConfirmMismatch}
                                className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                            >
                                Yes, Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SecurePinModal
                isOpen={showPinModal}
                onClose={() => { setShowPinModal(false); setPinError(null); }}
                onConfirm={handleConfirm}
                loading={loading}
                error={pinError}
                title={`Verify ${selectedIdentity?.name} Airtime`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyAirtimePage;
