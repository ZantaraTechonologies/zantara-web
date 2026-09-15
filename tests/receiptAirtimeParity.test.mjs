/**
 * CROSS-PLATFORM AIRTIME RECEIPT PARITY TESTS
 * Proves the same airtime transaction produces the SAME receipt semantics on
 * Web and Mobile:
 *   - service
 *   - network
 *   - recipient
 *   - amount
 *   - reference
 *   - status
 *   - timestamp
 *
 * Run: node --experimental-strip-types --test tests/receiptAirtimeParity.test.mjs
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildReceiptModel as webBuild, getCategoryDetailRows as webRows, getServiceDisplayName as webService, getReceiptReference as webRef } from '../src/utils/receiptUtils.ts';
import { buildReceiptModel as mobileBuild, getCategoryDetailRows as mobileRows, getServiceDisplayName as mobileService, getReceiptReference as mobileRef } from '../../mobile_app/src/utils/receiptUtils.ts';

const AIRTIME_DOC = {
  _id: 'txn-airtime-1',
  transactionId: 'ZNT-988-AF2',
  refId: 'ZNT-988-AF2',
  type: 'airtime',
  service: 'mtnairtime',
  amount: 200,
  status: 'success',
  currency: 'NGN',
  createdAt: '2026-09-11T16:14:23.000Z',
  details: { phone: '08031234567', network: 'MTN' },
};

const BRAND = { displayName: 'Zantara', supportEmail: 'support@zantara.com', supportPhone: '+2348000000000' };
const GENERATED_AT = new Date('2026-09-11T17:00:00.000Z');

describe('Airtime receipt parity (Web vs Mobile)', () => {
  it('service display name is identical', () => {
    assert.equal(webService(AIRTIME_DOC), mobileService(AIRTIME_DOC));
    assert.equal(webService(AIRTIME_DOC), 'MTN Airtime');
  });

  it('reference is identical', () => {
    assert.equal(webRef(AIRTIME_DOC), mobileRef(AIRTIME_DOC));
    assert.equal(webRef(AIRTIME_DOC), 'ZNT-988-AF2');
  });

  it('category rows are semantically identical (recipient from phone only)', () => {
    const web = webRows(AIRTIME_DOC);
    const mobile = mobileRows(AIRTIME_DOC);

    assert.deepStrictEqual(web, mobile);
    assert.deepStrictEqual(web, [
      { label: 'Network', value: 'MTN' },
      { label: 'Recipient', value: '0803••••4567' },
    ]);
  });

  it('full receipt model: service, recipient, amount, reference, status, timestamp all match', () => {
    const web = webBuild(AIRTIME_DOC, BRAND, GENERATED_AT);
    const mobile = mobileBuild(AIRTIME_DOC, BRAND, GENERATED_AT);

    assert.equal(web.transaction.serviceDisplayName, mobile.transaction.serviceDisplayName);
    assert.equal(web.transaction.amountText, mobile.transaction.amountText);
    assert.equal(web.transaction.reference, mobile.transaction.reference);
    assert.equal(web.transaction.status, mobile.transaction.status);
    assert.equal(web.transaction.transactionDate, mobile.transaction.transactionDate);
    assert.equal(web.transaction.timezone, mobile.transaction.timezone);

    assert.deepStrictEqual(web.beneficiary, mobile.beneficiary);
    assert.deepStrictEqual(web.categoryDetails, mobile.categoryDetails);

    assert.equal(web.transaction.amountText, '₦200.00');
    assert.equal(web.transaction.reference, 'ZNT-988-AF2');
    assert.equal(web.transaction.status, 'Success');
    assert.match(web.transaction.transactionDate, /WAT/);
  });

  it('recipient_account_number is not invented: absent from both category rows', () => {
    for (const rows of [webRows(AIRTIME_DOC), mobileRows(AIRTIME_DOC)]) {
      assert.equal(rows.some(r => r.label === 'Recipient' && r.value.startsWith('••••')), false);
    }
  });
});