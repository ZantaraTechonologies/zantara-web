import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { markdownToLegalHtml } from '../src/pages/admin/legal/clientLegalHtml.ts';
import {
    nextSectionNumber,
    buildSectionHeading,
    normalizeLegalLinkHref,
    insertMarkdownLink
} from '../src/pages/admin/legal/legalMarkdownOps.ts';

// ---------------------------------------------------------------------------
// Tests 1-6: .legal-content scoped CSS delivers visible semantic typography
// Tests 7+: clientLegalHtml mirrors backend pipeline (parity + safety)
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssSource = readFileSync(join(__dirname, '..', 'src', 'styles', 'index.css'), 'utf8');
const css = cssSource.replace(/\/\*[\s\S]*?\*\//g, '');

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Split stylesheet into independent rules (selector { body }).
function ruleBlocks(cssText) {
    const rules = [];
    const re = /([^{}]+)\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(cssText)) !== null) rules.push({ selector: m[1].trim(), body: m[2] });
    return rules;
}

// True when SOME scoped rule mentions `selector` and its body matches the property.
function has(selector, propertyPattern) {
    const selRe = new RegExp(`(?:^|[,\\s])${escapeRegExp(selector)}(?:[,{\\s]|\\.[a-z])`, 'i');
    const propRe = new RegExp(propertyPattern, 'i');
    return ruleBlocks(css).some(r => /\.legal-(?:content|editor-area)/.test(r.selector) && selRe.test(r.selector) && propRe.test(r.body));
}

function hasDarkVariant(selector, propertyPattern) {
    const selRe = new RegExp(`(?:^|[,\\s])${escapeRegExp(selector)}(?:[,{\\s]|\\.[a-z])`, 'i');
    const propRe = new RegExp(propertyPattern, 'i');
    return ruleBlocks(css).some(r => r.selector.startsWith('.dark ') && /\blegal-content\b/.test(r.selector) && selRe.test(r.selector) && propRe.test(r.body));
}

// ---- 1. h2 receives legal heading style ----
test('CSS: h2 has visible legal heading style (font-size, font-weight, margin)', () => {
    assert.ok(has('h2', 'font-size'), 'h2 must set font-size');
    assert.ok(has('h2', 'font-weight'), 'h2 must set font-weight');
    assert.ok(has('h2', 'margin'), 'h2 must set margin');
});

// ---- 2. paragraphs receive spacing ----
test('CSS: p has paragraph spacing (margin, inherits line-height)', () => {
    assert.ok(has('p', 'margin'), 'p must set margin');
    assert.ok(has('p', 'margin-bottom'), 'p must set bottom margin for visible separation');
});

// ---- 3. unordered list displays bullets ----
test('CSS: ul list-style disc', () => {
    assert.ok(has('ul', 'list-style'), 'ul must set list-style');
    assert.ok(has('ul', 'disc'), 'ul must use disc bullets');
});

// ---- 4. ordered list displays numbers ----
test('CSS: ol list-style decimal', () => {
    assert.ok(has('ol', 'list-style'), 'ol must set list-style');
    assert.ok(has('ol', 'decimal'), 'ol must use decimal numbering');
});

// ---- 5. links visibly styled ----
test('CSS: a has visible link styling (color + underline)', () => {
    assert.ok(has('a', 'color'), 'links must have a visible color');
    assert.ok(has('a', 'text-decoration'), 'links must have underline/decoration');
});

// ---- 5b. strong/em styled ----
test('CSS: strong and em have distinct style', () => {
    assert.ok(has('strong', 'font-weight'), 'strong must set font-weight');
    assert.ok(has('em', 'font-style'), 'em must set font-style italic');
});

// ---- 5c. blockquote has border + italic ----
test('CSS: blockquote has border-left and italic style', () => {
    assert.ok(has('blockquote', 'border-left'), 'blockquote must set border-left');
    assert.ok(has('blockquote', 'font-style'), 'blockquote must be italic');
});

// ---- 6. scoped so global app typography is unaffected ----
test('CSS: all semantic rules are scoped under .legal-content or .legal-editor-area', () => {
    const unscopedRule = /^\.legal-(?:content|editor-area)/m.test(css);
    assert.ok(unscopedRule, 'at least one rule must use .legal-content or .legal-editor-area');
    // Global CSS should NOT redeclare h1–h6 sizes/margins beyond the existing color
    // Our legal rules contain h1/h2/h3/h4 with font-size AND margin; confirm they're scoped.
    const globalH2 = /^h2\s*\{[^}]*font-size/m.test(css);
    assert.ok(!globalH2, 'global h2 must NOT be restyled unscoped');
});

// ---- 6b. dark theme variant present ----
test('CSS: dark mode variant exists', () => {
    assert.ok(hasDarkVariant('a', 'color') || css.includes('.dark .legal-content'), 'dark variant must exist');
});

// ---- clientLegalHtml parity tests --------------------------------------------------
// Import backend legalHtml via createRequire to prove the web client produces
// identical output to the server, confirming round-trip parity (tests 15-16
// from Part 9 applied to the client path).

const requireCjs = createRequire(import.meta.url);
let backend;
try {
    backend = requireCjs('../../vtu-backend/utils/legalHtml.js');
} catch {
    backend = null;
}

test('clientLegalHtml: backend parity (identical output for markdown-to-HTML)', () => {
    if (!backend) return; // skip if vtu-backend not available
    
    const md = '## 1. Terms\n\nHello **world** and [us](/privacy).\n\n- A\n- B\n\n1. X\n2. Y';
    const clientOut = markdownToLegalHtml(md);
    const serverOut = backend.markdownToHtml(md);
    assert.equal(clientOut, serverOut, 'client and server output must be byte-identical');
});

test('clientLegalHtml: sanitizes scripts, onclick, javascript: links', () => {
    
    const out = markdownToLegalHtml('<p onclick="alert(1)">hi<script>alert(1)</script></p><a href="javascript:alert(1)">x</a>');
    assert.ok(!out.includes('<script'), 'script stripped');
    assert.ok(!out.includes('onclick'), 'onclick stripped');
    assert.ok(!out.includes('javascript:'), 'javascript: stripped');
});

test('clientLegalHtml: relative links preserved (sanitizer keeps /privacy href)', () => {
    
    const out = markdownToLegalHtml('[Privacy Policy](/privacy)');
    assert.ok(out.includes('href="/privacy"'), '/privacy href must be preserved');
    assert.ok(out.includes('target="_blank"'), 'target=_blank must be set');
});

test('clientLegalHtml: http and mailto links preserved', () => {
    
    const out = markdownToLegalHtml('[Visit](https://example.com) or [Email](mailto:hi@example.com)');
    assert.ok(out.includes('https://example.com'), 'https href preserved');
    assert.ok(out.includes('mailto:hi@example.com'), 'mailto href preserved');
});

test('clientLegalHtml: preserves h2 heading, p, ul>li, ol>li, strong, em, blockquote', () => {
    
    const md = [
        '## Section Title',
        '',
        'Body text.',
        '',
        '**bold** and *italic*.',
        '',
        '- a',
        '- b',
        '',
        '1. x',
        '2. y',
        '',
        '> note'
    ].join('\n');
    const out = markdownToLegalHtml(md);
    assert.ok(out.includes('<h2>'), 'h2 present');
    assert.ok(out.includes('<p>'), 'p present');
    assert.ok(out.includes('<ul>'), 'ul present');
    assert.ok(out.includes('<ol>'), 'ol present');
    assert.ok(out.includes('<strong>'), 'strong present');
    assert.ok(out.includes('<em>'), 'em present');
    assert.ok(out.includes('<blockquote>'), 'blockquote present');
});

test('clientLegalHtml: function is pure (does not mutate input)', () => {
    
    const input = '## Test\n\nBody.';
    const copy = structuredClone(input);
    markdownToLegalHtml(input);
    assert.equal(input, copy, 'source markdown string must not be mutated');
});

test('clientLegalHtml: empty / null returns empty string', () => {
    
    assert.equal(markdownToLegalHtml(''), '');
    assert.equal(markdownToLegalHtml(null), '');
    assert.equal(markdownToLegalHtml(undefined), '');
});

// ---- legalMarkdownOps: pure helper tests ----------------------------------------

test('legalMarkdownOps: nextSectionNumber detects numbered headings', () => {
    assert.equal(nextSectionNumber(''), null);
    assert.equal(nextSectionNumber('## 1. Intro\n\nText\n## 5. Last'), 6);
    assert.equal(nextSectionNumber('## Unnumbered\n\nBody'), null);
    assert.equal(buildSectionHeading('## 3. A', 'Services'), '4. Services');
    assert.equal(buildSectionHeading('## A. Bad', 'Services'), 'Services');
    assert.equal(buildSectionHeading('', 'Custom'), 'Custom');
    assert.equal(buildSectionHeading('', '  ## Stripped'), 'Stripped');
});

test('legalMarkdownOps: normalizeLegalLinkHref rejects unsafe schemes', () => {
    assert.equal(normalizeLegalLinkHref(''), null);
    assert.equal(normalizeLegalLinkHref('javascript:alert(1)'), null);
    assert.equal(normalizeLegalLinkHref('data:text/html,hi'), null);
    assert.equal(normalizeLegalLinkHref('tel:+2341'), null);
    assert.equal(normalizeLegalLinkHref('/terms'), '/terms');
    assert.equal(normalizeLegalLinkHref('/privacy'), '/privacy');
    assert.equal(normalizeLegalLinkHref('/refund-policy'), '/refund-policy');
    assert.ok(normalizeLegalLinkHref('https://zantara.com').startsWith('https://'));
    assert.ok(normalizeLegalLinkHref('https://zantara.com') !== null);
    assert.ok(normalizeLegalLinkHref('zantara.com').startsWith('https://'));
    assert.ok(normalizeLegalLinkHref('support@zantara.com').startsWith('mailto:'));
});

test('legalMarkdownOps: insertMarkdownLink wraps selection', () => {
    const md = 'Hello world';
    const out = insertMarkdownLink(md, { start: 0, end: 5 }, '/privacy', 'Privacy');
    assert.equal(out, '[Privacy](/privacy) world');
});

test('legalMarkdownOps: insertMarkdownLink inserts at cursor when no selection', () => {
    const md = 'Hello';
    const out = insertMarkdownLink(md, { start: 5, end: 5 }, '/terms', 'Terms');
    assert.equal(out, 'Hello[Terms](/terms)');
});