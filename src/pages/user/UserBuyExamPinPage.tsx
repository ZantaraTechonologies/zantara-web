import React, { useState } from 'react';
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SecurePinModal from '../../components/modals/SecurePinModal';
import { GraduationCap, AlertCircle, Info, Zap } from 'lucide-react';

const EXAM_TYPES = [
    { id: 'waec', name: 'WAEC Result Checker', price: 3500 },
    { id: 'neco', name: 'NECO Result Checker', price: 1200 },
    { id: 'jamb', name: 'JAMB UTME PIN', price: 4700 },
    { id: 'nabteb', name: 'NABTEB PIN', price: 1000 },
];

const UserBuyExamPinPage: React.FC = () => {
    const { balance, fetchBalance } = useWalletStore();
    const navigate = useNavigate();

    const [examType, setExamType] = useState(EXAM_TYPES[0].id);
    const [quantity, setQuantity] = useState(1);
    
    const [showPinModal, setShowPinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const selectedExam = EXAM_TYPES.find(e => e.id === examType) || EXAM_TYPES[0];
    const unitPrice = selectedExam.price;
    const totalAmount = unitPrice * quantity;
    const insufficient = totalAmount > balance;

    const handleInitiate = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        if (insufficient) {
            toast.error("Insufficient balance for this quantity");
            return;
        }
        setShowPinModal(true);
    };

    const handleConfirm = async (pin: string) => {
        if (loading) return;
        setLoading(true);
        setShowPinModal(false);

        const providerName = selectedExam.name;
        const serviceTitle = `${providerName} (${quantity} unit${quantity > 1 ? 's' : ''})`;
        const purchaseAmount = totalAmount;

        try {
            const res = await vtuService.buyExamPin({
                serviceID: examType,
                quantity,
                pin
            });
            
            await fetchBalance();
            navigate('/app/services/status', { 
                state: { 
                    status: 'success', 
                    message: res.message || 'Exam PIN purchase successful.',
                    transaction: {
                        service: serviceTitle,
                        amount: purchaseAmount,
                        target: providerName,
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
                        target: providerName,
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
            title="Educational PINs" 
            subtitle="Secure official exam result checkers and registration tokens."
        >
            <form onSubmit={handleInitiate} className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                    <Row label="Examination Body">
                        <Select value={examType} onChange={(e) => setExamType(e.target.value)}>
                            {EXAM_TYPES.map((e) => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </Select>
                    </Row>
                    <Row label="Quantity (Max 5)">
                        <Select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                            {[1, 2, 3, 4, 5].map((q) => (
                                <option key={q} value={q}>{q} Unit{q > 1 ? 's' : ''}</option>
                            ))}
                        </Select>
                    </Row>
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Unit Price</span>
                        <span className="text-slate-900 font-bold">₦{unitPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Quantity</span>
                        <span className="text-slate-900 font-bold">x {quantity}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Settlement</span>
                        <span className="text-2xl font-extrabold text-emerald-500 leading-none">₦{totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <Zap size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest italic leading-none mt-0.5">Instant Digital Delivery</span>
                    </div>
                    <SubmitButton loading={loading} disabled={loading || insufficient}>
                        Purchase PINs
                    </SubmitButton>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl flex items-start gap-4 border border-white">
                    <AlertCircle size={20} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Educational PINs are delivered as secure cryptographic tokens. A copy will be sent to your registered mobile number and stored in your Zantara ledger for future access.
                    </p>
                </div>
            </form>

            <SecurePinModal 
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onConfirm={handleConfirm}
                loading={loading}
                title={`Verify ${selectedExam.name} Purchase`}
            />
        </PurchaseLayout>
    );
};

export default UserBuyExamPinPage;
