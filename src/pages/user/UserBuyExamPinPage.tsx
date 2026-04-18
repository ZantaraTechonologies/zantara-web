import React, { useState, useEffect } from 'react';
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SecurePinModal from '../../components/modals/SecurePinModal';
import { GraduationCap, AlertCircle, Zap, CheckCircle2, User, Search } from 'lucide-react';
import { ServiceSkeleton } from '../../components/feedback/Skeletons';

// JAMB uses billersCode (profile ID) verification before purchase
const EXAM_BODIES = [
    { id: 'waec', name: 'WAEC', label: 'WAEC Result Checker', emoji: '📗', requiresVerification: false },
    { id: 'neco', name: 'NECO', label: 'NECO Result Checker', emoji: '📘', requiresVerification: false },
    { id: 'nabteb', name: 'NABTEB', label: 'NABTEB Result Checker', emoji: '📙', requiresVerification: false },
    { id: 'jamb', name: 'JAMB', label: 'JAMB e-PIN / Registration', emoji: '🎓', requiresVerification: true },
];

type ExamType = { id: string; name: string; label: string; emoji: string; price?: number; requiresVerification: boolean };

const UserBuyExamPinPage: React.FC = () => {
    const { balance, fetchBalance, currency } = useWalletStore();
    const navigate = useNavigate();

    const [fetching, setFetching] = useState(true);
    const [examVariations, setExamVariations] = useState<any[]>([]);
    const [selectedBody, setSelectedBody] = useState(EXAM_BODIES[0]);
    const [selectedVariation, setSelectedVariation] = useState('');
    const [quantity, setQuantity] = useState(1);

    // JAMB profile verification
    const [jambProfileId, setJambProfileId] = useState('');
    const [verifyingJamb, setVerifyingJamb] = useState(false);
    const [jambProfile, setJambProfile] = useState<any>(null);

    const [showPinModal, setShowPinModal] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadVariations = async () => {
            setFetching(true);
            setSelectedVariation('');
            setJambProfile(null);
            try {
                // Use the correct serviceID for each provider
                const serviceId = selectedBody.id; // jamb, waec, neco, nabteb
                const res = await vtuService.fetchDataPlans(serviceId);
                const fetched = res.data?.content?.variations || res.data?.variations || (Array.isArray(res.data) ? res.data : []);
                if (fetched.length > 0) {
                    setExamVariations(fetched);
                    setSelectedVariation(fetched[0].variation_code);
                } else {
                    // Hardcoded fallbacks for when API returns nothing
                    const FALLBACKS: Record<string, { variation_code: string; name: string; variation_amount: number }[]> = {
                        waec:   [{ variation_code: 'waec', name: 'WAEC Result Checker', variation_amount: 3500 }],
                        neco:   [{ variation_code: 'neco', name: 'NECO Result Checker', variation_amount: 1000 }],
                        nabteb: [{ variation_code: 'nabteb', name: 'NABTEB Result Checker', variation_amount: 1000 }],
                        jamb:   [{ variation_code: 'utme', name: 'JAMB UTME PIN', variation_amount: 3500 }],
                    };
                    const fallback = FALLBACKS[selectedBody.id] || [{ variation_code: selectedBody.id, name: selectedBody.label, variation_amount: 3500 }];
                    setExamVariations(fallback);
                    setSelectedVariation(fallback[0].variation_code);
                }
            } catch (err) {
                console.error("Failed to fetch exam variations", err);
                // Always fall back to a known price so amount is never 0
                const fallback = [{ variation_code: selectedBody.id, name: selectedBody.label, variation_amount: 3500 }];
                setExamVariations(fallback);
                setSelectedVariation(fallback[0].variation_code);
            } finally {
                setFetching(false);
            }
        };
        loadVariations();
    }, [selectedBody]);

    const currentVariation = examVariations.find(v => v.variation_code === selectedVariation);
    const unitPrice = Number(currentVariation?.variation_amount) || 0;
    const totalAmount = unitPrice * (selectedBody.id === 'jamb' ? 1 : quantity);
    const insufficient = totalAmount > balance;

    const handleJambVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jambProfileId || verifyingJamb) return;
        setVerifyingJamb(true);
        try {
            const res = await vtuService.verifyMerchant({ serviceID: 'jamb', billersCode: jambProfileId });
            const verified = res.data?.content || res.data;
            setJambProfile(verified);
            toast.success("JAMB profile verified!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Could not verify JAMB Profile ID");
        } finally {
            setVerifyingJamb(false);
        }
    };

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        if (selectedBody.requiresVerification && !jambProfile) {
            toast.error("Please verify your JAMB Profile ID first");
            return;
        }
        if (!totalAmount || totalAmount <= 0) {
            toast.error("Could not determine purchase price. Please refresh and try again.");
            return;
        }
        if (insufficient) { toast.error("Insufficient balance"); return; }
        setPinError(null);
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setPinError(null);
        const serviceTitle = `${selectedBody.name} - ${currentVariation?.name || selectedBody.label}`;
        const purchaseAmount = Number(totalAmount) || 0;
        try {
            const payload: any = {
                serviceID: selectedBody.id,
                variation_code: selectedVariation,
                amount: purchaseAmount,
                phone: '',
                pin
            };
            if (selectedBody.id === 'jamb') {
                payload.billersCode = jambProfileId;
                payload.quantity = 1;
            } else {
                payload.quantity = quantity;
            }
            const res = await vtuService.buyExamPin(payload);
            await fetchBalance();
            setShowPinModal(false);
            navigate('/app/services/status', { state: { status: 'success', message: res.message || 'PIN purchase successful.', transaction: { service: serviceTitle, amount: purchaseAmount, target: selectedBody.name, reference: res.data?.reference || res.data?.requestId, timestamp: new Date().toLocaleTimeString() } } });
        } catch (err: any) {
            const msg = err.response?.data?.message || "Purchase failed.";
            setPinError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PurchaseLayout title="Educational PINs" subtitle="Secure official exam checkers and JAMB registration tokens.">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT: Form */}
                <div className="flex-1 space-y-6">
                    {/* Exam Body Selector */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Examination Body</p>
                        <div className="flex gap-3 flex-wrap">
                            {EXAM_BODIES.map(body => (
                                <button key={body.id} type="button"
                                    onClick={() => { setSelectedBody(body); setJambProfile(null); setJambProfileId(''); }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                                        selectedBody.id === body.id
                                            ? 'bg-slate-900 text-emerald-400 border-transparent shadow-lg scale-105'
                                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200'
                                    }`}>
                                    <span className="text-base">{body.emoji}</span>
                                    <span>{body.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {fetching ? (
                        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                    ) : (
                        <>
                            {/* Variation selector */}
                            {examVariations.length > 1 && (
                                <Row label="Select Package">
                                    <Select value={selectedVariation} onChange={(e) => setSelectedVariation(e.target.value)}>
                                        {examVariations.map(v => (
                                            <option key={v.variation_code} value={v.variation_code}>
                                                {v.name} — {currency}{Number(v.variation_amount).toLocaleString()}
                                            </option>
                                        ))}
                                    </Select>
                                </Row>
                            )}

                            {/* JAMB: Profile Verification */}
                            {selectedBody.id === 'jamb' && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                                        <p className="text-xs font-bold text-blue-700 mb-1">JAMB Profile Verification Required</p>
                                        <p className="text-[10px] text-blue-600 font-medium">Enter your JAMB Profile ID to verify your candidacy before purchasing.</p>
                                    </div>
                                    {!jambProfile ? (
                                        <form onSubmit={handleJambVerify} className="flex gap-3">
                                            <div className="flex-1 relative">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <Input placeholder="Enter JAMB Profile ID" value={jambProfileId}
                                                    onChange={(e: any) => setJambProfileId(e.target.value.trim())}
                                                    className="pl-10" required />
                                            </div>
                                            <SubmitButton loading={verifyingJamb} disabled={verifyingJamb || !jambProfileId}>
                                                Verify
                                            </SubmitButton>
                                        </form>
                                    ) : (
                                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-2">
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <CheckCircle2 size={16} />
                                                <span className="text-xs font-bold">Profile Verified</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <User size={15} className="text-emerald-500 shrink-0" />
                                                <div>
                                                    <p className="text-[9px] text-emerald-600/60 font-bold uppercase tracking-widest">Candidate Name</p>
                                                    <p className="font-bold text-slate-900 text-sm">{jambProfile?.Candidate_Name || jambProfile?.name || 'Verified'}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => { setJambProfile(null); setJambProfileId(''); }}
                                                className="text-[10px] font-bold text-emerald-600 underline uppercase tracking-widest">
                                                Change Profile ID
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Non-JAMB: Quantity */}
                            {selectedBody.id !== 'jamb' && (
                                <Row label="Quantity (Max 5)">
                                    <Select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                                        {[1, 2, 3, 4, 5].map(q => <option key={q} value={q}>{q} Unit{q > 1 ? 's' : ''}</option>)}
                                    </Select>
                                </Row>
                            )}
                        </>
                    )}

                    <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100">
                        <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            PINs are delivered as secure tokens and also saved in your Zantara transaction history for future access.
                        </p>
                    </div>
                </div>

                {/* RIGHT: Summary */}
                <div className="lg:w-72">
                    <div className="sticky top-4 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Summary</p>

                        <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center gap-4">
                            <span className="text-3xl">{selectedBody.emoji}</span>
                            <div>
                                <p className="font-black text-base">{selectedBody.name}</p>
                                <p className="text-slate-400 text-xs">{selectedBody.label}</p>
                            </div>
                        </div>

                        {!fetching && currentVariation && (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Package</span>
                                    <span className="font-bold text-slate-900 text-right max-w-[130px] leading-tight">{currentVariation.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Unit Price</span>
                                    <span className="font-bold text-slate-900">{currency}{unitPrice.toLocaleString()}</span>
                                </div>
                                {selectedBody.id !== 'jamb' && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Quantity</span>
                                        <span className="font-bold text-slate-900">x {quantity}</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 pt-2 flex justify-between">
                                    <span className="font-bold text-slate-700">Total</span>
                                    <span className="font-extrabold text-emerald-600 text-lg">{currency}{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-3 space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Wallet Balance</p>
                            <p className={`text-base font-extrabold ${insufficient ? 'text-red-500' : 'text-slate-900'}`}>
                                {currency}{balance.toLocaleString()}
                            </p>
                            {insufficient && <p className="text-[10px] text-red-500 font-bold">Insufficient balance</p>}
                        </div>

                        <form onSubmit={handleInitiate}>
                            <SubmitButton loading={loading} disabled={loading || insufficient || fetching || !selectedVariation || (selectedBody.requiresVerification && !jambProfile)}>
                                Purchase PINs
                            </SubmitButton>
                        </form>

                        <div className="flex items-center gap-2 text-emerald-600 justify-center">
                            <Zap size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Instant Digital Delivery</span>
                        </div>
                    </div>
                </div>
            </div>

            <SecurePinModal
                isOpen={showPinModal}
                onClose={() => { setShowPinModal(false); setPinError(null); }}
                onConfirm={handleConfirm}
                loading={loading}
                error={pinError}
                title={`Verify ${selectedBody.name} Purchase`} />
        </PurchaseLayout>
    );
};

export default UserBuyExamPinPage;
