import React, { useState, useEffect, useMemo } from 'react';
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SecurePinModal from '../../components/modals/SecurePinModal';
import { Tv, Search, CheckCircle2, User, Phone, Hash } from 'lucide-react';
import { ServiceSkeleton } from '../../components/feedback/Skeletons';

const STATIC_PROVIDERS = [
    { id: 'dstv', name: 'DSTV', color: 'bg-blue-600', textColor: 'text-white', emoji: '📡' },
    { id: 'gotv', name: 'GOTV', color: 'bg-green-500', textColor: 'text-white', emoji: '📺' },
    { id: 'startimes', name: 'Startimes', color: 'bg-purple-600', textColor: 'text-white', emoji: '🌟' },
    { id: 'showmax', name: 'Showmax', color: 'bg-rose-500', textColor: 'text-white', emoji: '🎬' },
];

const UserBuyCablePage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const navigate = useNavigate();

    const [provider, setProvider] = useState(STATIC_PROVIDERS[0].id);
    const [smartcardNumber, setSmartcardNumber] = useState('');
    const [packages, setPackages] = useState<any[]>([]);
    const [packageId, setPackageId] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<any>(null);
    const [fetchingPackages, setFetchingPackages] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const selectedProvider = STATIC_PROVIDERS.find(p => p.id === provider) || STATIC_PROVIDERS[0];

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!smartcardNumber || verifying) return;
        setVerifying(true);
        setFetchingPackages(true);
        try {
            setFormError(null);
            const res = await vtuService.verifyMerchant({ serviceID: provider, billersCode: smartcardNumber });
            setVerifiedUser(res.data?.content || res.data);
            const pkgRes = await vtuService.fetchDataPlans(provider);
            setPackages(pkgRes.data?.content?.variations || pkgRes.data?.variations || (Array.isArray(pkgRes.data) ? pkgRes.data : []));
            toast.success("Card verified successfully");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Verification failed";
            setFormError(msg);
            toast.error(msg);
        } finally {
            setVerifying(false);
            setFetchingPackages(false);
        }
    };

    const handleReset = () => {
        setVerifiedUser(null);
        setPackages([]);
        setPackageId('');
        setFormError(null);
    };

    const selectedPackage = useMemo(() => packages.find(p => p.variation_code === packageId), [packages, packageId]);
    const amount = Number(selectedPackage?.variation_amount || 0);
    const insufficient = amount > balance;

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!verifiedUser) {
            const err = "Please verify smartcard number first";
            setFormError(err);
            toast.error(err);
            return;
        }
        if (!packageId) {
            const err = "Please select a package";
            setFormError(err);
            toast.error(err);
            return;
        }
        if (insufficient) {
            const err = "Insufficient wallet balance";
            setFormError(err);
            toast.error(err);
            return;
        }
        setPinError(null);
        setFormError(null);
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setPinError(null);
        const serviceTitle = `${selectedProvider.name} - ${selectedPackage?.name}`;
        try {
            const res = await vtuService.buyCable({
                serviceID: provider, billersCode: smartcardNumber, variation_code: packageId,
                amount, phone: verifiedUser?.Customer_Phone || '', subscription_type: 'change', pin
            });
            await fetchBalance();
            setShowPinModal(false);
            navigate('/app/services/status', { state: { status: 'success', message: res.message || 'Subscription successful.', transaction: { service: serviceTitle, amount, target: smartcardNumber, reference: res.data?.reference || res.data?.requestId, timestamp: new Date().toLocaleTimeString() } } });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Subscription failed.";
            setPinError(msg);
            setFormError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout title="Cable TV" subtitle="Renew your favorite channels with absolute precision.">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT: Form */}
                <div className="flex-1 space-y-6">
                    {formError && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-red-700 animate-in slide-in-from-top-4 duration-500">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold">Transaction Error</p>
                                <p className="text-xs font-medium opacity-90">{formError}</p>
                            </div>
                        </div>
                    )}
                    {/* Provider Icons */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">TV Provider</p>
                        <div className="flex gap-3 flex-wrap">
                            {STATIC_PROVIDERS.map(p => (
                                <button key={p.id} type="button"
                                    onClick={() => { setProvider(p.id); handleReset(); }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                                        provider === p.id
                                            ? `${p.color} ${p.textColor} border-transparent shadow-lg scale-105`
                                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200'
                                    }`}>
                                    <span className="text-base">{p.emoji}</span>
                                    <span>{p.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Smartcard form */}
                    <form onSubmit={handleVerify} className="space-y-4">
                        <Row label="Smartcard / IUC Number">
                            <div className="relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input placeholder="Enter IUC Number" value={smartcardNumber}
                                    onChange={(e: any) => { const val = e.target.value.replace(/\D/g, '').slice(0, 15); setSmartcardNumber(val); handleReset(); }}
                                    className="pl-12" required maxLength={15} type="tel" />
                            </div>
                        </Row>
                        {!verifiedUser && (
                            <SubmitButton loading={verifying} disabled={verifying || !smartcardNumber}>
                                Verify Decoder
                            </SubmitButton>
                        )}
                    </form>

                    {/* Package selection after verification */}
                    {verifiedUser && (
                        <form onSubmit={handleInitiate} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Package</p>
                            {fetchingPackages ? (
                                <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                            ) : packages.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">No packages available</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                    {packages.map((p: any) => (
                                        <button key={p.variation_code} type="button" onClick={() => setPackageId(p.variation_code)}
                                            className={`text-left p-3 rounded-xl border-2 transition-all text-xs ${
                                                packageId === p.variation_code
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                                    : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200'
                                            }`}>
                                            <p className="font-bold leading-tight">{p.name}</p>
                                            <p className="font-extrabold text-sm mt-1">{currency}{Number(p.variation_amount).toLocaleString()}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-100">
                                <SubmitButton loading={loading} disabled={loading || insufficient || !packageId}>
                                    Activate Plan — {currency}{amount.toLocaleString()}
                                </SubmitButton>
                            </div>
                        </form>
                    )}

                    {!verifiedUser && !verifying && (
                        <div className="bg-slate-50 p-5 rounded-2xl flex items-center gap-4 border border-slate-100">
                            <Tv size={20} className="text-slate-400 shrink-0" />
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] leading-relaxed">
                                Enter your {selectedProvider.name} IUC/Smartcard number and click "Verify Decoder" to continue.
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT: Verified Info Panel */}
                <div className="lg:w-72 space-y-4">
                    <div className="sticky top-4 space-y-4">
                        {/* Provider Card */}
                        <div className={`w-full py-6 rounded-2xl ${selectedProvider.color} flex flex-col items-center justify-center gap-2`}>
                            <span className="text-3xl">{selectedProvider.emoji}</span>
                            <span className={`font-black text-lg ${selectedProvider.textColor}`}>{selectedProvider.name}</span>
                        </div>

                        {/* Verified User Details */}
                        {verifiedUser ? (
                            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl space-y-4">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle2 size={18} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Account Verified</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <User size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[9px] text-emerald-600/70 font-bold uppercase tracking-widest">Customer Name</p>
                                            <p className="font-bold text-slate-900 text-sm">{verifiedUser.Customer_Name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {verifiedUser.Customer_Phone && (
                                        <div className="flex items-start gap-3">
                                            <Phone size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[9px] text-emerald-600/70 font-bold uppercase tracking-widest">Phone Number</p>
                                                <p className="font-bold text-slate-900 font-mono text-sm">{verifiedUser.Customer_Phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <Hash size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[9px] text-emerald-600/70 font-bold uppercase tracking-widest">Status</p>
                                            <p className="font-bold text-slate-900 text-sm">{verifiedUser.Status || 'Active'}</p>
                                        </div>
                                    </div>
                                    {selectedPackage && (
                                        <div className="border-t border-emerald-100 pt-3 space-y-1">
                                            <p className="text-[9px] text-emerald-600/70 font-bold uppercase tracking-widest">Selected Plan</p>
                                            <p className="font-bold text-slate-900 text-sm">{selectedPackage.name}</p>
                                            <p className="font-extrabold text-emerald-600 text-lg">{currency}{amount.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-emerald-100 pt-3">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wallet Balance</p>
                                    <p className={`text-base font-extrabold ${insufficient ? 'text-red-500' : 'text-slate-900'}`}>
                                        {currency}{balance.toLocaleString()}
                                    </p>
                                </div>
                                <button type="button" onClick={handleReset} className="text-[10px] font-bold text-emerald-600 underline uppercase tracking-widest">
                                    Switch Account
                                </button>
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 border-dashed p-10 rounded-2xl text-center">
                                <Tv size={32} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 text-xs font-medium">Verified account details will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SecurePinModal
                isOpen={showPinModal}
                onClose={() => { setShowPinModal(false); setPinError(null); }}
                onConfirm={handleConfirm}
                loading={loading}
                error={pinError}
                title={`Confirm ${selectedProvider.name} Payment`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyCablePage;
