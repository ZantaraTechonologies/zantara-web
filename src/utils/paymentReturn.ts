// Framework-free WEB payment-return handling shared by /paystack/return,
// /monnify/return and /flutterwave/return.
//
// Safety contract:
//   - The backend is the ONLY authority for verification and for crediting a
//     wallet. A return page NEVER credits anything.
//   - Every gateway query value other than the Zantara reference extraction
//     below is deliberately ignored (status/message/trxref-of-provider etc.) —
//     a URL can only ever trigger a server-side GET /wallet/verify.
//
// Zantara reference extraction per gateway (must match what the backend adapter
// returns at init AND what the gateway appends on redirect):
//   - paystack     → reference (trxref only as a compatible fallback)
//   - monnify      → paymentReference  (our MNFY_... refId; NOT transactionReference,
//                    the provider's own ID which the backend cannot look up)
//   - flutterwave  → tx_ref  (the original Zantara reference passed as tx_ref)
//   - anything else → reference
export type PaymentGatewayCode = string;

export function extractPaymentReference(
    gateway: PaymentGatewayCode,
    params: URLSearchParams
): string | null {
    const gw = String(gateway || '').toLowerCase();
    let candidate: string | null = null;

    if (gw === 'monnify') {
        candidate = params.get('paymentReference');
    } else if (gw === 'flutterwave') {
        candidate = params.get('tx_ref');
    } else {
        candidate = params.get('reference') || params.get('trxref');
    }

    const trimmed = (candidate || '').trim();
    return trimmed ? trimmed : null;
}

export type ReturnDecision =
    | { kind: 'direct-hit'; gateway: string }
    | { kind: 'verify'; gateway: string; reference: string };

// A return URL is either a direct hit (no usable Zantara reference → neutral
// bounce, never success/failed) or a request for server-side verification.
// 'success'-like values in the query string are inert: they never produce a
// direct-credit branch — the only outcomes are direct-hit or verify.
export function getReturnDecision(
    gateway: PaymentGatewayCode,
    search: string
): ReturnDecision {
    const normalizedGateway = String(gateway || '').toLowerCase();
    const params = new URLSearchParams(search);
    const reference = extractPaymentReference(normalizedGateway, params);

    if (!reference) return { kind: 'direct-hit', gateway: normalizedGateway };
    return { kind: 'verify', gateway: normalizedGateway, reference };
}

export interface PaymentReturnDeps {
    navigate: (path: string) => void;
    verify: (reference: string) => Promise<{
        status?: string;
        type?: string;
        metadata?: { type?: string };
    }>;
    onConfirming?: () => void;
    attempts?: number;
    delayMs?: number;
    confirmDelayMs?: number;
}

// Shared return flow. Bounded server-side verification.
//   - success / approved  → success navigation (funding or investment)
//   - failed              → failure navigation (only when the BACKEND says so)
//   - pending / processing / reconciliation_required / network error → retry, then
//     the neutral "confirming" path; the wallet is credited by the authenticated
//     webhook afterwards (unchanged exactly-once logic). Never terminal locally.
export async function runPaymentReturn(
    gateway: PaymentGatewayCode,
    search: string,
    deps: PaymentReturnDeps
): Promise<void> {
    const decision = getReturnDecision(gateway, search);
    if (decision.kind === 'direct-hit') {
        deps.navigate('/app/wallet');
        return;
    }

    const attempts = Math.max(1, deps.attempts ?? 3);
    const delayMs = deps.delayMs ?? 2500;
    const reference = decision.reference;
    const typeOf = (data: PaymentReturnDeps['verify'] extends (r: string) => Promise<infer T> ? T : never) =>
        data?.type || data?.metadata?.type || 'funding';

    for (let attempt = 0; attempt < attempts; attempt++) {
        try {
            const data = await deps.verify(reference);
            const status = String(data?.status || '');
            if (status === 'success' || status === 'approved') {
                deps.navigate(
                    typeOf(data) === 'investment_buy'
                        ? '/app/investments?success=1'
                        : '/app/wallet?funded=1'
                );
                return;
            }
            if (status === 'failed') {
                deps.navigate(
                    typeOf(data) === 'investment_buy'
                        ? '/app/investments?success=0'
                        : '/app/wallet?funded=0'
                );
                return;
            }
            // pending / processing / reconciliation_required / anything else:
            // not terminal — keep polling for a bounded window.
        } catch {
            // network / transport error — never a terminal failure; keep polling.
        }
        if (attempt < attempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    deps.onConfirming?.();
    await new Promise((resolve) => setTimeout(resolve, deps.confirmDelayMs ?? 1500));
    deps.navigate('/app/wallet');
}