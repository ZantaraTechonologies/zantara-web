import { FormEvent, useMemo, useState } from "react";
import PurchaseLayout from "../../layouts/user/PurchaseLayout";
import { Row, Input, Select, SubmitButton } from "../../components/buy/Buy";
import * as vtuService from "../../services/vtu/vtuService";
import { useWalletStore } from "../../store/wallet/walletStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth/authStore";

const AUTO_REDIRECT_RECEIPT = false;

// ---- Helpers ----
const to234 = (v: string) => {
    const d = (v || "").replace(/\D+/g, "");
    if (!d) return "";
    if (d.startsWith("0")) return "234" + d.slice(1);
    if (d.startsWith("234")) return d;
    return d;
};
const isValidNgMobile = (v: string) => /^234[789]\d{9}$/.test(to234(v));

const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"] as const;
const SERVICE_ID_MAP: Record<(typeof NETWORKS)[number], string> = {
    MTN: "mtn-data",
    Airtel: "airtel-data",
    Glo: "glo-data",
    "9mobile": "9mobile-data",
};

const PLANS: Record<(typeof NETWORKS)[number], { id: string; name: string; price: number }[]> = {
    MTN: [{ id: "m-1gb", name: "1GB (30d)", price: 350 }, { id: "m-3gb", name: "3GB (30d)", price: 900 }],
    Airtel: [{ id: "a-1gb", name: "1GB (30d)", price: 360 }, { id: "a-3gb", name: "3GB (30d)", price: 920 }],
    Glo: [{ id: "g-1gb", name: "1GB (30d)", price: 300 }, { id: "g-3gb", name: "3GB (30d)", price: 850 }],
    "9mobile": [{ id: "e-1gb", name: "1GB (30d)", price: 380 }, { id: "e-3gb", name: "3GB (30d)", price: 950 }],
};

export default function BuyDataPage() {
    const { balance } = useWalletStore();
    const { user } = useAuthStore(); // Get user for role check
    const navigate = useNavigate();

    const [network, setNetwork] = useState<(typeof NETWORKS)[number]>("MTN");
    const [planId, setPlanId] = useState(PLANS["MTN"][0].id);
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const [serverMsg, setServerMsg] = useState<string | null>(null);
    const [serverType, setServerType] = useState<"success" | "error" | null>(null);
    const [receiptHref, setReceiptHref] = useState<string | null>(null);

    const [phoneTouched, setPhoneTouched] = useState(false);
    const phoneOk = isValidNgMobile(phone);
    const showPhoneErr = phoneTouched && !phoneOk;

    const plan = useMemo(() => PLANS[network].find((p) => p.id === planId) ?? PLANS[network][0], [network, planId]);

    // Agent Pricing Logic
    const isAgent = user?.roles?.includes('reseller') || user?.roles?.includes('agent');
    const basePrice = plan?.price ?? 0;
    const discount = isAgent ? basePrice * 0.05 : 0; // 5% discount
    const amount = basePrice - discount;

    const insufficient = balance < amount;

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
            // Backend returns { message, data: vtuResponse } for data purchases
            // (we'll try to extract a transaction ref from vtuResponse) :contentReference[oaicite:0]{index=0}
            const payload = {
                serviceID: SERVICE_ID_MAP[network],
                billersCode: to234(phone),
                variation_code: planId,
                phone: to234(phone),
                amount,
            };
            const res = await vtuService.buyData(payload);
            setServerMsg(res?.message || "Data purchase successful.");
            setServerType("success");
            const v = res?.data || {};
            const ref = v.ref || v.reference || v.requestId || v.transactionId || null;
            const href = `/dashboard/transactions${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
            setReceiptHref(href);
            if (AUTO_REDIRECT_RECEIPT) navigate(href);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Purchase failed";
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
        <PurchaseLayout title="Buy Data" subtitle="Choose network, pick a plan, and confirm purchase.">
            <form className="grid gap-4" onSubmit={onSubmit}>
                {serverMsg && (
                    <div className={"rounded-xl border p-3 sm:p-4 " + (serverType === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800")}>
                        {serverMsg}
                    </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                    <Row label="Network">
                        <Select
                            value={network}
                            onChange={(e) => {
                                const v = e.target.value as (typeof NETWORKS)[number];
                                setNetwork(v);
                                setPlanId(PLANS[v][0].id);
                                setServerMsg(null);
                                setServerType(null);
                            }}
                        >
                            {NETWORKS.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </Select>
                    </Row>

                    <Row label="Plan">
                        <Select
                            value={planId}
                            onChange={(e) => {
                                setPlanId(e.target.value);
                                setServerMsg(null);
                                setServerType(null);
                            }}
                        >
                            {PLANS[network].map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — ₦{isAgent ? (p.price * 0.95).toLocaleString() : p.price}
                                    {isAgent && ` (Agent)`}
                                </option>
                            ))}
                        </Select>
                    </Row>
                </div>

                <Row label="Phone number">
                    <div className="w-full">
                        <Input
                            type="tel"
                            inputMode="tel"
                            placeholder="0801 234 5678 or 2348012345678"
                            value={phone}
                            onChange={(e: any) => {
                                setPhone(e.target.value);
                                setServerMsg(null);
                                setServerType(null);
                            }}
                            onBlur={() => setPhoneTouched(true)}
                            aria-invalid={showPhoneErr ? "true" : "false"}
                            className={phoneInputClass}
                        />
                        {showPhoneErr && <p className="mt-1 text-sm text-red-600">Please enter a valid Nigerian mobile number.</p>}

                        {/* Receipt link (right-aligned, shows after success) */}
                        {receiptHref && serverType === "success" && (
                            <div className="mt-2 text-right">
                                <a href={receiptHref} className="text-sm font-medium text-blue-600 hover:underline">
                                    View receipt →
                                </a>
                            </div>
                        )}
                    </div>
                </Row>

                <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-slate-600">
                        Total: <span className="font-bold text-slate-900">₦{amount.toLocaleString()}</span>
                        {isAgent && <span className="ml-2 text-xs text-green-600 line-through">₦{basePrice.toLocaleString()}</span>}
                    </div>
                    <SubmitButton loading={loading} disabled={loading || insufficient || !plan || !phoneOk}>
                        {insufficient ? "Insufficient Balance" : "Buy Data"}
                    </SubmitButton>
                </div>
            </form>
        </PurchaseLayout>
    );
}