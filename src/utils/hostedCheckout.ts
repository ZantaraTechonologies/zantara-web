const CHECKOUT_DOMAINS: Record<string, readonly string[]> = {
    paystack: ['paystack.com', 'paystack.co'],
    monnify: ['monnify.com'],
    flutterwave: ['flutterwave.com'],
};

const matchesDomain = (host: string, domain: string) =>
    host === domain || host.endsWith(`.${domain}`);

export function isTrustedHostedCheckoutUrl(rawUrl: string, provider: string, requiredHost?: string): boolean {
    if (typeof rawUrl !== 'string') return false;
    try {
        const url = new URL(rawUrl);
        const domains = CHECKOUT_DOMAINS[String(provider || '').toLowerCase()];
        if (!domains) return false;
        if (url.protocol !== 'https:' || url.username || url.password) return false;
        if (url.port && url.port !== '443') return false;
        const host = url.hostname.toLowerCase();
        if (requiredHost && host !== requiredHost.toLowerCase()) return false;
        return domains.some(domain => matchesDomain(host, domain));
    } catch {
        return false;
    }
}
