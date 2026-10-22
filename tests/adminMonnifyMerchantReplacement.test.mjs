import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFileSync(join(root, relative), 'utf8');

let recoveryContractPromise;
const loadRecoveryContract = () => {
    recoveryContractPromise ||= build({
        stdin: {
            contents: `
                export { isValidMonnifyGatewayTestRecoverySuccess as validate }
                    from './src/services/admin/adminPaymentGatewayService.ts';
            `,
            resolveDir: root,
            sourcefile: 'monnify-gateway-test-recovery-contract.ts',
            loader: 'ts',
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        plugins: [{
            name: 'recovery-api-mock',
            setup(builder) {
                builder.onResolve({ filter: /api[\\/]apiClient$/ }, () => ({
                    path: 'api-client',
                    namespace: 'recovery-contract',
                }));
                builder.onLoad({ filter: /.*/, namespace: 'recovery-contract' }, () => ({
                    loader: 'js',
                    contents: 'export default {};',
                }));
            },
        }],
    }).then(result => import(
        `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
    ));
    return recoveryContractPromise;
};

const recoveredSuccess = {
    success: true,
    httpStatus: 200,
    code: 'MONNIFY_GATEWAY_TEST_RECOVERED',
    status: 'success',
    reference: 'MONNIFY-RECOVERY-REFERENCE',
    recovered: true,
    alreadyRecovered: false,
    credited: false,
    nextAction: 'check_eligibility',
};

test('gateway-test recovery accepts an exact newly-recovered success response', async () => {
    const { validate } = await loadRecoveryContract();
    assert.equal(validate(recoveredSuccess, recoveredSuccess.reference), true);
});

test('gateway-test recovery accepts an exact already-recovered success response', async () => {
    const { validate } = await loadRecoveryContract();
    assert.equal(validate({
        ...recoveredSuccess,
        code: 'MONNIFY_GATEWAY_TEST_ALREADY_RECOVERED',
        alreadyRecovered: true,
    }, recoveredSuccess.reference), true);
});

test('gateway-test recovery rejects malformed or incomplete success responses', async () => {
    const { validate } = await loadRecoveryContract();
    for (const response of [
        { ...recoveredSuccess, code: undefined },
        { ...recoveredSuccess, status: undefined },
        { ...recoveredSuccess, reference: 'MONNIFY-DIFFERENT-REFERENCE' },
        { ...recoveredSuccess, recovered: undefined },
        { ...recoveredSuccess, credited: true },
        { ...recoveredSuccess, nextAction: undefined },
        { ...recoveredSuccess, alreadyRecovered: undefined },
    ]) {
        assert.equal(validate(response, recoveredSuccess.reference), false);
    }
});

test('gateway-test recovery rejects success responses with an incorrect HTTP status', async () => {
    const { validate } = await loadRecoveryContract();
    assert.equal(validate({ ...recoveredSuccess, httpStatus: 201 }, recoveredSuccess.reference), false);
    assert.equal(validate({ ...recoveredSuccess, httpStatus: 202 }, recoveredSuccess.reference), false);
});

test('gateway-test recovery rejects contradictory code and idempotency fields', async () => {
    const { validate } = await loadRecoveryContract();
    assert.equal(validate({ ...recoveredSuccess, alreadyRecovered: true }, recoveredSuccess.reference), false);
    assert.equal(validate({
        ...recoveredSuccess,
        code: 'MONNIFY_GATEWAY_TEST_ALREADY_RECOVERED',
        alreadyRecovered: false,
    }, recoveredSuccess.reference), false);
    assert.equal(validate({
        ...recoveredSuccess,
        code: 'MONNIFY_GATEWAY_TEST_UNEXPECTED',
    }, recoveredSuccess.reference), false);
});

test('SuperAdmin Monnify lifecycle service uses typed metadata and dedicated endpoints', () => {
    const service = read('src/services/admin/adminPaymentGatewayService.ts');

    assert.match(service, /interface MonnifyCheckoutValidation/);
    assert.match(service, /status: 'initializing' \| 'initialized' \| 'ambiguous' \| 'verified'/);
    assert.match(service, /administrativeSandboxOnly\?: boolean/);
    assert.match(service, /customerFundingEligibility\?: MonnifyCustomerFundingEligibility/);
    assert.match(service, /replace-monnify-merchant/);
    assert.match(service, /'replace-monnify-merchant' \| 'replace-monnify-live-merchant'/);
    assert.match(service, /test-monnify-checkout/);
    assert.match(service, /initialize-monnify-live-validation-checkout/);
    assert.match(service, /enable-monnify-customer-funding/);
    assert.match(service, /'enable-monnify-test-customer-funding' \| 'enable-monnify-live-customer-funding'/);
    assert.match(service, /attemptReleased\?: boolean/);
    assert.match(service, /retryAllowed\?: boolean/);
    assert.match(service, /providerStatus\?: 'FAILED' \| 'EXPIRED'/);
    assert.match(service, /recover-monnify-gateway-test/);
    assert.match(service, /confirmation: 'recover-monnify-test-gateway-payment'/);
    assert.match(service, /nextAction\?: 'check_eligibility'/);
    assert.match(service, /credited\?: false/);
});

test('manual-review gateway tests use a dedicated reauthenticated recovery action', () => {
    const service = read('src/services/admin/adminPaymentGatewayService.ts');
    const page = read('src/pages/admin/finance/AdminPaymentGatewaysPage.tsx');

    assert.match(service, /gatewayId: string \| null/);
    assert.match(service, /recoveryAvailable: boolean/);
    assert.match(page, /transaction\.status === 'reconciliation_required'/);
    assert.match(page, /transaction\.type === 'gateway_test'/);
    assert.match(page, /transaction\.gateway === 'monnify'/);
    assert.match(page, /transaction\.user\?\._id === currentAdminId/);
    assert.match(page, /state\.user\?\.id \|\| state\.user\?\._id/);
    assert.match(page, /gateway\?\.code === 'monnify'/);
    assert.match(page, /recoverMonnifyGatewayTest\(recoveryTarget\.gateway\._id/);
    assert.match(page, /currentPassword: recoveryPassword/);
    assert.match(page, /confirmation: 'recover-monnify-test-gateway-payment'/);
    assert.match(page, /isValidMonnifyGatewayTestRecoverySuccess\(/);
    assert.match(page, /result\.httpStatus !== 202/);
    assert.match(page, /result\.success !== false/);
    assert.match(page, /result\.code !== 'MONNIFY_GATEWAY_TEST_RECOVERY_IN_PROGRESS'/);
    assert.match(page, /result\.status !== 'processing'/);
    assert.match(page, /result\.recovered !== false/);
    assert.match(page, /result\.retryAllowed !== true/);
    assert.match(page, /The recovery status response could not be safely matched to this payment/);
    const recoveryHandler = page.slice(
        page.indexOf('const handleGatewayTestRecovery'),
        page.indexOf('// ─── Modal open'),
    );
    assert.equal((recoveryHandler.match(/setRecoveryTarget\(null\)/g) || []).length, 4);
    assert.ok(
        recoveryHandler.indexOf('setRecoveryTarget(null)') < recoveryHandler.indexOf('await fetchData()'),
        'malformed responses must close the recovery modal before refreshing',
    );
    assert.match(page, /isRecoveryActionAvailable\(tx\)/);
    assert.match(page, /gateway\.environment === 'test'/);
    assert.match(page, /gateway\.metadata\?\.administrativeSandboxOnly === true/);
    assert.match(page, /setReconciliations\(\[\]\)/);
    assert.match(page, /max-h-\[calc\(100vh-2rem\)\]/);
    assert.match(page, /tx\.status === 'settlement_pending'/);
    assert.match(page, />settlement_pending<\/span>/);
    assert.match(page, /Continue with Check Eligibility/);
    assert.match(page, /Run Check Eligibility separately afterward/);
    assert.match(page, /must not credit a wallet, activate Monnify, or change the default gateway/);
    assert.doesNotMatch(
        recoveryHandler,
        /testMonnifyHostedCheckout\(/,
    );
});

test('merchant replacement is environment-specific and remains isolated', () => {
    const page = read('src/pages/admin/finance/AdminPaymentGatewaysPage.tsx');

    assert.match(page, /test: 'https:\/\/sandbox\.monnify\.com'/);
    assert.match(page, /live: 'https:\/\/api\.monnify\.com'/);
    assert.match(page, /environment: replacementCredentials\.environment/);
    assert.match(page, /baseUrl: MONNIFY_API_BASES\[replacementCredentials\.environment\]/);
    assert.match(page, /\? 'replace-monnify-live-merchant'\s*: 'replace-monnify-merchant'/);
    assert.match(page, /Current SuperAdmin Password/);
    assert.match(page, /intentional \{replacementCredentials\.environment\.toUpperCase\(\)\} merchant replacement/);
    assert.match(page, /without changing the current default gateway/);
    assert.match(page, /The replacement remains inactive and admin-isolated/);
    assert.match(page, /paid validation checkout, customer-funding eligibility approval, then separate activation/);
    assert.match(page, /never becomes the default automatically/);
    assert.match(page, /replacementCredentials\.confirmed/);
    assert.match(page, /\{ \.\.\.prev, environment, confirmed: false \}/);
});

test('validation checkout enforces exact host and explicit live confirmation without retries', () => {
    const page = read('src/pages/admin/finance/AdminPaymentGatewaysPage.tsx');

    assert.match(page, /test: 'sandbox\.sdk\.monnify\.com'/);
    assert.match(page, /live: 'sdk\.monnify\.com'/);
    assert.match(page, /confirmation: 'initialize-monnify-live-validation-checkout'/);
    assert.match(page, /checkoutGateway\.environment === 'live' && !checkoutLiveConfirmed/);
    assert.match(page, /isTrustedHostedCheckoutUrl\(result\.authorizationUrl \|\| '', 'monnify', checkoutHost\)/);
    assert.match(page, /rel="noopener noreferrer"/);
    assert.match(page, /PAYMENT_INITIALIZATION_AMBIGUOUS/);
    assert.match(page, /MONNIFY_VALIDATION_CHECKOUT_CONFIGURATION_CHANGED/);
    assert.match(page, /Do not retry this checkout/);
    assert.match(page, /Checkout was initialized with an unsafe response\. Do not retry/);
    assert.match(page, /The checkout response was lost\. Do not retry/);
    assert.match(page, /emptyReplacementCredentials/);
});

test('eligibility action and card routing controls honor administrative isolation', () => {
    const page = read('src/pages/admin/finance/AdminPaymentGatewaysPage.tsx');

    assert.match(page, /Admin Isolated/);
    assert.match(page, /Customer Funding: \{isCustomerEligible \? 'Eligible' : 'Ineligible'\}/);
    assert.match(page, /checkoutEvidenceExpired/);
    assert.match(page, /checkoutEvidenceMatchesGateway/);
    assert.match(page, /checkoutRetryBlocked/);
    assert.match(page, /checkoutEvidence && !checkoutEvidenceExpired/);
    assert.match(page, /checkoutEvidence\?\.gatewayId === gw\._id/);
    assert.match(page, /checkoutEvidence\?\.environment === gw\.environment/);
    assert.match(page, /\['initialized', 'ambiguous'\]\.includes\(checkoutEvidence\.status\)/);
    assert.match(page, /canReviewEligibility &&/);
    assert.match(page, /disabled=\{isActionBusy \|\| \(gw\.status !== 'active' && monnifyActivationBlocked\)\}/);
    assert.match(page, /disabled=\{isActionBusy \|\| gw\.status !== 'active' \|\| monnifyActivationBlocked\}/);
    assert.match(page, /\? 'enable-monnify-live-customer-funding'\s*: 'enable-monnify-test-customer-funding'/);
    assert.match(page, /result\.httpStatus === 202/);
    assert.match(page, /result\.success !== true/);
    assert.match(page, /result\.status && result\.status !== 'success'/);
    assert.match(page, /Do not retry automatically/);
    assert.match(page, /failure\?\.attemptReleased === true/);
    assert.match(page, /failure\?\.retryAllowed === true/);
    assert.match(page, /failure\?\.refreshRequired === true/);
    assert.match(page, /The validation state changed\. Review the refreshed gateway before continuing/);
    assert.match(page, /await fetchData\(\)/);
    assert.match(page, /requestId !== fetchRequestId\.current/);
    assert.match(page, /requestId !== fetchRequestId\.current\) return false/);
    assert.match(page, /setGateways\(\[\]\)/);
    assert.match(page, /setCheckoutClock\(Date\.now\(\)\)/);
    assert.match(page, /\['FAILED', 'EXPIRED'\]\.includes\(failure\.providerStatus\)/);
    assert.match(page, /A new \$\{eligibilityGateway\.environment\.toUpperCase\(\)\} checkout may now be started explicitly/);
    assert.match(page, /Attempt Locked/);
    assert.match(page, /only after Monnify confirms FAILED or EXPIRED/);
    assert.doesNotMatch(
        page.slice(page.indexOf('failure?.attemptReleased === true'), page.indexOf('// ─── Modal open')),
        /testMonnifyHostedCheckout\(/,
    );
    assert.match(page, /gateway remains inactive; activate it separately/);
    assert.match(page, /eligibilityConfirmed/);
    assert.match(page, /const formIsCanonicalMonnify = formCode === 'monnify' && formAdapterType === 'monnify'/);
    assert.match(page, /!selectedGateway \|\|/);
    assert.match(page, /setFormStatus\('inactive'\)/);
    assert.match(page, /setFormIsDefault\(false\)/);
});

test('generic live changes send the backend confirmation literal after user confirmation', () => {
    const page = read('src/pages/admin/finance/AdminPaymentGatewaysPage.tsx');

    assert.match(page, /window\.confirm/);
    assert.match(page, /confirmEnvironmentChange = selectedGateway \? 'test-to-live' : 'create-live'/);
    assert.match(page, /\{ confirmEnvironmentChange \}/);
});

test('normal wallet funding remains amount-only with no gateway test override', () => {
    const wallet = read('src/services/wallet/walletService.ts');
    assert.match(wallet, /API\.post\("\/wallet\/fund", \{ amount \}\)/);
    assert.doesNotMatch(
        wallet.slice(wallet.indexOf('export async function initWalletFunding')),
        /gatewayCode\s*:/,
    );
});

test('SuperAdmin gateway controls use durable deactivation instead of deletion', () => {
    const service = read('src/services/admin/adminPaymentGatewayService.ts');
    const page = read('src/pages/admin/finance/AdminPaymentGatewaysPage.tsx');

    assert.doesNotMatch(service, /deletePaymentGateway/);
    assert.match(page, /Gateway records are retained permanently/);
    assert.match(page, /Use <strong>Deactivate<\/strong> to archive a gateway/);
    assert.match(page, /hard deletion is disabled/);
});
