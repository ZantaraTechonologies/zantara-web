import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

// ---------------------------------------------------------------------------
// Tests 7-14 (Part 9): Markdown preservation, Visual<->Markdown round trip via
// the ACTUAL editor stack (tiptap + starter-kit + link + tiptap-markdown run
// under jsdom), Preview purity, admin flow regression guards.
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
globalThis.Node = dom.window.Node;
globalThis.Event = dom.window.Event;
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.DOMRect = dom.window.DOMRect;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLDivElement = dom.window.HTMLDivElement;
globalThis.getSelection = dom.window.getSelection.bind(dom.window);

const { markdownToLegalHtml } = await import('../src/pages/admin/legal/clientLegalHtml.ts');

const SAMPLE_MD = [
    '## 1. Introduction and Acceptance',
    '',
    'By using Zantara you agree to these terms.',
    '',
    '## 2. Zantara Services',
    '',
    'Zantara provides access to:',
    '',
    '- Airtime recharge',
    '- Data bundles',
    '',
    'Please follow these steps:',
    '',
    '1. Register an account',
    '2. Fund your wallet',
    '3. Place an order',
    '',
    'See the [Privacy Policy](/privacy) for details.',
    '',
    'Read **all** of it *carefully*.'
].join('\n');

async function createEditorFromMarkdown(markdown) {
    const { Editor } = await import('@tiptap/core');
    const StarterKitModule = await import('@tiptap/starter-kit');
    const LinkModule = await import('@tiptap/extension-link');
    const { Markdown } = await import('tiptap-markdown');

    const el = document.createElement('div');
    document.body.appendChild(el);
    const editor = new Editor({
        element: el,
        extensions: [
            StarterKitModule.default.configure({ heading: { levels: [2, 3] }, link: false }),
            LinkModule.default.configure({
                openOnClick: false,
                protocols: ['https', 'http', 'mailto'],
                HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' }
            }),
            Markdown
        ],
        content: markdownToLegalHtml(markdown)
    });
    return editor;
}

// ---- 8. Visual -> Markdown round trip preserves heading ----
test('round trip: heading preserved as ##', async () => {
    const editor = await createEditorFromMarkdown(SAMPLE_MD);
    const md = editor.storage.markdown.getMarkdown();
    assert.match(md, /^## 1\. Introduction and Acceptance/m, 'h2 -> "## " markdown');
    assert.match(md, /^## 2\. Zantara Services/m, 'second h2 preserved');
    editor.destroy();
});

// ---- 9. round trip preserves paragraph ----
test('round trip: paragraph preserved', async () => {
    const editor = await createEditorFromMarkdown(SAMPLE_MD);
    const md = editor.storage.markdown.getMarkdown();
    assert.match(md, /By using Zantara you agree to these terms\./, 'paragraph text preserved');
    editor.destroy();
});

// ---- 10. round trip preserves bullet list ----
test('round trip: bullet list preserved as "- "', async () => {
    const editor = await createEditorFromMarkdown(SAMPLE_MD);
    const md = editor.storage.markdown.getMarkdown();
    assert.match(md, /(^|\n)-\s+Airtime recharge/, 'bullet item preserved as dash list');
    assert.match(md, /(^|\n)-\s+Data bundles/, 'second bullet preserved');
    editor.destroy();
});

// ---- 11. round trip preserves numbered list ----
test('round trip: numbered list preserved as "N. "', async () => {
    const editor = await createEditorFromMarkdown(SAMPLE_MD);
    const md = editor.storage.markdown.getMarkdown();
    assert.match(md, /(^|\n)1\.\s+Register an account/, 'ordered item 1 preserved');
    assert.match(md, /(^|\n)3\.\s+Place an order/, 'ordered item 3 preserved');
    editor.destroy();
});

// ---- 12. round trip preserves link ----
test('round trip: link preserved as markdown link', async () => {
    const editor = await createEditorFromMarkdown(SAMPLE_MD);
    const md = editor.storage.markdown.getMarkdown();
    assert.match(md, /\[Privacy Policy\]\(\/privacy\)/, 'link serialized with canonical /privacy href');
    editor.destroy();
});

// ---- 8b. round trip preserves bold + italic ----
test('round trip: bold and italic preserved', async () => {
    const editor = await createEditorFromMarkdown(SAMPLE_MD);
    const md = editor.storage.markdown.getMarkdown();
    assert.match(md, /\*\*all\*\*/, 'bold preserved as **');
    assert.match(md, /\*carefully\*/, 'italic preserved as *');
    editor.destroy();
});

// ---- 7. Markdown editor path preserves sourceMarkdown bytes ----
test('Markdown mode: raw sourceMarkdown is edited verbatim (no transforms)', () => {
    const component = readFileSync(join(__dirname, '..', 'src', 'pages', 'admin', 'legal', 'AdminLegalDocumentsPage.tsx'), 'utf8');
    assert.match(component, /mode === 'markdown'/, 'markdown mode branch exists');
    assert.match(component, /value=\{form\.sourceMarkdown\}/, 'textarea bound directly to sourceMarkdown');
    assert.match(component, /placeholder="Write markdown content…"/, 'markdown textarea retained');
});

// ---- 13. Preview does not mutate / save / publish ----
test('Draft Preview renders read-only (pure derive, labeled, no publish)', () => {
    const component = readFileSync(join(__dirname, '..', 'src', 'pages', 'admin', 'legal', 'AdminLegalDocumentsPage.tsx'), 'utf8');
    assert.match(component, /Draft Preview/, 'preview is labeled Draft Preview');
    assert.match(component, /Not saved or published/, 'preview explicitly says not saved/published');
    assert.match(component, /markdownToLegalHtml\(form\.sourceMarkdown/, 'preview derives from canonical sourceMarkdown');
});

test('Preview purity: rendering helper leaves source markdown unmodified and is idempotent', () => {
    const input = '## Heading\n\nText.';
    const once = markdownToLegalHtml(input);
    const twice = markdownToLegalHtml(input);
    assert.equal(input, '## Heading\n\nText.', 'input string unchanged');
    assert.equal(once, twice, 'idempotent render');
    assert.ok(!once.includes('## Heading'), 'markdown never leaks into preview HTML');
});

// ---- 14. existing admin save/update flow still wired ----
test('admin save flow still present (create + update + publish + archive)', () => {
    const component = readFileSync(join(__dirname, '..', 'src', 'pages', 'admin', 'legal', 'AdminLegalDocumentsPage.tsx'), 'utf8');
    assert.match(component, /API\.post\('\/legal\/admin\/documents'/, 'create flow present');
    assert.match(component, /API\.put\(adminLegalDocumentUrl\('update'/, 'update flow present');
    assert.match(component, /adminLegalDocumentUrl\('publish'/, 'publish flow present');
    assert.match(component, /adminLegalDocumentUrl\('archive'/, 'archive flow present');
});

test('admin editor modes Visual | Markdown | Preview all present', () => {
    const component = readFileSync(join(__dirname, '..', 'src', 'pages', 'admin', 'legal', 'AdminLegalDocumentsPage.tsx'), 'utf8');
    for (const label of ['Visual', 'Markdown', 'Preview']) {
        assert.ok(component.includes(label), `${label} tab present`);
    }
    assert.match(component, /mode === 'visual'/, 'visual mode branch');
    assert.match(component, /mode === 'preview'/, 'preview mode branch');
});

// ---- 6 (section tool) is covered in legalReaderAndPreview.test.mjs ----

process.on('exit', () => { dom.window.close(); });