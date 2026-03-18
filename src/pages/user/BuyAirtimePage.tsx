import { FormEvent, useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";

const AUTO_REDIRECT_RECEIPT = false;

const to234 = (v: string) => {
    const d = (v || "").replace(/\D+/g, "");
    if (!d) return "";
    if (d.startsWith("0")) return "234" + d.slice(1);
    if (d.startsWith("234")) return d;
    return d;
};
const isValidNgMobile = (v: string) => /^234[789]\d{9}$/.test(to234(v));
const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"] as const;

export default function BuyAirtimePage() {
    const { balance } = useWalletStore();
    const navigate = useNavigate();

    const [network, setNetwork] = useState<(typeof NETWORKS)[number]>("MTN");
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    const [loading, setLoading] = useState(false);

    const [serverMsg, setServerMsg] = useState<string | null>(null);
    const [serverType, setServerType] = useState<"success" | "error" | null>(null);
    const [receiptHref, setReceiptHref] = useState<string | null>(null);

    const [phoneTouched, setPhoneTouched] = useState(false);
    const phoneOk = isValidNgMobile(phone);
    const showPhoneErr = phoneTouched && !phoneOk;

    const total = Number(amount || 0);
    const insufficient = balance < total || total <= 0;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setServerMsg(null);
        setServerType(null);
        setReceiptHref(null);
        setPhoneTouched(true);

        if (!phoneOk) return;
        if (insufficient) {
            setServerMsg("Insufficient wallet balance.");
            setServerType("error");
            return;
        }

        setLoading(true);
        try {
            const res = await vtuService.buyAirtime({ network, phone: to234(phone), amount: total });
            setServerMsg(res?.message || "Airtime sent successfully.");
            setServerType("success");
            const v = res?.data || {};
            const ref = v.ref || v.reference || v.requestId || v.transactionId || null;
            const href = `/dashboard/transactions${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
            setReceiptHref(href);
            if (AUTO_REDIRECT_RECEIPT) navigate(href);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Airtime purchase failed";
            setServerMsg(msg);
            setServerType("error");
        } finally {
            setLoading(false);
        }
    }

    const phoneInputClass =
        "w-full rounded-xl px-4 py-3 outline-none transition ring-0 " +
        (showPhoneErr ? "border border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50" : "border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50");

    return (
        <PurchaseLayout title="Buy Airtime" subtitle="Instant recharge to any mobile network.">
            <form className="grid gap-6" onSubmit={onSubmit}>
                {serverMsg && (
                    <div className={"rounded-2xl border p-4 sm:p-5 font-medium text-sm flex items-center gap-3 " + (serverType === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800")}>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${serverType === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        {serverMsg}
                    </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                    <Row label="Network">
                        <Select value={network} onChange={(e) => { setNetwork(e.target.value as any); setServerMsg(null); setServerType(null); }}>
                            {NETWORKS.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </Select>
                    </Row>

                    <Row label="Amount (₦)">
                        <Input
                            inputMode="numeric"
                            placeholder="e.g., 500"
                            value={amount}
                            onChange={(e: any) => { setAmount(e.target.value ? Number(e.target.value) : ""); setServerMsg(null); setServerType(null); }}
                        />
                    </Row>
                </div>

                <Row label="Phone number">
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

                        {receiptHref && serverType === "success" && (
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
                        Total: <span className="font-bold text-slate-900">₦{total || 0}</span>
                    </div>
                    <SubmitButton loading={loading} disabled={loading || insufficient || !phoneOk}>
                        {insufficient ? "Insufficient Balance" : "Buy Airtime"}
                    </SubmitButton>
                </div>
            </form>
        </PurchaseLayout>
    );
}