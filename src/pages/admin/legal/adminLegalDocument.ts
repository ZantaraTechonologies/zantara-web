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

export interface AdminLegalDocument {
    id: string;
    documentType: string;
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