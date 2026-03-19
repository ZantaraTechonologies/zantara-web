import React, { useState, useEffect } from 'react';
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SecurePinModal from '../../components/modals/SecurePinModal';
import { Tv, User, Search, CheckCircle2, AlertCircle } from 'lucide-react';

const PROVIDERS = [
    { id: 'dstv', name: 'DSTV' },
    { id: 'gotv', name: 'GOTV' },
    { id: 'startimes', name: 'StarTimes' },
    { id: 'showmax', name: 'Showmax' },
];

const UserBuyCablePage: React.FC = () => {
    const { balance, fetchBalance } = useWalletStore();
    const navigate = useNavigate();

    const [provider, setProvider] = useState(PROVIDERS[0].id);
    const [smartcardNumber, setSmartcardNumber] = useState('');
    const [packages, setPackages] = useState<any[]>([]);
    const [packageId, setPackageId] = useState('');
    
    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<string | null>(null);
    const [fetchingPackages, setFetchingPackages] = useState(false);
    
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!smartcardNumber || verifying) return;
        
        setVerifying(true);
        try {
            const res = await vtuService.verifySmartcard(provider, smartcardNumber);
            if (res.status === 'success' || res.data?.customerName) {
                setVerifiedUser(res.data.customerName || res.data.name);
                toast.success("Smartcard verified");
                loadPackages();
            } else {
                toast.error("Verification failed");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const loadPackages = async () => {
        setFetchingPackages(true);
        try {
            const res = await vtuService.fetchDataPlans(provider);
            const fetchedPackages = res.data?.variations || res.data || [];
            setPackages(fetchedPackages);
            if (fetchedPackages.length > 0) {
                setPackageId(fetchedPackages[0].variation_code || fetchedPackages[0].id);
            }
        } catch (err) {
            toast.error("Failed to load packages");
        } finally {
            setFetchingPackages(false);
        }
    };

    const handleReset = () => {
        if (verifiedUser) setVerifiedUser(null);
        if (packages.length > 0) setPackages([]);
        if (packageId) setPackageId('');
    };

    const selectedPackage = packages.find(p => (p.variation_code || p.id) === packageId);
    const amount = Number(selectedPackage?.variation_amount || selectedPackage?.price || 0);
    const insufficient = amount > balance || amount <= 0;

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
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

        const providerName = PROVIDERS.find(p => p.id === provider)?.name;
        const serviceTitle = `${providerName} - ${selectedPackage?.name}`;

        try {
            const res = await vtuService.buyCable({
                serviceID: provider,
                billersCode: smartcardNumber,
                variation_code: packageId,
                amount,
                pin
            });
            
            await fetchBalance();
            navigate('/app/services/status', { 
                state: { 
                    status: 'success', 
                    message: res.message || 'Cable subscription successful.',
                    transaction: {
                        service: serviceTitle,
                        amount: amount,
                        target: smartcardNumber,
                        reference: res.data?.reference || res.data?.requestId || res.requestId,
                        timestamp: new Date().toLocaleTimeString()
                    }
                } 
            });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Subscription failed or timed out. Please check your transaction history.";
            toast.error(msg);

            navigate('/app/services/status', { 
                state: { 
                    status: err.code === 'ECONNABORTED' ? 'timeout' : 'error', 
                    message: msg,
                    transaction: {
                        service: serviceTitle,
                        amount: amount,
                        target: smartcardNumber,
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
            title="Cable TV" 
            subtitle="Renew your favorite channels with absolute precision."
        >
            <div className="space-y-8">
                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Row label="TV Provider">
                            <Select value={provider} onChange={(e) => { setProvider(e.target.value); handleReset(); }}>
                                {PROVIDERS.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </Select>
                        </Row>
                        <Row label="Smartcard/IUC Number">
                            <div className="relative group">
                                <Input 
                                    type="text"
                                    placeholder="Enter identifier"
                                    value={smartcardNumber}
                                    onChange={(e: any) => { setSmartcardNumber(e.target.value); handleReset(); }}
                                    required
                                />
                                <button 
                                    type="submit"
                                    disabled={verifying || !smartcardNumber}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-30"
                                >
                                    {verifying ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Search size={16} />}
                                </button>
                            </div>
                        </Row>
                    </div>
                </form>

                {verifiedUser && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Verified User Info */}
                        <div className="bg-slate-950 p-6 rounded-2xl flex items-start gap-4 text-emerald-400">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                                <User size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Verified Consumer</p>
                                <h4 className="text-lg font-bold text-white leading-tight">{verifiedUser}</h4>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    <span>Account: {smartcardNumber}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleInitiate} className="space-y-8">
                            <Row label="Select Package">
                                <Select 
                                    value={packageId} 
                                    onChange={(e) => setPackageId(e.target.value)}
                                    disabled={fetchingPackages}
                                >
                                    {fetchingPackages ? (
                                        <option>Decrypting packages...</option>
                                    ) : (
                                        packages.map((p) => (
                                            <option key={p.variation_code || p.id} value={p.variation_code || p.id}>
                                                {p.name} — ₦{Number(p.variation_amount || p.price).toLocaleString()}
                                            </option>
                                        ))
                                    )}
                                </Select>
                            </Row>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscription Fee</p>
                                    <p className="text-xl font-bold text-slate-900">₦{amount.toLocaleString()}</p>
                                </div>
                                <SubmitButton loading={loading} disabled={loading || insufficient || fetchingPackages}>
                                    Renew Subscription
                                </SubmitButton>
                            </div>
                        </form>
                    </div>
                )}

                {!verifiedUser && !verifying && (
                    <div className="bg-slate-50 p-5 rounded-2xl flex items-center gap-4 border border-white">
                        <Tv size={20} className="text-slate-400 shrink-0" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                            A Secure handshake with {PROVIDERS.find(p => p.id === provider)?.name} is required before package selection.
                        </p>
                    </div>
                )}
            </div>

            <SecurePinModal 
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirm}
                loading={loading}
                title={`Verify ${PROVIDERS.find(p => p.id === provider)?.name} Payment`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyCablePage;
