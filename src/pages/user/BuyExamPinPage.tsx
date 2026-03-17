import { FormEvent, useMemo, useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Select, SubmitButton, Input } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWallet } from "../../hooks/useWallet";
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
    const { data: wallet } = useWallet();
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
    const insufficient = ((wallet as any)?.balance ?? 0) < total || total <= 0;

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
        "w-full rounded-xl px-3 py-2 outline-none transition ring-0 " +
        (showPhoneErr ? "border border-red-500 focus:ring-2 focus:ring-red-500" : "border border-slate-300 focus:ring-2 focus:ring-blue-500");

    return (
        <PurchaseLayout title="Buy Exam PINs" subtitle="Receive PINs instantly via email and dashboard.">
            <form className="grid gap-4" onSubmit={onSubmit}>
                {serverMsg && (
                    <div className={"rounded-xl border p-3 sm:p-4 " + (serverType === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800")}>
                        <p className="font-medium">{serverMsg}</p>
                        {serverType === "success" && receiptHref && !receiptHref.includes("dashboard") && (
                            <div className="mt-2 p-2 bg-white rounded border border-green-200 text-center font-mono text-lg tracking-wider select-all">
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
                            <div className="mt-2 text-right">
                                <a href={receiptHref} className="text-sm font-medium text-blue-600 hover:underline">View receipt →</a>
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