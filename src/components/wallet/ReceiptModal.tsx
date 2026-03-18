// src/components/wallet/ReceiptModal.tsx
import type { TxLog } from "../../services/transactions/transactionService";
import { buildReceiptHTML, downloadReceiptHTML, printReceipt } from "./receipt";

export default function ReceiptModal({ tx, onClose }: { tx: TxLog & { _orig?: any }; onClose: () => void }) {
    const html = buildReceiptHTML(tx);

    return (
        <div className="fixed inset-0 z-50">
            {/* Transparent overlay (click outside to close) */}
            <div className="absolute inset-0 bg-transparent" onClick={onClose} aria-hidden="true" />
            <div className="absolute inset-x-0 top-16 mx-auto w-[92%] max-w-2xl">
                <div className="rounded-2xl shadow-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-800">Receipt</h4>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => downloadReceiptHTML(tx)}
                                className="text-xs px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-100"
                            >
                                Download (HTML)
                            </button>
                            <button
                                onClick={() => printReceipt(tx)}
                                className="text-xs px-3 py-1 rounded-full border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-700"
                            >
                                Print / Save PDF
                            </button>
                            <button
                                onClick={onClose}
                                className="text-xs px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Receipt preview */}
                    <div className="p-4">
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <iframe title="Receipt Preview" className="w-full h-[480px] bg-white" srcDoc={html} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
