export type PendingFunding = {
    userId: string;
    reference: string;
    provider: string;
    amount?: number;
    initiatedAt: number;
};

const STORAGE_KEY = 'zantara.pending-wallet-funding.v1';

const isValid = (value: unknown): value is PendingFunding => {
    if (!value || typeof value !== 'object') return false;
    const record = value as Partial<PendingFunding>;
    return typeof record.userId === 'string' && !!record.userId
        && typeof record.reference === 'string' && !!record.reference
        && typeof record.provider === 'string' && !!record.provider
        && (record.amount === undefined
            || (typeof record.amount === 'number' && Number.isFinite(record.amount) && record.amount > 0))
        && typeof record.initiatedAt === 'number' && Number.isFinite(record.initiatedAt);
};

const readPayments = (): PendingFunding[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(isValid);
        return isValid(parsed) ? [parsed] : [];
    } catch {
        return [];
    }
};

export function savePendingFunding(payment: PendingFunding): boolean {
    if (typeof localStorage === 'undefined' || !isValid(payment)) return false;
    try {
        const payments = readPayments().filter(item => item.userId !== payment.userId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...payments, payment]));
        return true;
    } catch {
        return false;
    }
}

export function getPendingFunding(currentUserId: string): PendingFunding | null {
    if (typeof localStorage === 'undefined' || !currentUserId) return null;
    return readPayments().find(record => record.userId === currentUserId) || null;
}

export function clearPendingFunding(currentUserId: string, reference: string): boolean {
    const current = getPendingFunding(currentUserId);
    if (!current || current.reference !== reference) return false;
    const remaining = readPayments().filter(record => record.userId !== currentUserId);
    if (remaining.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    else localStorage.removeItem(STORAGE_KEY);
    return true;
}
