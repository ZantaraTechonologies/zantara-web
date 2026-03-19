import React, { useState } from 'react';
import { useCreateTicket } from '../../hooks/useSupport';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, HelpCircle, Info } from 'lucide-react';

const CreateTicketPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get('txId') || '';
    
    const { mutate: create, isPending } = useCreateTicket();
    
    const [formData, setFormData] = useState({
        subject: '',
        priority: 'medium',
        message: '',
        transactionId: transactionId
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        create(formData, {
            onSuccess: () => navigate('/app/support')
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/app/support" className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Support Ticket</h1>
                    <p className="text-slate-500 text-xs font-medium">Describe your issue and we'll get back to you shortly.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Issue Subject</label>
                        <input 
                            type="text"
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            placeholder="e.g., Data purchase failed but debited"
                            className="w-full bg-slate-50 border-0 text-sm font-bold text-slate-900 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['low', 'medium', 'high'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({...formData, priority: p})}
                                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                            formData.priority === p 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Transaction ID */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Transaction Ref (Optional)</label>
                            <input 
                                type="text"
                                value={formData.transactionId}
                                onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                                placeholder="e.g., TX-12345678"
                                className="w-full bg-slate-50 border-0 text-sm font-bold text-slate-900 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                        <textarea 
                            required
                            rows={6}
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            placeholder="Please provide as much detail as possible..."
                            className="w-full bg-slate-50 border-0 text-sm font-medium text-slate-900 p-6 rounded-3xl focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 resize-none"
                        />
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100/30 flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                            <HelpCircle className="text-emerald-500" size={20} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest">Support Protocol</p>
                            <p className="text-emerald-600 font-medium text-[11px] leading-relaxed">
                                Our support team typically responds within 1-2 business hours. For immediate assistance with ongoing transactions, please include the reference ID.
                            </p>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isPending || !formData.subject || !formData.message}
                        className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                            isPending ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-950 text-white hover:bg-emerald-500 hover:text-slate-950 shadow-slate-200'
                        }`}
                    >
                        {isPending ? 'Transmitting...' : 'Submit Support Ticket'}
                        <Send size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-2 justify-center text-slate-300">
                    <Info size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest italic">Encrypted Secure Support Transmission</span>
                </div>
            </form>
        </div>
    );
};

export default CreateTicketPage;
