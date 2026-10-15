import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { isTrustedHostedCheckoutUrl } from '../src/utils/hostedCheckout.ts';
import {
    clearPendingFunding,
    getPendingFunding,
    savePendingFunding,
} from '../src/utils/pendingFunding.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFileSync(join(root, relative), 'utf8');

class MemoryStorage {
    values = new Map();
    getItem(key) { return this.values.get(key) ?? null; }
    setItem(key, value) { this.values.set(key, String(value)); }
    removeItem(key) { this.values.delete(key); }
}

test('hosted checkout URLs require HTTPS and the selected provider domain', () => {
    assert.equal(isTrustedHostedCheckoutUrl('https://checkout.paystack.com/start', 'paystack'), true);
    assert.equal(isTrustedHostedCheckoutUrl('https://sandbox.monnify.com/checkout', 'monnify'), true);
    assert.equal(isTrustedHostedCheckoutUrl('https://checkout.flutterwave.com/pay', 'flutterwave'), true);
    assert.equal(isTrustedHostedCheckoutUrl('http://checkout.paystack.com/start', 'paystack'), false);
    assert.equal(isTrustedHostedCheckoutUrl('https://checkout.paystack.com.evil.test/start', 'paystack'), false);
    assert.equal(isTrustedHostedCheckoutUrl('https://user:pass@checkout.paystack.com/start', 'paystack'), false);
    assert.equal(isTrustedHostedCheckoutUrl('javascript:alert(1)', 'paystack'), false);
    assert.equal(isTrustedHostedCheckoutUrl('https://checkout.paystack.com/start', 'monnify'), false);
});

test('pending funding records are owner-bound and clear only by exact reference', () => {
    globalThis.localStorage = new MemoryStorage();
    const payment = { userId: 'user-a', reference: 'PS-A', provider: 'paystack', amount: 500, initiatedAt: 1 };
    assert.equal(savePendingFunding(payment), true);
    assert.deepEqual(getPendingFunding('user-a'), payment);
    assert.equal(clearPendingFunding('user-a', 'wrong-reference'), false);
    assert.deepEqual(getPendingFunding('user-a'), payment);
    assert.equal(clearPendingFunding('user-a', 'PS-A'), true);
    assert.equal(getPendingFunding('user-a'), null);

    savePendingFunding(payment);
    assert.equal(getPendingFunding('user-b'), null);
    assert.deepEqual(getPendingFunding('user-a'), payment);
    const otherPayment = { userId: 'user-b', reference: 'PS-B', provider: 'paystack', initiatedAt: 2 };
    assert.equal(savePendingFunding(otherPayment), true);
    assert.deepEqual(getPendingFunding('user-a'), payment);
    assert.deepEqual(getPendingFunding('user-b'), otherPayment);
});

test('amount-only funding handles pending responses and guards duplicate submissions', () => {
    const page = read('src/pages/user/UserFundWalletPage.tsx');
    const service = read('src/services/wallet/walletService.ts');
    assert.match(service, /API\.post\("\/wallet\/fund", \{ amount \}\)/);
    assert.match(service, /response\.status === 202/);
    assert.match(service, /kind: 'pending'/);
    assert.match(page, /submissionStarted\.current/);
    assert.match(page, /getPendingFunding\(userId\)/);
    assert.match(page, /Do not start another payment/);
    assert.match(page, /isTrustedHostedCheckoutUrl/);
    assert.match(page, /window\.location\.assign/);
    const initialization = page.slice(page.indexOf('const result = await walletService.initWalletFunding'));
    assert.ok(
        initialization.indexOf("result.kind === 'checkout'") < initialization.indexOf('savePendingFunding(record)'),
        'checkout URLs must be validated before a pending lock is persisted',
    );
    assert.match(page, /result\?\.status === 'failed' \|\| result\?\.status === 'not_found'/);
    assert.match(service, /error\?\.response\?\.status === 404/);
    assert.doesNotMatch(page, /gatewayCode|channel:/);
});

test('callback page clears only terminal owner-bound pending references', () => {
    const callback = read('src/pages/user/PaymentReturnPage.tsx');
    const returnFlow = read('src/utils/paymentReturn.ts');
    assert.match(callback, /onTerminal: \(reference\)/);
    assert.match(callback, /clearPendingFunding\(userId, reference\)/);
    assert.match(callback, /onPending: \(reference\)/);
    assert.match(callback, /savePendingFunding\(/);
    assert.match(returnFlow, /onPending\?\.\(reference\)/);
    assert.match(returnFlow, /\/app\?funded=pending/);
});

test('dashboard funding notices remain non-authoritative and account-owned checks are session-safe', () => {
    const dashboard = read('src/pages/user/UserDashboardPage.tsx');
    const funding = read('src/pages/user/UserFundWalletPage.tsx');
    assert.match(dashboard, /FUNDED_SUCCESS_TEXT/);
    assert.doesNotMatch(dashboard, /Payment confirmed and wallet credited/);
    assert.match(funding, /identityOf\(useAuthStore\.getState\(\)\.user\) === payment\.userId/);
});
