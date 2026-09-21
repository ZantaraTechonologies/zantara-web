// Canonical Admin legal-document identifier helpers.
//
// Backend LegalDocument responses are inconsistent: the LIST endpoint maps
// `_id` -> `id`, while the GET-by-id / create / update / publish / archive
// responses return the raw mongoose doc exposing `_id` only. The Admin UI
// uses `id` as the ONE canonical identifier, so every backend response is
// normalized once at the API boundary (`_id` -> `id`). All Admin flows must
// then build URLs from `doc.id` only, so a malformed/missing id fails fast
// with a thrown error instead of producing `undefined`/`null` in a request URL.

export interface AdminLegalDocumentInput {
    id?: unknown;
    _id?: unknown;
}

export type AdminLegalDocumentType = 'terms' | 'privacy' | 'refund_complaints' | 'aml_kyc';
export type AdminLegalAcceptanceMode = 'agreement' | 'acknowledgement' | 'none';

export interface AdminLegalDocumentClass {
    documentType: AdminLegalDocumentType;
    label: string;
    group: 'customer-facing' | 'internal';
    visibility: 'public' | 'internal';
    visibilityLabel: 'Public' | 'Internal';
    acceptanceMode: AdminLegalAcceptanceMode;
    acceptanceLabel: 'Agreement' | 'Acknowledgement' | 'Informational';
    route: string | null;
}

export const ADMIN_LEGAL_DOCUMENT_CLASSES: readonly AdminLegalDocumentClass[] = [
    {
        documentType: 'terms',
        label: 'Terms of Service',
        group: 'customer-facing',
        visibility: 'public',
        visibilityLabel: 'Public',
        acceptanceMode: 'agreement',
        acceptanceLabel: 'Agreement',
        route: '/terms'
    },
    {
        documentType: 'privacy',
        label: 'Privacy Policy',
        group: 'customer-facing',
        visibility: 'public',
        visibilityLabel: 'Public',
        acceptanceMode: 'acknowledgement',
        acceptanceLabel: 'Acknowledgement',
        route: '/privacy'
    },
    {
        documentType: 'refund_complaints',
        label: 'Refund, Reversal & Complaints Policy',
        group: 'customer-facing',
        visibility: 'public',
        visibilityLabel: 'Public',
        acceptanceMode: 'none',
        acceptanceLabel: 'Informational',
        route: '/refund-policy'
    },
    {
        documentType: 'aml_kyc',
        label: 'AML/KYC, Fraud Prevention & Acceptable Use Framework',
        group: 'internal',
        visibility: 'internal',
        visibilityLabel: 'Internal',
        acceptanceMode: 'none',
        acceptanceLabel: 'Informational',
        route: null
    }
];

export function adminLegalDocumentClass(documentType: unknown): AdminLegalDocumentClass {
    const config = ADMIN_LEGAL_DOCUMENT_CLASSES.find(item => item.documentType === documentType);
    if (!config) throw new Error(`Unsupported Admin legal document type: ${String(documentType)}`);
    return config;
}

export function canonicalAdminLegalDocumentPayload<T extends { documentType: AdminLegalDocumentType; requiresReacceptance?: boolean }>(form: T) {
    const config = adminLegalDocumentClass(form.documentType);
    return {
        ...form,
        title: config.label,
        acceptanceMode: config.acceptanceMode,
        isPublic: config.visibility === 'public',
        requiresReacceptance: config.acceptanceMode === 'none' ? false : form.requiresReacceptance
    };
}

export interface AdminLegalDocument {
    id: string;
    documentType: AdminLegalDocumentType;
    title: string;
    version: number | null;
    status: string;
    acceptanceMode: string;
    requiresAcceptance: boolean;
    requiresReacceptance: boolean;
    isPublic: boolean;
    changeSummary: string;
}

export interface AdminLegalFullDocument extends AdminLegalDocument {
    sourceMarkdown: string;
    contentHtml: string;
}

export type AdminLegalUrlAction = 'get' | 'update' | 'publish' | 'archive';

const NON_IDS = new Set(['undefined', 'null', 'NaN', '[object Object]']);

export function adminLegalDocumentId(doc: AdminLegalDocumentInput | null | undefined): string | undefined {
    if (!doc) return undefined;
    const raw = doc.id ?? doc._id;
    if (typeof raw !== 'string' || raw.length === 0) return undefined;
    return NON_IDS.has(raw) ? undefined : raw;
}

export function normalizeAdminLegalDocument<T extends AdminLegalDocumentInput>(raw: T): T & { id: string } {
    const id = adminLegalDocumentId(raw);
    if (!id) throw new Error('Cannot normalize legal document: missing id/_id');
    return { ...raw, id };
}

export function adminLegalDocumentUrl(action: AdminLegalUrlAction, doc: AdminLegalDocumentInput | null | undefined): string {
    const id = adminLegalDocumentId(doc);
    if (!id) throw new Error(`Cannot build legal document "${action}" URL: no valid document id`);
    const base = `/legal/admin/documents/${id}`;
    if (action === 'publish') return `${base}/publish`;
    if (action === 'archive') return `${base}/archive`;
    return base;
}
