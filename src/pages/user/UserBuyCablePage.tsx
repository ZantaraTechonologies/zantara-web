import React, { useState, useEffect, useMemo } from 'react';
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SecurePinModal from '../../components/modals/SecurePinModal';
import { Tv, User, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { ServiceSkeleton } from '../../components/feedback/Skeletons';

const FALLBACK_PROVIDERS = [
    { id: 'dstv', name: 'DSTV' },
    { id: 'gotv', name: 'GOTV' },
];

const UserBuyCablePage: React.FC = () => {
    const { balance, currency, fetchBalance } = useWalletStore();
    const navigate = useNavigate();

    const [providers, setProviders] = useState(FALLBACK_PROVIDERS);
    const [fetchingProviders, setFetchingProviders] = useState(true);
    const [provider, setProvider] = useState(FALLBACK_PROVIDERS[0].id);
    const [smartcardNumber, setSmartcardNumber] = useState('');
    const [packages, setPackages] = useState<any[]>([]);
    const [packageId, setPackageId] = useState('');
    
    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<any>(null);
    const [fetchingPackages, setFetchingPackages] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProviders = async () => {
            try {
                const res = await vtuService.fetchDataPlans('tv-subscription'); 
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
                console.error("Failed to fetch cable providers", err);
            } finally {
                setFetchingProviders(false);
            }
        };
        loadProviders();
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!smartcardNumber || verifying) return;
        setVerifying(true);
        setFetchingPackages(true);
        try {
            const res = await vtuService.verifyMerchant({
                serviceID: provider,
                billersCode: smartcardNumber
            });
            setVerifiedUser(res.data);
            
            // Load packages
            const pkgRes = await vtuService.fetchDataPlans(provider);
            setPackages(pkgRes.data?.variations || pkgRes.data || []);
            
            toast.success("Card verified successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setVerifying(false);
            setFetchingPackages(false);
        }
    };

    const handleReset = () => {
        setVerifiedUser(null);
        setPackages([]);
        setPackageId('');
    };

    const selectedPackage = useMemo(() => 
        packages.find(p => p.variation_code === packageId), 
    [packages, packageId]);

    const amount = Number(selectedPackage?.variation_amount || 0);
    const insufficient = amount > balance;

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!packageId) {
            toast.error("Please select a package");
            return;
        }
        if (insufficient) {
            toast.error("Insufficient balance");
            return;
        }
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setShowPinModal(false);

        const providerName = providers.find(p => p.id === provider)?.name;
        const serviceTitle = `${providerName} - ${selectedPackage?.name}`;

        try {
            const res = await vtuService.buyCable({
                serviceID: provider,
                billersCode: smartcardNumber,
                variation_code: packageId,
                amount,
                phone: verifiedUser?.Customer_Phone || '',
                subscription_type: 'change', // specific to cable
                pin
            });

            await fetchBalance();
            navigate('/app/services/status', {
                state: {
                    status: 'success',
                    message: res.message || 'Subscription successful.',
                    transaction: {
                        service: serviceTitle,
                        amount,
                        target: smartcardNumber,
                        reference: res.data?.reference || res.data?.requestId || res.requestId,
                        timestamp: new Date().toLocaleTimeString()
                    }
                }
            });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Subscription failed.";
            toast.error(msg);
            navigate('/app/services/status', {
                state: {
                    status: 'error',
                    message: msg,
                    transaction: {
                        service: serviceTitle,
                        amount,
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
            {fetchingProviders ? (
                <ServiceSkeleton />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-8">
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <Row label="TV Provider">
                                    <Select value={provider} onChange={(e) => { setProvider(e.target.value); handleReset(); }} disabled={fetchingProviders}>
                                        {providers.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </Select>
                                </Row>
                                <Row label="Smartcard/IUC Number">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Search size={18} />
                                        </div>
                                        <Input
                                            placeholder="Enter IUC Number"
                                            value={smartcardNumber}
                                            onChange={(e: any) => { setSmartcardNumber(e.target.value); handleReset(); }}
                                            className="pl-12"
                                            required
                                        />
                                    </div>
                                </Row>
                            </div>
                            {!verifiedUser && (
                                <SubmitButton loading={verifying} disabled={verifying || !smartcardNumber}>
                                    Verify Decoder
                                </SubmitButton>
                            )}
                        </form>

                        {verifiedUser && (
                            <form onSubmit={handleInitiate} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                <Row label="Select Package">
                                    <Select 
                                        value={packageId} 
                                        onChange={(e) => setPackageId(e.target.value)}
                                        disabled={fetchingPackages}
                                    >
                                        <option value="">Choose a plan...</option>
                                        {packages.map((p) => (
                                            <option key={p.variation_code} value={p.variation_code}>
                                                {p.name} — {currency}{Number(p.variation_amount).toLocaleString()}
                                            </option>
                                        ))}
                                    </Select>
                                </Row>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Payable</p>
                                        <p className="text-xl font-bold text-slate-900">{currency}{amount.toLocaleString()}</p>
                                    </div>
                                    <SubmitButton loading={loading} disabled={loading || insufficient || fetchingPackages || !packageId}>
                                        Activate Plan
                                    </SubmitButton>
                                </div>
                            </form>
                        )}

                        {!verifiedUser && !verifying && (
                            <div className="bg-slate-50 p-5 rounded-2xl flex items-center gap-4 border border-white">
                                <Tv size={20} className="text-slate-400 shrink-0" />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                    A Secure handshake with {providers.find(p => p.id === provider)?.name} is required before package selection.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5">
                        {verifiedUser ? (
                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-3 text-emerald-600">
                                    <CheckCircle2 size={20} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Smart-Node Linked</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest">Customer Name</p>
                                        <p className="font-bold text-slate-900 text-base">{verifiedUser.Customer_Name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest">Current Status</p>
                                        <p className="font-bold text-slate-900 text-sm tracking-tight">{verifiedUser.Status || 'Active'}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={handleReset} className="text-[10px] font-bold text-emerald-600 underline uppercase tracking-widest">Switch Account</button>
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 border-dashed p-10 rounded-2xl text-center">
                                <Tv size={32} className="text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 text-xs font-medium">Verified customer identity will appear here after search.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <SecurePinModal 
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirm}
                loading={loading}
                title={`Verify ${providers.find(p => p.id === provider)?.name} Payment`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyCablePage;
