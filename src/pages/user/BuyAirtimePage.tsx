import { FormEvent, useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWallet } from "../../hooks/useWallet";
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
    const { data: wallet } = useWallet();
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
    const insufficient = ((wallet as any)?.balance ?? 0) < total || total <= 0;

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
        "w-full rounded-xl px-3 py-2 outline-none transition ring-0 " +
        (showPhoneErr ? "border border-red-500 focus:ring-2 focus:ring-red-500" : "border border-slate-300 focus:ring-2 focus:ring-blue-500");

    return (
        <PurchaseLayout title="Buy Airtime" subtitle="Instant recharge to any mobile network.">
            <form className="grid gap-4" onSubmit={onSubmit}>
                {serverMsg && (
                    <div className={"rounded-xl border p-3 sm:p-4 " + (serverType === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800")}>
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
                            <div className="mt-2 text-right">
                                <a href={receiptHref} className="text-sm font-medium text-blue-600 hover:underline">View receipt →</a>
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