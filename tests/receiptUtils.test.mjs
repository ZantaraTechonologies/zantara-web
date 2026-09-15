/**
 * CANONICAL RECEIPT UTILITIES TESTS
 * Imports the actual receiptUtils.ts source to prove shared logic produces consistent values.
 *
 * Run: node --experimental-strip-types --test tests/receiptUtils.test.mjs
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatReceiptDateTimeWAT,
  formatNairaAmount,
  normalizeReceiptStatus,
  getServiceDisplayName,
  getPaymentMethod,
  maskPhone,
  maskAccount,
  getCategoryDetailRows,
  getBeneficiary,
  buildReceiptModel,
  RECEIPT_TIMEZONE_LABEL,
} from '../src/utils/receiptUtils.ts';

const AIRTIME_DOC = {
  _id: 'txn-1',
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

const DATA_DOC = { ...AIRTIME_DOC, _id: 'txn-2', type: 'data', service: 'mtn', details: { phone: '08011112222', serviceID: 'data-1', variation_code: '1GB' } };
const ELEC_DOC = { ...AIRTIME_DOC, _id: 'txn-3', type: 'electricity', service: 'ikeja-electric', details: { meter_number: '12345678901', meter_type: 'prepaid', phone: '0802', token: 'ABCD1234' } };
const CABLE_DOC = { ...AIRTIME_DOC, _id: 'txn-4', type: 'cable', service: 'dstv', details: { billersCode: '1234567890', variation_code: 'Y2026', serviceID: 'dstv' } };
const PIN_DOC = { ...AIRTIME_DOC, _id: 'txn-5', type: 'exam_pin', service: '', details: { serviceID: 'waec', quantity: 2, variation_code: 'PIN' } };
const FUNDING_DOC = { ...AIRTIME_DOC, _id: 'txn-6', type: 'funding', service: 'Paystack', details: {} };
const TRANSFER_DOC = { ...AIRTIME_DOC, _id: 'txn-7', type: 'transfer_out', details: { recipientName: 'Ada', recipientPhone: '08044445555' } };
const REF_DOC = { ...AIRTIME_DOC, _id: 'txn-8', type: 'referral_bonus', amount: 50, details: {} };

describe('Canonical receipt utilities', () => {
  it('formatReceiptDateTimeWAT produces WAT label with correct date', () => {
    const result = formatReceiptDateTimeWAT('2026-09-11T16:14:23.000Z');
    assert.match(result, /11 Sept 2026, 5:14 PM WAT/);
  });
  it('formatReceiptDateTimeWAT returns fallback on invalid date', () => {
    assert.equal(formatReceiptDateTimeWAT('not-a-date'), 'Date unavailable');
  });

  it('normalizeReceiptStatus: success → Success', () => { assert.equal(normalizeReceiptStatus('success'), 'Success'); });
  it('normalizeReceiptStatus: pending → Pending', () => { assert.equal(normalizeReceiptStatus('pending'), 'Pending'); });
  it('normalizeReceiptStatus: failed → Failed', () => { assert.equal(normalizeReceiptStatus('failed'), 'Failed'); });
  it('normalizeReceiptStatus: reversed → Reversed', () => { assert.equal(normalizeReceiptStatus('reversed'), 'Reversed'); });
  it('normalizeReceiptStatus: refunded → Refunded', () => { assert.equal(normalizeReceiptStatus('refunded'), 'Refunded'); });
  it('normalizeReceiptStatus: skipped → Skipped', () => { assert.equal(normalizeReceiptStatus('skipped'), 'Skipped'); });
  it('normalizeReceiptStatus: missing → Pending', () => { assert.equal(normalizeReceiptStatus(undefined), 'Pending'); });

  it('getServiceDisplayName: airtime → MTN Airtime', () => { assert.equal(getServiceDisplayName(AIRTIME_DOC), 'MTN Airtime'); });
  it('getServiceDisplayName: data → MTN Data', () => { assert.equal(getServiceDisplayName(DATA_DOC), 'MTN Data'); });
  it('getServiceDisplayName: cable → DSTV Cable TV', () => { assert.equal(getServiceDisplayName(CABLE_DOC), 'DSTV Cable TV'); });
  it('getServiceDisplayName: electricity → Ikeja Electric Electricity', () => { assert.equal(getServiceDisplayName(ELEC_DOC), 'Ikeja Electric Electricity'); });
  it('getServiceDisplayName: exam_pin → Exam PIN', () => { assert.equal(getServiceDisplayName(PIN_DOC), 'Exam PIN'); });
  it('getServiceDisplayName: referral_bonus → Referral Commission Bonus', () => { assert.equal(getServiceDisplayName(REF_DOC), 'Referral Commission Bonus'); });
  it('getServiceDisplayName: unknown type uses service field title-cased', () => {
    assert.equal(getServiceDisplayName({ type: 'unknown', service: 'some_provider' }), 'Some Provider');
  });

  it('formatNairaAmount: 200 → ₦200.00', () => { assert.equal(formatNairaAmount(200), '₦200.00'); });
  it('formatNairaAmount: 1500 → ₦1,500.00', () => { assert.equal(formatNairaAmount(1500), '₦1,500.00'); });
  it('formatNairaAmount: 25000.50 → ₦25,000.50', () => { assert.equal(formatNairaAmount(25000.50), '₦25,000.50'); });
  it('formatNairaAmount: undefined → ₦0.00', () => { assert.equal(formatNairaAmount(undefined), '₦0.00'); });

  it('maskPhone: 08031234567 → 0803••••4567', () => { assert.equal(maskPhone('08031234567'), '0803••••4567'); });
  it('maskPhone: empty → empty', () => { assert.equal(maskPhone(''), ''); });
  it('maskAccount: 0123456789 → ••••6789', () => { assert.equal(maskAccount('0123456789'), '••••6789'); });

  it('getCategoryDetailRows: airtime has Network + masked Recipient', () => {
    const rows = getCategoryDetailRows(AIRTIME_DOC);
    assert.ok(rows.some(r => r.label === 'Network' && r.value === 'MTN'));
    assert.ok(rows.some(r => r.label === 'Recipient' && r.value === '0803••••4567'));
  });
  it('getCategoryDetailRows: data includes Plan', () => {
    const rows = getCategoryDetailRows(DATA_DOC);
    assert.ok(rows.some(r => r.label === 'Plan' && r.value === '1GB'));
  });
  it('getCategoryDetailRows: electricity includes Token', () => {
    const rows = getCategoryDetailRows(ELEC_DOC);
    assert.ok(rows.some(r => r.label === 'Token' && r.value === 'ABCD1234'));
  });
  it('getCategoryDetailRows: cable includes Package', () => {
    const rows = getCategoryDetailRows(CABLE_DOC);
    assert.ok(rows.some(r => r.label === 'Package' && r.value === 'Y2026'));
  });
  it('getCategoryDetailRows: exam_pin includes Exam and Quantity', () => {
    const rows = getCategoryDetailRows(PIN_DOC);
    assert.ok(rows.some(r => r.label === 'Exam' && r.value === 'WAEC'));
    assert.ok(rows.some(r => r.label === 'Quantity' && r.value === '2'));
  });

  it('getBeneficiary: airtime returns masked phone', () => {
    assert.deepStrictEqual(getBeneficiary(AIRTIME_DOC), { identifier: '0803••••4567', identifierType: 'phone' });
  });
  it('getBeneficiary: transfer_out returns recipientName + masked phone', () => {
    const b = getBeneficiary(TRANSFER_DOC);
    assert.equal(b.displayName, 'Ada');
    assert.equal(b.identifier, '0804••••5555');
    assert.equal(b.identifierType, 'recipient');
  });

  it('getPaymentMethod: funding → Paystack', () => {
    assert.equal(getPaymentMethod(FUNDING_DOC), 'Paystack');
  });
  it('getPaymentMethod: airtime → Zantara Balance', () => {
    assert.equal(getPaymentMethod(AIRTIME_DOC), 'Zantara Balance');
  });

  it('buildReceiptModel returns complete receipt structure', () => {
    const model = buildReceiptModel(AIRTIME_DOC, {
      displayName: 'TestBrand',
      supportEmail: 'help@test.com',
    });
    assert.equal(model.brand.displayName, 'TestBrand');
    assert.equal(model.brand.supportEmail, 'help@test.com');
    assert.equal(model.transaction.reference, 'ZNT-988-AF2');
    assert.equal(model.transaction.amountText, '₦200.00');
    assert.equal(model.transaction.status, 'Success');
    assert.match(model.transaction.transactionDate, /WAT/);
    assert.equal(model.transaction.timezone, 'WAT');
    assert.equal(model.transaction.serviceDisplayName, 'MTN Airtime');
    assert.match(model.receipt.generatedAt, /WAT/);
  });

  it('web and mobile constants match (RECEIPT_TIMEZONE_LABEL)', () => {
    assert.equal(RECEIPT_TIMEZONE_LABEL, 'WAT');
  });
});
