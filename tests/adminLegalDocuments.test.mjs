import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    adminLegalDocumentId,
    normalizeAdminLegalDocument,
    adminLegalDocumentUrl
} from '../src/pages/admin/legal/adminLegalDocument.ts';

// Canonical regression: Admin legal URLs must always carry a REAL document id.
// Backend GET-by-id/create/publish/archive return the raw doc (`_id`), while
// the list returns `id`. The page normalizes `_id` -> `id` once and builds
// every URL from `id` — a URL must never contain undefined/null/[object Object].

const VALID_HEX = '507f1f77bcf86cd799439011';

test('list response already carries id and passes normalization unchanged', () => {
    const listItem = { id: VALID_HEX, documentType: 'terms', title: 'T', status: 'draft' };
    assert.equal(normalizeAdminLegalDocument(listItem).id, VALID_HEX);
});

test('by-id response (raw mongoose _id) normalizes _id -> id (the undefined bug)', () => {
    const rawByid = { _id: VALID_HEX, documentType: 'terms', title: 'T', sourceMarkdown: '# x', contentHtml: '<h1>x</h1>' };
    const normalized = normalizeAdminLegalDocument(rawByid);
    assert.equal(normalized.id, VALID_HEX);
    assert.equal(normalized.sourceMarkdown, '# x');
});

test('create response normalizes _id -> id', () => {
    const rawCreate = { _id: VALID_HEX, documentType: 'privacy', title: 'P', status: 'draft' };
    assert.equal(normalizeAdminLegalDocument(rawCreate).id, VALID_HEX);
});

test('update URL contains the actual ObjectId', () => {
    const full = normalizeAdminLegalDocument({ _id: VALID_HEX, documentType: 'terms' }); // same step as openEdit
    const url = adminLegalDocumentUrl('update', full);
    assert.equal(url, `/legal/admin/documents/${VALID_HEX}`);
    assert.ok(!/undefined|null|\[object Object\]/.test(url));
});

test('publish URL contains the actual ObjectId', () => {
    const url = adminLegalDocumentUrl('publish', { id: VALID_HEX });
    assert.equal(url, `/legal/admin/documents/${VALID_HEX}/publish`);
    assert.ok(!/undefined|null|\[object Object\]/.test(url));
});

test('archive URL contains the actual ObjectId', () => {
    const url = adminLegalDocumentUrl('archive', { _id: VALID_HEX });
    assert.equal(url, `/legal/admin/documents/${VALID_HEX}/archive`);
    assert.ok(!/undefined|null|\[object Object\]/.test(url));
});

test('create draft -> immediately edit -> save works without a page refresh', () => {
    // Create response: raw doc with _id only.
    const createResponse = { _id: VALID_HEX, documentType: 'terms', title: 'T', status: 'draft' };
    // fetchDocs() maps the refreshed list through normalize.
    const listDoc = normalizeAdminLegalDocument(createResponse);
    assert.equal(listDoc.id, VALID_HEX);
    // openEdit() GETs by id then normalizes the raw by-id response into editDoc.
    const byIdRaw = { ...createResponse, sourceMarkdown: '# updated', contentHtml: '<p>updated</p>' };
    const editDoc = normalizeAdminLegalDocument(byIdRaw);
    assert.equal(editDoc.id, VALID_HEX);
    // handleSave() PUTs using editDoc.id.
    const updateUrl = adminLegalDocumentUrl('update', editDoc);
    assert.equal(updateUrl, `/legal/admin/documents/${VALID_HEX}`);
    assert.ok(!/undefined|null|\[object Object\]/.test(updateUrl));
});

test('missing/blank id fails fast — no Admin legal URL can contain undefined/null/[object Object]', () => {
    assert.equal(adminLegalDocumentId(undefined), undefined);
    assert.equal(adminLegalDocumentId(null), undefined);
    assert.equal(adminLegalDocumentId({}), undefined);
    assert.equal(adminLegalDocumentId({ id: '', _id: '' }), undefined);
    assert.equal(adminLegalDocumentId({ id: 'undefined', _id: 'undefined' }), undefined);
    assert.equal(adminLegalDocumentId({ id: 'null', _id: 'null' }), undefined);
    assert.equal(adminLegalDocumentId({ id: '[object Object]', _id: '[object Object]' }), undefined);
    for (const bad of [
        undefined,
        null,
        {},
        { id: undefined, _id: undefined },
        { id: null, _id: null },
        { id: 'undefined' },
        { id: 'null' },
        { id: '[object Object]' },
        { _id: 'undefined' }
    ]) {
        assert.equal(adminLegalDocumentId(bad), undefined, `id ${JSON.stringify(bad)} must not resolve`);
        assert.throws(() => adminLegalDocumentUrl('get', bad), /no valid document id/i);
        assert.throws(() => adminLegalDocumentUrl('update', bad), /no valid document id/i);
        assert.throws(() => adminLegalDocumentUrl('publish', bad), /no valid document id/i);
        assert.throws(() => adminLegalDocumentUrl('archive', bad), /no valid document id/i);
    }
});