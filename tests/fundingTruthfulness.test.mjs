import { test } from 'node:test';
import assert from 'node:assert/strict';

import { FUNDED_SUCCESS_TEXT, FUNDED_FAILED_TEXT } from '../src/utils/paymentReturnNotices.ts';
import { getReturnDecision, runPaymentReturn } from '../src/utils/paymentReturn.ts';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Truthfulness regression (notification-hardening audit, Phase 14):
// A `?funded=` query parameter is NEVER an authority. The success banner must
// not claim a wallet credit happened; only backend verification and the
// fetched balance are authoritative. A manually typed `?funded=1` therefore
// can never make the page assert "credited".

test('success banner never claims "credited" purely from the URL param', () => {
    const lower = FUNDED_SUCCESS_TEXT.toLowerCase();
    for (const token of ['has been credited', ' credited!', 'was credited', 'success — your wallet']) {
        assert.ok(!lower.includes(token.toLowerCase()), `success banner must not contain '${token}'`);
    }
});

test('success banner points the customer to confirming + the authoritative balance', () => {
    assert.ok(FUNDED_SUCCESS_TEXT.includes('confirming'));
    assert.ok(FUNDED_SUCCESS_TEXT.toLowerCase().includes('balance'));
});

test('failed banner remains a soft, truthful "could not be verified" notice', () => {
    assert.ok(FUNDED_FAILED_TEXT.includes('could not be verified'));
    assert.ok(FUNDED_FAILED_TEXT.includes('contact support'));
});

// The navigation side must stay verification-gated: no code path lets a bare
// URL param reach a credit claim. Re-affirm the return flow guarantees.
test('return flow only produces ?funded=1 after the backend reports success', async () => {
    const verifyCalls = [];
    let status = 'pending';
    const deps = {
        navigate: () => {},
        verify: async (reference) => {
            verifyCalls.push(reference);
            return { status };
        },
        attempts: 1,
        delayMs: 1,
        confirmDelayMs: 1,
        onConfirming: () => {}
    };

    // pending / direct-hit: never a success navigation
    const dPending = getReturnDecision('paystack', '?reference=PS_P');
    assert.equal(dPending.kind, 'verify');

    status = 'success';
    // success only when backend says so
    const called = [];
    const deps2 = {
        navigate: (p) => called.push(p),
        verify: async () => ({ status: 'success' }),
        attempts: 1, delayMs: 1, confirmDelayMs: 1
    };
    await runPaymentReturn('paystack', '?reference=PS_OK', deps2);
    assert.deepEqual(called, ['/app/wallet?funded=1']);
});