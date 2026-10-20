import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => readFileSync(join(root, relative), 'utf8');

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
    assert.match(page, /\['initialized', 'ambiguous'\]\.includes\(checkoutEvidence\.status\)/);
    assert.match(page, /canReviewEligibility &&/);
    assert.match(page, /disabled=\{isActionBusy \|\| \(gw\.status !== 'active' && monnifyActivationBlocked\)\}/);
    assert.match(page, /disabled=\{isActionBusy \|\| gw\.status !== 'active' \|\| monnifyActivationBlocked\}/);
    assert.match(page, /\? 'enable-monnify-live-customer-funding'\s*: 'enable-monnify-test-customer-funding'/);
    assert.match(page, /result\.httpStatus === 202/);
    assert.match(page, /Do not retry automatically/);
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
