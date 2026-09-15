import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Printer,
    Share2,
    ShieldCheck,
    Clock,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import { useTransactionDetails } from '../../hooks/useWallet';
import { TxLog } from '../../services/transactions/transactionService';
import {
    buildReceiptModel,
    CustomerTransaction,
    ReceiptModel,
} from '../../utils/receiptUtils';
import { useSiteSettings } from '../../app/SiteSettingsContext';

const STATUS_STYLES: Record<string, { chip: string; icon: typeof ShieldCheck }> = {
    'Success': { chip: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: ShieldCheck },
    'Pending': { chip: 'bg-orange-50 text-orange-600 border-orange-100', icon: Clock },
    'Reversed': { chip: 'bg-orange-50 text-orange-600 border-orange-100', icon: RefreshCw },
    'Failed': { chip: 'bg-red-50 text-red-600 border-red-100', icon: XCircle },
    'Refunded': { chip: 'bg-blue-50 text-blue-600 border-blue-100', icon: ShieldCheck },
    'Skipped': { chip: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock },
};

const toCustomerTransaction = (tx: TxLog): CustomerTransaction => ({
    _id: tx.id,
    transactionId: tx.id,
    refId: tx.refId,
    type: tx.type,
    service: tx.service,
    amount: tx.amount,
    status: tx.status,
    currency: tx.currency,
    createdAt: tx.createdAt,
    details: tx.details,
    metadata: tx.metadata,
});

const ReceiptPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: tx, isLoading, error } = useTransactionDetails(id);
    const { settings } = useSiteSettings();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <RefreshCw size={32} className="text-emerald-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forging Digital Receipt...</p>
            </div>
        );
    }

    if (error || !tx) {
        return (
            <div className="max-w-md mx-auto text-center py-20">
                <XCircle size={48} className="text-red-500 mx-auto" />
                <h2 className="text-xl font-bold text-slate-900 mt-4">Receipt Error</h2>
                <p className="text-slate-500 text-sm mt-2">Could not load the receipt for this transaction.</p>
                <button onClick={() => navigate(-1)} className="mt-6 text-emerald-500 font-bold uppercase text-xs tracking-widest">Go Back</button>
            </div>
        );
    }

    const model: ReceiptModel = buildReceiptModel(toCustomerTransaction(tx), {
        displayName: settings.SITE_NAME,
        logo: settings.SITE_LOGO,
        supportEmail: settings.SUPPORT_EMAIL,
        supportPhone: settings.SUPPORT_PHONE,
        website: settings.SITE_URL,
    });

    const { transaction, brand, beneficiary, categoryDetails, receipt } = model;
    const statusStyle = STATUS_STYLES[transaction.status] || STATUS_STYLES['Pending'];
    const StatusIcon = statusStyle.icon;

    const handleShare = async () => {
        const shareText = [
            `${brand.displayName} — Transaction Receipt`,
            `Service: ${transaction.serviceDisplayName}`,
            `Amount: ${transaction.amountText}`,
            `Status: ${transaction.status}`,
            `Reference: ${transaction.reference}`,
            `Date: ${transaction.transactionDate}`,
            `Generated: ${receipt.generatedAt}`,
        ].join('\n');

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Transaction Receipt', text: shareText });
                return;
            } catch {
                // user cancelled or unsupported — fall through to clipboard
            }
        }
        try {
            await navigator.clipboard.writeText(shareText);
        } catch {
            // clipboard unavailable — no-op
        }
    };

    const printReceipt = () => {
        window.print();
    };

    return (
        <div className="max-w-lg mx-auto py-8 px-4 font-sans">
            {/* Action Bar (Hidden on Print) */}
            <div className="flex items-center justify-between mb-8 print:hidden">
                <button
                    onClick={() => navigate(`/app/transactions/${id}`)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={printReceipt}
                        className="p-3 bg-surface border border-slate-100 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm transition-all"
                        title="Print / Save as PDF"
                    >
                        <Printer size={20} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-3 bg-surface border border-slate-100 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm transition-all"
                        title="Share Receipt"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Receipt Content */}
            <div className="bg-surface border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden print:shadow-none print:border-none print:p-0">
                <div className="absolute top-0 left-0 w-full h-2 bg-brand-emerald"></div>

                <div className="space-y-6 text-center">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            {brand.logo ? (
                                <img src={brand.logo} alt={brand.displayName} className="h-10 w-10 object-contain" />
                            ) : (
                                <div className="bg-brand-navy text-white p-2.5 rounded-xl">
                                    <ShieldCheck size={24} />
                                </div>
                            )}
                            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">{brand.displayName}</span>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Transaction Receipt</h2>
                            <p className="text-xs font-bold text-slate-400">Issued on {receipt.generatedAt}</p>
                        </div>
                    </div>

                    <div className="py-6 border-y border-dashed border-slate-200 space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Value</p>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{transaction.amountText}</h1>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyle.chip}`}>
                            <StatusIcon size={10} />
                            {transaction.status}
                        </div>
                    </div>

                    <div className="space-y-6 text-left">
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service</p>
                                <p className="text-sm font-bold text-slate-900">{transaction.serviceDisplayName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-bold text-slate-900 capitalize">{transaction.status}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                                <p className="text-sm font-bold text-slate-900 font-sans">{transaction.transactionDate}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Currency</p>
                                <p className="text-sm font-bold text-slate-900">{transaction.currency}</p>
                            </div>
                        </div>

                        {categoryDetails.length > 0 && (
                            <div className="bg-slate-50/50 p-5 rounded-2xl space-y-2 border border-slate-100">
                                {categoryDetails.map((row, idx) => (
                                    <div key={idx} className="flex items-start justify-between gap-4">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.label}</p>
                                        <p className="text-sm font-bold text-slate-900 text-right break-all">{row.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {beneficiary?.identifier && (
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        {beneficiary.displayName ? 'Beneficiary' : 'Identifier'}
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {beneficiary.displayName || beneficiary.identifier}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                                    <p className="text-sm font-bold text-slate-900">{transaction.paymentMethod}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-50/50 p-5 rounded-2xl space-y-1 border border-slate-100 group">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction Reference</p>
                            <p className="text-sm font-bold text-slate-900 break-all family-mono tracking-tight">{transaction.reference}</p>
                        </div>
                    </div>

                    <div className="pt-8 space-y-6">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center leading-relaxed">
                            This is a computer-generated receipt.
                        </div>

                        <div className="text-[9px] text-slate-500 font-medium px-6 text-center leading-relaxed">
                            This is a computer-generated receipt for your {transaction.serviceDisplayName.toLowerCase()} transaction on {brand.displayName}.
                            {brand.supportEmail ? ` For inquiries, contact ${brand.supportEmail}` : ''}
                            {brand.supportPhone ? ` or call ${brand.supportPhone}` : ''}.
                        </div>
                    </div>
                </div>

                <style>{`
                    @media print {
                        body { background: white !important; }
                        .no-print { display: none !important; }
                        header, aside { display: none !important; }
                        main { overflow: visible !important; padding: 0 !important; }
                        .h-screen { height: auto !important; overflow: visible !important; }
                        @page { margin: 0; }
                        body { margin: 1.6cm; }
                    }
                `}</style>
            </div>

            <div className="mt-8 text-center print:hidden">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">End of Record</p>
            </div>
        </div>
    );
};

export default ReceiptPage;