import { FormEvent, useMemo, useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Select, SubmitButton, Input } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";

const AUTO_REDIRECT_RECEIPT = false;

// Helpers
const to234 = (v: string) => {
    const d = (v || "").replace(/\D+/g, "");
    if (!d) return "";
    if (d.startsWith("0")) return "234" + d.slice(1);
    if (d.startsWith("234")) return d;
    return d;
};
const isValidNgMobile = (v: string) => /^234[789]\d{9}$/.test(to234(v));

const EXAMS = ["WAEC", "NECO", "JAMB", "NBAIS"] as const;
const PRICES: Record<(typeof EXAMS)[number], number> = { WAEC: 7200, NECO: 6200, JAMB: 4500, NBAIS: 3500 };
const VARIATION_MAP: Record<(typeof EXAMS)[number], string> = { WAEC: "waec-pin", NECO: "neco-pin", JAMB: "jamb-pin", NBAIS: "nbais-pin" };

export default function BuyExamPinPage() {
    const { balance } = useWalletStore();
    const navigate = useNavigate();

    const [exam, setExam] = useState<(typeof EXAMS)[number]>("WAEC");
    const [qty, setQty] = useState<number | "">("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const [serverMsg, setServerMsg] = useState<string | null>(null);
    const [serverType, setServerType] = useState<"success" | "error" | null>(null);
    const [receiptHref, setReceiptHref] = useState<string | null>(null);

    const [phoneTouched, setPhoneTouched] = useState(false);
    const phoneOk = isValidNgMobile(phone);
    const showPhoneErr = phoneTouched && !phoneOk;

    const unit = PRICES[exam];
    const total = useMemo(() => (Number(qty || 0) * unit) || 0, [qty, unit]);
    const insufficient = balance < total || total <= 0;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setServerMsg(null); setServerType(null); setReceiptHref(null);
        setPhoneTouched(true);
        if (!phoneOk) return;
        if (insufficient) { setServerMsg("Insufficient wallet balance."); setServerType("error"); return; }

        setLoading(true);
        try {
            // Backend returns { message, pin } (no explicit ref in body) :contentReference[oaicite:3]{index=3}
            const payload = { variation_code: VARIATION_MAP[exam], amount: total, quantity: Number(qty || 0), phone: to234(phone) };
            const res = await vtuService.buyExamPin(payload);
            setServerMsg(res?.message || "PIN purchased successfully.");
            setServerType("success");

            // Display PIN if returned
            if (res?.pin) {
                setReceiptHref(res.pin); // Use this state to show PIN in the alert box
            } else {
                // We don't get ref back; point to transactions page (you could also return ref from backend)
                const href = `/dashboard/transactions`;
                setReceiptHref(href);
                if (AUTO_REDIRECT_RECEIPT) navigate(href);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "PIN purchase failed";
            setServerMsg(msg);
            setServerType("error");
        } finally { setLoading(false); }
    }

    const phoneInputClass =
        "w-full rounded-xl px-4 py-3 outline-none transition ring-0 " +
        (showPhoneErr ? "border border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50" : "border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50");

    return (
        <PurchaseLayout title="Buy Exam PINs" subtitle="Receive PINs instantly via email and dashboard.">
            <form className="grid gap-6" onSubmit={onSubmit}>
                {serverMsg && (
                    <div className={"rounded-2xl border p-4 sm:p-5 font-medium text-sm flex flex-col gap-3 " + (serverType === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800")}>
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${serverType === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <p className="font-bold uppercase tracking-tight">{serverMsg}</p>
                        </div>
                        {serverType === "success" && receiptHref && !receiptHref.includes("dashboard") && (
                            <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-emerald-100 text-center font-mono text-xl font-black text-emerald-600 tracking-[0.2em] select-all">
                                {receiptHref}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                    <Row label="Exam">
                        <Select value={exam} onChange={(e) => { setExam(e.target.value as any); setServerMsg(null); setServerType(null); }}>
                            {EXAMS.map((x) => (<option key={x} value={x}>{x}</option>))}
                        </Select>
                    </Row>

                    <Row label="Quantity">
                        <Input inputMode="numeric" placeholder="e.g., 2" value={qty} onChange={(e: any) => { setQty(e.target.value ? Number(e.target.value) : ""); setServerMsg(null); setServerType(null); }} />
                    </Row>
                </div>

                <Row label="Phone number (required)">
                    <div className="w-full">
                        <Input
                            type="tel"
                            inputMode="tel"
                            placeholder="0801 234 5678 or 2348012345678"
                            value={phone}
                            onChange={(e: any) => { setPhone(e.target.value); setServerMsg(null); setServerType(null); }}
                            onBlur={() => setPhoneTouched(true)}
                            aria-invalid={showPhoneErr ? "true" : "false"}
                            className={phoneInputClass}
                        />
                        {showPhoneErr && <p className="mt-1 text-sm text-red-600">Please enter a valid Nigerian mobile number.</p>}

                        {receiptHref && serverType === "success" && receiptHref.includes("dashboard") && (
                            <div className="mt-3 text-right">
                                <a href={receiptHref} className="text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 flex items-center justify-end gap-1 group">
                                    View Receipt
                                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                                </a>
                            </div>
                        )}
                    </div>
                </Row>

                <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-slate-600">
                        Total: <span className="font-bold text-slate-900">₦{total}</span>
                    </div>
                    <SubmitButton loading={loading} disabled={loading || insufficient || !phoneOk || !qty}>
                        {insufficient ? "Insufficient Balance" : "Buy PINs"}
                    </SubmitButton>
                </div>
            </form>
        </PurchaseLayout>
    );
}