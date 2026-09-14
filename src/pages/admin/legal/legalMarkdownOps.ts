// Pure, dependency-free helpers for the admin legal editor.
// Kept free of React/DOM so they are directly unit-testable under node:test.

export interface MarkdownSelection {
    start: number;
    end: number;
}

// Canonical legal-document link destinations (web + mobile shared routes).
// AML/KYC is deliberately NOT a customer legal document.
export const LEGAL_LINK_TARGETS: { label: string; href: string; documentType: string }[] = [
    { label: 'Terms of Service', href: '/terms', documentType: 'terms' },
    { label: 'Privacy Policy', href: '/privacy', documentType: 'privacy' },
    { label: 'Refund, Reversal & Complaints Policy', href: '/refund-policy', documentType: 'refund_complaints' }
];

// Schemes the link UI may hand to the editor. `mailto:` and https/http are
// already allowed by the sanitizer. Relative internal paths (`/terms`, etc.)
// pass sanitization untouched and are resolved per-platform by the readers.
export const LEGAL_LINK_SCHEMES = ['https:', 'http:', 'mailto:'];

// Returns a normalized safe href for the link UI, or null when the target must
// be rejected (javascript:, data:, ftp:, tel:, empty, whitespace, etc.).
export function normalizeLegalLinkHref(input: string): string | null {
    const raw = (input || '').trim();
    if (!raw) return null;

    // Internal legal-document slugs are allowed exactly as canonical routes.
    if (LEGAL_LINK_TARGETS.some(t => t.href === raw)) return raw;

    // Email: bare address -> mailto:
    if (raw.includes('@') && !/^[a-z-]+:/i.test(raw)) {
        if (/\s/.test(raw)) return null;
        return `mailto:${raw}`;
    }

    // Relative path with no scheme/slashes is not a valid external link.
    if (/^\/\//.test(raw)) return null;

    const lower = raw.toLowerCase();
    if (/^https?:\/\//.test(lower)) return raw;

    // Allow scheme-less domains and upgrade to https: for the UK/master docs.
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)*(\/|$)/i.test(raw) && !/^[a-z-]+:/i.test(raw)) {
        return `https://${raw}`;
    }

    // Explicit scheme: only https/http accepted here (tel: unchanged elsewhere).
    const scheme = lower.match(/^([a-z][a-z0-9+.-]*):/);
    if (scheme) return LEGAL_LINK_SCHEMES.includes(scheme[1]) ? raw : null;

    return null;
}

// Section numbering: find the last `## N. Heading` and continue the sequence.
// If the document does not use numeric headings, return null so the caller can
// insert an unnumbered heading instead of forcing a fragile numbering scheme.
export function nextSectionNumber(markdown: string): number | null {
    if (!markdown) return null;
    const re = /^##\s+(\d+)\.\s/mg;
    let found = false;
    let max = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(markdown)) !== null) {
        found = true;
        max = Math.max(max, Number(m[1]));
    }
    return found ? max + 1 : null;
}

// Builds the heading text for the "+ Add Section" tool:
//   "5. Zantara Services"  when the document already uses numbered sections
//   "Zantara Services"      otherwise (never invents numbering)
export function buildSectionHeading(markdown: string, title: string): string {
    const trimmed = (title || '').trim().replace(/\s+/g, ' ').replace(/^#+\s*/, '');
    if (!trimmed) return '';
    const n = nextSectionNumber(markdown);
    return n ? `${n}. ${trimmed}` : trimmed;
}

// Insert a markdown link into raw markdown at `selection`.
// label/href are pre-validated by the link UI.
export function insertMarkdownLink(
    markdown: string,
    selection: MarkdownSelection,
    href: string,
    label: string
): string {
    const safeLabel = (label || href || '').trim() || href;
    const link = `[${safeLabel}](${href})`;
    const start = Math.max(0, Math.min(selection.start, markdown.length));
    const end = Math.max(start, Math.min(selection.end, markdown.length));
    const selected = markdown.slice(start, end);
    if (selected) return markdown.slice(0, start) + link + markdown.slice(end);
    return markdown.slice(0, start) + link + markdown.slice(end);
}