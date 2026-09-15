/**
 * Canonical Customer Receipt Utilities (Web)
 *
 * Shared rules for receipt presentation:
 *  - Time: Africa/Lagos (WAT), standard Intl formatting, NO manual offset math
 *  - Amount: Nigerian Naira (₦) with 2 decimals
 *  - Status: canonical customer-facing states
 *  - Service: human-readable resolution from type + service slug + safe details
 *  - Category rows: allowlisted, failure-safe
 *  - Masking: consistent privacy policy for shareable/downloaded receipts
 */

export const RECEIPT_TIMEZONE = 'Africa/Lagos';
export const RECEIPT_TIMEZONE_LABEL = 'WAT';
export const RECEIPT_CURRENCY = 'NGN';

export interface ReceiptBrand {
    displayName: string;
    logo?: string;
    supportEmail?: string;
    supportPhone?: string;
    website?: string;
}

export interface ReceiptDetailRow {
    label: string;
    value: string;
}

export interface ReceiptModel {
    brand: ReceiptBrand;
    transaction: {
        reference: string;
        type: string;
        serviceDisplayName: string;
        amountText: string;
        amount: number;
        currency: string;
        status: string;
        transactionDate: string;
        timezone: string;
        paymentMethod: string;
        description?: string;
    };
    beneficiary?: {
        displayName?: string;
        identifier?: string;
        identifierType?: string;
    };
    categoryDetails: ReceiptDetailRow[];
    receipt: {
        generatedAt: string;
    };
}

/** Transaction shape as consumed from the sanitized customer DTO. */
export interface CustomerTransaction {
    _id?: string;
    transactionId?: string;
    refId?: string;
    type?: string;
    service?: string;
    amount?: number;
    status?: string;
    currency?: string;
    createdAt?: string;
    updatedAt?: string;
    userId?: string;
    details?: Record<string, any>;
    metadata?: Record<string, any>;
    fromName?: string;
    toName?: string;
}

// ─────────────────────────────────────────────────────────────
// TIME (Phase 5)
// ─────────────────────────────────────────────────────────────

const dateFmt = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: RECEIPT_TIMEZONE,
});
const timeFmt = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: RECEIPT_TIMEZONE,
});

function upperMeridian(part: string): string {
    return part.replace(/\bam\b/i, 'AM').replace(/\bpm\b/i, 'PM');
}

export function formatReceiptDateTimeWAT(input?: string | Date): string {
    const date = input ? new Date(input) : new Date();
    if (isNaN(date.getTime())) return 'Date unavailable';
    return `${dateFmt.format(date)}, ${upperMeridian(timeFmt.format(date))} ${RECEIPT_TIMEZONE_LABEL}`;
}

export function formatReceiptGeneratedAt(date = new Date()): string {
    return formatReceiptDateTimeWAT(date);
}

// ─────────────────────────────────────────────────────────────
// AMOUNT (Phase 9)
// ─────────────────────────────────────────────────────────────

const nairaFmt = new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatNairaAmount(amount?: number | string): string {
    const numeric = Number(amount);
    if (amount == null || isNaN(numeric)) return '₦0.00';
    return `₦${nairaFmt.format(Math.abs(numeric))}`;
}

// ─────────────────────────────────────────────────────────────
// STATUS (Phase 10)
// ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    success: 'Success',
    successful: 'Success',
    completed: 'Success',
    pending: 'Pending',
    processing: 'Pending',
    failed: 'Failed',
    cancelled: 'Failed',
    error: 'Failed',
    reversed: 'Reversed',
    refunded: 'Refunded',
    skipped: 'Skipped',
    referral_skipped: 'Skipped',
};

export function normalizeReceiptStatus(status?: string, type?: string): string {
    if (!status) return 'Pending';
    const lower = String(status).toLowerCase();
    if (STATUS_LABELS[lower] !== undefined) return STATUS_LABELS[lower];
    return lower.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────
// SERVICE DISPLAY NAME (Phase 6)
// ─────────────────────────────────────────────────────────────

const NETWORK_SLUGS: Record<string, string> = {
    mtn: 'MTN',
    airtel: 'Airtel',
    glo: 'Glo',
    '9mobile': '9mobile',
    etisalat: '9mobile',
};

const CABLE_PROVIDERS: Record<string, string> = {
    dstv: 'DSTV',
    gotv: 'GOtv',
    startimes: 'StarTimes',
    showmax: 'Showmax',
};

function detectNetwork(tx: CustomerTransaction): string | undefined {
    const slug = (tx.service || '').toLowerCase();
    const detailNetwork = String(tx.details?.network || '').toLowerCase();

    for (const key of Object.keys(NETWORK_SLUGS)) {
        if (slug === key || slug.startsWith(key) || slug.includes(key)) return NETWORK_SLUGS[key];
        if (detailNetwork === key || detailNetwork.includes(key)) return NETWORK_SLUGS[key];
    }
    return undefined;
}

const TYPE_DISPLAY_FALLBACKS: Record<string, string> = {
    airtime: 'Airtime',
    data: 'Data',
    electricity: 'Electricity',
    tv: 'Cable TV',
    cable: 'Cable TV',
    pin: 'Exam PIN',
    exam_pin: 'Exam PIN',
    funding: 'Wallet Funding',
    wallet_fund: 'Wallet Funding',
    wallet_funding: 'Wallet Funding',
    transfer: 'Transfer',
    transfer_out: 'Transfer',
    transfer_in: 'Transfer',
    withdrawal: 'Bank Withdrawal',
    referral_redeem: 'Referral Earnings Redemption',
    referral_bonus: 'Referral Commission Bonus',
    referral_skipped: 'Skipped Commission',
};

export function getServiceDisplayName(tx: CustomerTransaction): string {
    const type = (tx.type || '').toLowerCase();
    const network = detectNetwork(tx);

    if (type === 'airtime') return network ? `${network} Airtime` : 'Airtime';
    if (type === 'data') return network ? `${network} Data` : 'Data';
    if (type === 'electricity') {
        const disco = String(tx.service || '').replace(/-|_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return disco ? `${disco} Electricity` : 'Electricity';
    }
    if (type === 'cable' || type === 'tv') {
        const slug = String(tx.service || '').toLowerCase();
        const provider = CABLE_PROVIDERS[slug] || detectNetwork(tx);
        return provider ? `${provider} Cable TV` : 'Cable TV';
    }

    return TYPE_DISPLAY_FALLBACKS[type] || (tx.service
        ? String(tx.service).replace(/-|_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Transaction');
}

// ─────────────────────────────────────────────────────────────
// PAYMENT METHOD
// ─────────────────────────────────────────────────────────────

export function getPaymentMethod(tx: CustomerTransaction): string {
    const type = (tx.type || '').toLowerCase();
    if (type === 'funding' || type === 'wallet_fund' || type === 'wallet_funding') {
        return tx.service ? String(tx.service).replace(/-|_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Direct Deposit';
    }
    if (type === 'transfer_in' || type === 'transfer_out') return 'Zantara Transfer';
    return 'Zantara Balance';
}

// ─────────────────────────────────────────────────────────────
// MASKING (Phase 8)
// ─────────────────────────────────────────────────────────────

export function maskPhone(phone?: string): string {
    const raw = String(phone || '').trim();
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 7) return raw;
    return `${digits.slice(0, 4)}••••${digits.slice(-4)}`;
}

export function maskAccount(account?: string): string {
    const raw = String(account || '').trim();
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 5) return raw;
    return `••••${digits.slice(-4)}`;
}

export function maskIdentifier(identifier?: string, keepVisible = 3): string {
    const raw = String(identifier || '').trim().replace(/\s+/g, ' ');
    if (!raw) return '';
    if (raw.length <= keepVisible * 2) return raw;
    return `${raw.slice(0, keepVisible)}${'•'.repeat(Math.min(raw.length - keepVisible * 2, 8))}${raw.slice(-keepVisible)}`;
}

// ─────────────────────────────────────────────────────────────
// CATEGORY DETAIL ROWS (Phase 7)
// ─────────────────────────────────────────────────────────────

function safeStr(value: unknown): string {
    if (value == null) return '';
    const s = String(value).trim();
    return s === 'null' || s === 'undefined' ? '' : s;
}

export function getCategoryDetailRows(tx: CustomerTransaction): ReceiptDetailRow[] {
    const type = (tx.type || '').toLowerCase();
    const d = tx.details || {};
    const rows: ReceiptDetailRow[] = [];

    const add = (label: string, value?: string) => {
        if (value) rows.push({ label, value });
    };

    if (type === 'airtime') {
        const network = String(d.network || '').trim() || detectNetwork(tx) || '';
        add('Network', network);
        add('Recipient', maskPhone(safeStr(d.phone)));
    } else if (type === 'data') {
        add('Network', String(d.network || '').trim() || detectNetwork(tx) || '');
        add('Plan', safeStr(d.variation_code) || safeStr(d.plan));
        add('Recipient', maskPhone(safeStr(d.phone)));
    } else if (type === 'electricity') {
        const disco = String(tx.service || '');
        add('Electricity Company', disco ? String(disco).replace(/-|_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');
        add('Meter Number', maskIdentifier(safeStr(d.meter_number), 3));
        add('Meter Type', safeStr(d.meter_type));
        add('Phone', maskPhone(safeStr(d.phone)));
        add('Token', safeStr(d.token));
    } else if (type === 'cable' || type === 'tv') {
        const provider = String(d.serviceID || '') || String(tx.service || '');
        add('Provider', provider ? String(provider).replace(/-|_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');
        add('Package', safeStr(d.variation_code));
        add('Smartcard / IUC', maskIdentifier(safeStr(d.billersCode), 3));
    } else if (type === 'exam_pin' || type === 'pin') {
        add('Exam', String(d.serviceID || '').toUpperCase().replace(/-|_/g, ' '));
        add('Quantity', safeStr(d.quantity));
    } else if (type === 'funding' || type === 'wallet_fund' || type === 'wallet_funding') {
        add('Funding Method', safeStr(tx.service) || 'Direct Deposit');
    } else if (type === 'withdrawal') {
        add('Bank', safeStr(d.bankName));
        add('Beneficiary', safeStr(d.accountName));
        add('Account Number', maskAccount(safeStr(d.accountNumber)));
    } else if (type === 'transfer_out' || type === 'transfer_in') {
        add('Recipient', safeStr(d.recipientName) || maskPhone(safeStr(d.recipientPhone)));
        add('Recipient', maskPhone(safeStr(d.recipientPhone)));
        add('Sender', safeStr(d.senderName) || maskPhone(safeStr(d.senderPhone)));
    } else if (type === 'share_purchase' || type === 'dividend_reinvest') {
        add('Shares', safeStr(d.sharesQty));
        add('Price / Share', safeStr(d.pricePerShare));
        add('Fee', safeStr(d.fee));
    } else if (type === 'share_exit') {
        add('Shares Returned', safeStr(d.sharesReturned));
        add('Gross Amount', safeStr(d.grossAmount));
        add('Exit Fee', safeStr(d.exitFeeCharged));
    } else if (type === 'dividend_redeem') {
        add('Net Amount', safeStr(d.netAmount));
        add('Fee', safeStr(d.fee));
    } else if (type === 'dividend_withdrawal') {
        add('Bank', safeStr(d.bankName));
        add('Fee Charged', safeStr(d.feeCharged));
    }

    return rows;
}

// ─────────────────────────────────────────────────────────────
// BENEFICIARY
// ─────────────────────────────────────────────────────────────

export function getBeneficiary(tx: CustomerTransaction): ReceiptModel['beneficiary'] {
    const type = (tx.type || '').toLowerCase();
    const d = tx.details || {};

    if (type === 'airtime' || type === 'data' || type === 'electricity') {
        const phone = safeStr(d.phone);
        if (phone) return { identifier: maskPhone(phone), identifierType: 'phone' };
    }
    if (type === 'cable' || type === 'tv') {
        const iuc = safeStr(d.billersCode);
        if (iuc) return { identifier: maskIdentifier(iuc, 3), identifierType: 'iuc' };
    }
    if (type === 'transfer_out') {
        const name = safeStr(d.recipientName);
        const phone = safeStr(d.recipientPhone);
        return {
            displayName: name || undefined,
            identifier: phone ? maskPhone(phone) : undefined,
            identifierType: name ? 'recipient' : 'phone',
        };
    }
    if (type === 'transfer_in') {
        const name = safeStr(d.senderName);
        const phone = safeStr(d.senderPhone);
        return {
            displayName: name || undefined,
            identifier: phone ? maskPhone(phone) : undefined,
            identifierType: name ? 'sender' : 'phone',
        };
    }
    if (type === 'withdrawal') {
        const name = safeStr(d.accountName) || tx.toName;
        const accountNumber = safeStr(d.accountNumber);
        return {
            displayName: name || undefined,
            identifier: accountNumber ? maskAccount(accountNumber) : undefined,
            identifierType: name ? 'beneficiary' : 'account',
        };
    }

    const fromName = tx.fromName;
    if (fromName) {
        return { displayName: fromName, identifierType: 'initiator' };
    }

    return undefined;
}

// ─────────────────────────────────────────────────────────────
// DESCRIPTION
// ─────────────────────────────────────────────────────────────

export function getDescription(tx: CustomerTransaction): string {
    const type = (tx.type || '').toLowerCase();
    const d = tx.details || {};
    const remarks = safeStr(d.remarks);
    if (remarks) return remarks;

    const base = getServiceDisplayName(tx);
    if (type === 'referral_redeem') return 'Referral Earnings Redemption';
    if (type === 'referral_bonus') return 'Referral Commission Bonus';
    if (type === 'referral_skipped') return 'Commission skipped due to low service margin';
    if (type === 'transfer_out') return `Transfer to ${safeStr(d.recipientName) || maskPhone(safeStr(d.recipientPhone)) || 'recipient'}`;
    if (type === 'transfer_in') return `Transfer from ${safeStr(d.senderName) || maskPhone(safeStr(d.senderPhone)) || 'sender'}`;
    return `${base} purchase`;
}

// ─────────────────────────────────────────────────────────────
// REFERENCE
// ─────────────────────────────────────────────────────────────

export function getReceiptReference(tx: CustomerTransaction): string {
    return safeStr(tx.refId) || safeStr(tx.transactionId) || safeStr(tx._id) || String(tx._id || '');
}

// ─────────────────────────────────────────────────────────────
// MODEL ASSEMBLY (Phase 2 / 5-10)
// ─────────────────────────────────────────────────────────────

export function buildReceiptModel(tx: CustomerTransaction, brand: ReceiptBrand, generatedAt = new Date()): ReceiptModel {
    const safeBrand: ReceiptBrand = {
        displayName: brand?.displayName || 'Zantara',
        logo: brand?.logo,
        supportEmail: brand?.supportEmail,
        supportPhone: brand?.supportPhone,
        website: brand?.website,
    };

    return {
        brand: safeBrand,
        transaction: {
            reference: getReceiptReference(tx),
            type: (tx.type || '').toLowerCase(),
            serviceDisplayName: getServiceDisplayName(tx),
            amount: Number(tx.amount) || 0,
            amountText: formatNairaAmount(tx.amount),
            currency: tx.currency || RECEIPT_CURRENCY,
            status: normalizeReceiptStatus(tx.status, tx.type),
            transactionDate: formatReceiptDateTimeWAT(tx.createdAt),
            timezone: RECEIPT_TIMEZONE_LABEL,
            paymentMethod: getPaymentMethod(tx),
            description: getDescription(tx),
        },
        beneficiary: getBeneficiary(tx),
        categoryDetails: getCategoryDetailRows(tx),
        receipt: {
            generatedAt: formatReceiptGeneratedAt(generatedAt),
        },
    };
}