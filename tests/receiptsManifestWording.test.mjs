/**
 * CORRECTION 3 REGRESSION: No false verification wording on web receipts.
 *
 * Proves the web receipt implementation no longer advertises
 * "Officially Verified Digital Manifest" (or any unsupported verification claim)
 * and instead uses the agreed neutral language.
 *
 * Run: node --experimental-strip-types --test tests/receiptsManifestWording.test.mjs
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import { buildReceiptModel, getCategoryDetailRows } from '../src/utils/receiptUtils.ts';

const UNSUPPORTED = [
  'Officially Verified Digital Manifest',
  'Officially verified',
  'Officially authenticated',
  'Verified digital',
  'Verified Digital Manifest',
  'Certified Digital Manifest',
  'regulatory receipt',
  'licensed receipt',
];

const NEUTRAL = [
  'This is a computer-generated receipt',
];

describe('Web receipt verification wording', () => {
  it('ReceiptPage.tsx does not contain unsupported verification wording', async () => {
    const source = await readFile(new URL('../src/pages/user/ReceiptPage.tsx', import.meta.url), 'utf8');
    for (const phrase of UNSUPPORTED) {
      assert.equal(source.includes(phrase), false, `unsupported wording found: "${phrase}"`);
    }
  });

  it('ReceiptPage.tsx contains the agreed neutral receipt language', async () => {
    const source = await readFile(new URL('../src/pages/user/ReceiptPage.tsx', import.meta.url), 'utf8');
    for (const phrase of NEUTRAL) {
      assert.equal(source.includes(phrase), true, `neutral wording missing: "${phrase}"`);
    }
  });

  it('receipt model output carries no verification-manifest strings', () => {
    const tx = {
      _id: 'txn-1', transactionId: 'ZNT-1', refId: 'ZNT-1', type: 'airtime',
      service: 'mtnairtime', amount: 200, status: 'success', currency: 'NGN',
      createdAt: '2026-09-11T16:14:23.000Z', details: { phone: '08031234567', network: 'MTN' },
    };
    const json = JSON.stringify(buildReceiptModel(tx, { displayName: 'Zantara' }));
    const rows = JSON.stringify(getCategoryDetailRows(tx));
    const all = json + rows;
    for (const phrase of UNSUPPORTED) {
      assert.equal(all.includes(phrase), false, `unsupported wording in output: "${phrase}"`);
    }
  });
});