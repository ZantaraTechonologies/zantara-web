import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    extractPaymentReference,
    getReturnDecision,
    runPaymentReturn
} from '../src/utils/paymentReturn.ts';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeDeps(overrides = {}) {
    const called = { navigate: [] };
    const verifyCalls = [];
    const deps = {
        navigate: (path) => called.navigate.push(path),
        verify: async (reference) => {
            verifyCalls.push(reference);
            return overrides.verifyResult || { status: 'success' };
        },
        onConfirming: () => {},
        attempts: 1,
        delayMs: 1,
        confirmDelayMs: 1
    };
    return { deps, called, verifyCalls };
}

test('paystack extracts `reference` (and trxref only as fallback)', () => {
    assert.equal(
        extractPaymentReference('paystack', new URLSearchParams('reference=PS_1&trxref=PS_1')),
        'PS_1'
    );
    assert.equal(
        extractPaymentReference('paystack', new URLSearchParams('trxref=PS_2')),
        'PS_2'
    );
    assert.equal(
        extractPaymentReference('paystack', new URLSearchParams('status=success')),
        null
    );
});

test('monnify extracts `paymentReference` and NEVER `transactionReference`', () => {
    assert.equal(
        extractPaymentReference('monnify', new URLSearchParams('paymentReference=MNFY_9&transactionReference=TX_999')),
        'MNFY_9'
    );
    assert.equal(
        extractPaymentReference('monnify', new URLSearchParams('transactionReference=TX_999')),
        null
    );
    assert.equal(
        extractPaymentReference('monnify', new URLSearchParams('status=paid')),
        null
    );
});

test('flutterwave extracts `tx_ref` (the original Zantara reference)', () => {
    assert.equal(
        extractPaymentReference('flutterwave', new URLSearchParams('status=successful&tx_ref=FLW_7&transaction_id=42')),
        'FLW_7'
    );
    assert.equal(
        extractPaymentReference('flutterwave', new URLSearchParams('status=successful&transaction_id=42')),
        null
    );
});

test('empty or non-reference-only searches are direct hits (safe, no verify)', () => {
    assert.deepEqual(getReturnDecision('paystack', ''), { kind: 'direct-hit', gateway: 'paystack' });
    assert.deepEqual(getReturnDecision('monnify', '?status=paid'), { kind: 'direct-hit', gateway: 'monnify' });
    assert.deepEqual(getReturnDecision('flutterwave', '?status=successful'), { kind: 'direct-hit', gateway: 'flutterwave' });
});

test('query-string status values are inert: reference present always yields verify, never a direct credit', () => {
    const d = getReturnDecision('monnify', '?status=paid&paymentReference=MNFY_5');
    assert.equal(d.kind, 'verify');
    assert.equal(d.reference, 'MNFY_5');
});

test('monnify paymentReference reaches /wallet/verify', async () => {
    const { deps, called, verifyCalls } = makeDeps({ verifyResult: { status: 'success' } });
    await runPaymentReturn('monnify', '?paymentReference=MNFY_A&transactionReference=TX_A&status=paid', deps);
    assert.deepEqual(verifyCalls, ['MNFY_A']);
    assert.deepEqual(called.navigate, ['/app/wallet?funded=1']);
});

test('paystack reference reaches /wallet/verify', async () => {
    const { deps, called, verifyCalls } = makeDeps({ verifyResult: { status: 'success' } });
    await runPaymentReturn('paystack', '?reference=PS_A&trxref=PS_A', deps);
    assert.deepEqual(verifyCalls, ['PS_A']);
    assert.deepEqual(called.navigate, ['/app/wallet?funded=1']);
});

test('flutterwave tx_ref reaches /wallet/verify', async () => {
    const { deps, called, verifyCalls } = makeDeps({ verifyResult: { status: 'success' } });
    await runPaymentReturn('flutterwave', '?status=successful&tx_ref=FLW_A', deps);
    assert.deepEqual(verifyCalls, ['FLW_A']);
    assert.deepEqual(called.navigate, ['/app/wallet?funded=1']);
});

test('network error on verify is never terminal (confirming path, no failed verdict)', async () => {
    const { deps, called } = makeDeps({});
    const recorded = [];
    deps.verify = async (reference) => { recorded.push(reference); throw new Error('transport'); };
    await runPaymentReturn('paystack', '?reference=PS_NET', deps);
    assert.deepEqual(recorded, ['PS_NET']);
    assert.deepEqual(called.navigate, ['/app/wallet']);
});

test('pending is not terminal: confirms after bounded retries, wallet stays recoverable', async () => {
    const { deps, called } = makeDeps({ verifyResult: { status: 'pending' } });
    let confirmingCalls = 0;
    deps.onConfirming = () => confirmingCalls++;
    deps.attempts = 2;
    await runPaymentReturn('paystack', '?reference=PS_PEND', deps);
    assert.equal(confirmingCalls, 1);
    assert.deepEqual(called.navigate, ['/app/wallet']);
});

test('reconciliation_required is not terminal locally', async () => {
    const { deps, called } = makeDeps({ verifyResult: { status: 'reconciliation_required' } });
    deps.attempts = 2;
    await runPaymentReturn('monnify', '?paymentReference=MNFY_REC', deps);
    assert.deepEqual(called.navigate, ['/app/wallet']);
});

test('terminal failed is only shown when the BACKEND reports failed', async () => {
    const { deps, called, verifyCalls } = makeDeps({ verifyResult: { status: 'failed' } });
    await runPaymentReturn('paystack', '?reference=PS_F', deps);
    assert.deepEqual(verifyCalls, ['PS_F']);
    assert.deepEqual(called.navigate, ['/app/wallet?funded=0']);
});

test('investment_buy type keeps the legacy investment navigation', async () => {
    const { deps, called } = makeDeps({ verifyResult: { status: 'success', type: 'investment_buy' } });
    await runPaymentReturn('paystack', '?reference=PS_INV', deps);
    assert.deepEqual(called.navigate, ['/app/investments?success=1']);
});

test('direct hit without reference: neutral wallet bounce, verify never called', async () => {
    const { deps, called, verifyCalls } = makeDeps();
    await runPaymentReturn('monnify', '?transactionReference=TX_1', deps);
    assert.deepEqual(verifyCalls, []);
    assert.deepEqual(called.navigate, ['/app/wallet']);
});

test('direct hit cannot succeed/fail on a lone `status` query param', async () => {
    const { deps, called, verifyCalls } = makeDeps();
    await runPaymentReturn('paystack', '?status=success', deps);
    assert.deepEqual(verifyCalls, []);
    assert.deepEqual(called.navigate, ['/app/wallet']);
});