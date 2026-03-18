import { FormEvent, useMemo, useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";

const AUTO_REDIRECT_RECEIPT = false;

// Helpers
const DIGITS = (v: string) => (v || "").replace(/\D+/g, "");
const isValidSmartcard = (provider: "DSTV" | "GOtv" | "Startimes", v: string) => {
    const d = DIGITS(v);
    if (provider === "Startimes") return /^\d{11}$/.test(d);
    return /^\d{10}$/.test(d);
};

const PROVIDERS = ["DSTV", "GOtv", "Startimes"] as const;
const SERVICE_ID_MAP: Record<(typeof PROVIDERS)[number], string> = { DSTV: "dstv", GOtv: "gotv", Startimes: "startimes" };
const PACKAGES: Record<(typeof PROVIDERS)[number], { code: string; name: string; price: number }[]> = {
    DSTV: [{ code: "dstv-padi", name: "Padi", price: 2500 }, { code: "dstv-compact", name: "Compact", price: 12100 }],
    GOtv: [{ code: "gotv-smallie", name: "Smallie", price: 1100 }, { code: "gotv-max", name: "Max", price: 5500 }],
    Startimes: [{ code: "star-nova", name: "Nova", price: 900 }, { code: "star-smart", name: "Smart", price: 2600 }],
};

export default function BuyCablePage() {
    const { balance } = useWalletStore();
    const navigate = useNavigate();

    const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>("DSTV");
    const [packageCode, setPackageCode] = useState(PACKAGES["DSTV"][0].code);
    const [smartcard, setSmartcard] = useState("");
    const [loading, setLoading] = useState(false);

    const [serverMsg, setServerMsg] = useState<string | null>(null);
    const [serverType, setServerType] = useState<"success" | "error" | null>(null);
    const [receiptHref, setReceiptHref] = useState<string | null>(null);

    const [cardTouched, setCardTouched] = useState(false);
    const cardOk = isValidSmartcard(provider, smartcard);
    const showCardErr = cardTouched && !cardOk;

    const pack = useMemo(() => PACKAGES[provider].find((p) => p.code === packageCode) ?? PACKAGES[provider][0], [provider, packageCode]);
    const amount = pack?.price ?? 0;
    const insufficient = balance < amount;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setServerMsg(null);
        setServerType(null);
        setReceiptHref(null);
        setCardTouched(true);
        if (!pack || !cardOk) return;
        if (insufficient) {
            setServerMsg("Insufficient wallet balance.");
            setServerType("error");
            return;
        }

        setLoading(true);
        try {
            // Backend returns { message, data: response } for cable recharge
            const payload = {
                serviceID: SERVICE_ID_MAP[provider],
                billersCode: DIGITS(smartcard),
                variation_code: packageCode,
                amount,
            };
            const res = await vtuService.buyCable(payload);
            setServerMsg(res?.message || "Cable subscription successful.");
            setServerType("success");
            const v = res?.data || {};
            const ref = v.ref || v.reference || v.requestId || v.transactionId || null;
            const href = `/dashboard/transactions${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
            setReceiptHref(href);
            if (AUTO_REDIRECT_RECEIPT) navigate(href);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Cable subscription failed";
            setServerMsg(msg);
            setServerType("error");
        } finally {
            setLoading(false);
        }
    }

    const cardInputClass =
        "w-full rounded-xl px-4 py-3 outline-none transition ring-0 " +
        (showCardErr ? "border border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50" : "border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50");

    return (
        <PurchaseLayout title="Cable TV Subscription" subtitle="Renew your bouquet in seconds.">
            <form className="grid gap-6" onSubmit={onSubmit}>
                {serverMsg && (
                    <div className={"rounded-2xl border p-4 sm:p-5 font-medium text-sm flex items-center gap-3 " + (serverType === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800")}>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${serverType === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        {serverMsg}
                    </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                    <Row label="Provider">
                        <Select
                            value={provider}
                            onChange={(e) => {
                                const v = e.target.value as (typeof PROVIDERS)[number];
                                setProvider(v);
                                setPackageCode(PACKAGES[v][0].code);
                                setServerMsg(null);
                                setServerType(null);
                            }}
                        >
                            {PROVIDERS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </Select>
                    </Row>

                    <Row label="Package">
                        <Select
                            value={packageCode}
                            onChange={(e) => {
                                setPackageCode(e.target.value);
                                setServerMsg(null);
                                setServerType(null);
                            }}
                        >
                            {PACKAGES[provider].map((p) => (
                                <option key={p.code} value={p.code}>{p.name} — ₦{p.price}</option>
                            ))}
                        </Select>
                    </Row>
                </div>

                <Row label="Smartcard / IUC number">
                    <div className="w-full">
                        <Input
                            inputMode="numeric"
                            placeholder={provider === "Startimes" ? "11-digit Startimes number" : "10-digit DSTV/GOtv number"}
                            value={smartcard}
                            onChange={(e: any) => { setSmartcard(e.target.value); setServerMsg(null); setServerType(null); }}
                            onBlur={() => setCardTouched(true)}
                            aria-invalid={showCardErr ? "true" : "false"}
                            className={cardInputClass}
                        />
                        {showCardErr && (
                            <p className="mt-1 text-sm text-red-600">
                                {provider === "Startimes" ? "Enter a valid 11-digit Startimes number." : "Enter a valid 10-digit DSTV/GOtv IUC number."}
                            </p>
                        )}

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
                        Total: <span className="font-bold text-slate-900">₦{amount}</span>
                    </div>
                    <SubmitButton loading={loading} disabled={loading || insufficient || !pack || !cardOk}>
                        {insufficient ? "Insufficient Balance" : "Pay Subscription"}
                    </SubmitButton>
                </div>
            </form>
        </PurchaseLayout>
    );
}