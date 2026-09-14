import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// Client-side mirror of the backend canonical legal pipeline
// (vtu-backend/utils/legalHtml.js). Kept byte-for-byte identical with the
// backend allowlist so the admin Visual editor seeding and the Draft Preview
// render exactly the same semantic HTML the server would produce on save.
//
// SAFETY: this mirrors the server sanitizer. No scripts, no inline handlers,
// no style tags, no javascript: hrefs, no non-allowlisted schemes. This is the
// ONLY client-side path that turns Markdown into HTML for display — it reuses
// the same mature libraries (marked + sanitize-html) as the backend.

export const LEGAL_ALLOWED_TAGS = [
    'h1', 'h2', 'h3', 'h4', 'p', 'br',
    'ul', 'ol', 'li',
    'a', 'strong', 'em', 'b', 'i', 'blockquote', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'code', 'pre'
];

export const LEGAL_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
    a: ['href', 'rel', 'target'],
    th: ['align'],
    td: ['align'],
    code: ['class']
};

export const LEGAL_ALLOWED_SCHEMES = ['https', 'http', 'mailto'];

export const sanitizeLegalHtml = (html: string): string => {
    if (!html || typeof html !== 'string') return '';
    return sanitizeHtml(html, {
        allowedTags: LEGAL_ALLOWED_TAGS,
        allowedAttributes: LEGAL_ALLOWED_ATTRIBUTES,
        allowedSchemes: LEGAL_ALLOWED_SCHEMES,
        allowProtocolRelative: false,
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' })
        }
    });
};

export const markdownToLegalHtml = (markdown: string): string => {
    if (!markdown || typeof markdown !== 'string') return '';
    const rawHtml = marked.parse(markdown, { async: false });
    return sanitizeLegalHtml(typeof rawHtml === 'string' ? rawHtml : String(rawHtml));
};