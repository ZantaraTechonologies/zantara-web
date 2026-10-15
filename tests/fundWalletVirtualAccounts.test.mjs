import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
    getEnvironmentBankSlugs,
    getFundingMethodAccountProvider,
    getVirtualAccountProviderLabel,
    isUsableVirtualAccount,
    isValidVirtualAccountConsent,
    isVirtualAccountRequestResponse,
    isVirtualAccountStatusResponse,
    PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION,
    replaceVirtualAccounts,
} from '../src/utils/virtualAccounts.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(join(root, relative), 'utf8');

const activeAccount = (provider = 'paystack', overrides = {}) => ({
    _id: `${provider}-account`,
    provider,
    bankName: 'Test Bank',
    accountName: 'ZANTARA / TEST USER',
    accountNumber: '0123456789',
    currency: 'NGN',
    provisioningStatus: 'active',
    active: true,
    assigned: true,
    ...overrides,
});

const consentRequired = provider => ({
    status: 'consent_required',
    consent: {
        required: true,
        version: PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION,
        purpose: 'permanent_virtual_account',
        provider,
    },
});

test('only complete backend-displayable accounts are usable', () => {
    const account = activeAccount();
    assert.equal(isUsableVirtualAccount(account), true);

    for (const patch of [
        { provider: undefined },
        { currency: 'USD' },
        { provisioningStatus: 'pending' },
        { active: false },
        { assigned: false },
        { bankName: '' },
        { accountName: '' },
        { accountNumber: '' },
    ]) {
        assert.equal(isUsableVirtualAccount({ ...account, ...patch }), false);
    }
});

test('provider-less legacy rows are quarantined instead of guessed as Monnify', () => {
    const legacy = activeAccount(undefined, { provider: undefined });
    assert.equal(isUsableVirtualAccount(legacy), false);
    assert.equal(getVirtualAccountProviderLabel(legacy), 'Unverified provider');
});

test('authoritative account replacement removes stale and non-displayable records', () => {
    const current = activeAccount('monnify', { accountNumber: '1000000001' });
    const replacement = activeAccount('paystack', { accountNumber: '2000000002' });
    const pending = activeAccount('monnify', { provisioningStatus: 'pending', active: false, assigned: false });

    assert.deepEqual(replaceVirtualAccounts([replacement, pending]), [replacement]);
    assert.notDeepEqual(replaceVirtualAccounts([replacement]), [current, replacement]);
});

test('zero, one, and multiple usable accounts remain distinct display states', () => {
    const first = activeAccount('paystack', { accountNumber: '1000000001' });
    const second = activeAccount('monnify', { accountNumber: '2000000002' });
    assert.equal(replaceVirtualAccounts([]).length, 0);
    assert.deepEqual(replaceVirtualAccounts([first]), [first]);
    assert.deepEqual(replaceVirtualAccounts([first, second]), [first, second]);
});

test('authoritative replacement strips internal and unexpected provider fields', () => {
    const account = activeAccount('paystack', {
        gatewayId: 'internal-gateway',
        accountReference: 'internal-reference',
        provisioningKey: 'internal-key',
        secretKey: 'provider-secret',
    });
    const [display] = replaceVirtualAccounts([account]);
    assert.equal(display.accountNumber, account.accountNumber);
    assert.equal('gatewayId' in display, false);
    assert.equal('accountReference' in display, false);
    assert.equal('provisioningKey' in display, false);
    assert.equal('secretKey' in display, false);
});

test('Paystack preferred-bank choices are constrained to the active gateway environment', () => {
    const slugs = ['wema-bank', 'titan-paystack', 'test-bank'];
    assert.deepEqual(getEnvironmentBankSlugs('test', slugs), ['test-bank']);
    assert.deepEqual(getEnvironmentBankSlugs('live', slugs), ['wema-bank', 'titan-paystack']);
    assert.deepEqual(getEnvironmentBankSlugs('staging', slugs), []);
    assert.equal(getFundingMethodAccountProvider({ code: 'alias', virtualAccounts: { type: 'dedicated' } }), 'paystack');
});

test('consent is bound to the exact provider, purpose, and permanent-account version', () => {
    const status = {
        status: 'consent_required',
        consent: {
            required: true,
            version: PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION,
            purpose: 'permanent_virtual_account',
            provider: 'paystack',
        },
    };

    assert.equal(isValidVirtualAccountConsent('paystack', status), true);
    assert.equal(isValidVirtualAccountConsent('monnify', status), false);
    assert.equal(isValidVirtualAccountConsent('Paystack', {
        ...status,
        consent: { ...status.consent, provider: 'Paystack' },
    }), false);
    assert.equal(isValidVirtualAccountConsent('paystack', {
        ...status,
        consent: { ...status.consent, version: 'stale_version' },
    }), false);
    assert.equal(isValidVirtualAccountConsent('paystack', {
        ...status,
        consent: { ...status.consent, purpose: 'other' },
    }), false);
});

test('authoritative status validation rejects unsuccessful and malformed nested data', () => {
    const valid = {
        success: true,
        accounts: [activeAccount()],
        providers: { paystack: { status: 'active' }, monnify: consentRequired('monnify') },
        legacyReviewRequired: false,
    };

    assert.equal(isVirtualAccountStatusResponse(valid), true);
    assert.equal(isVirtualAccountStatusResponse({ ...valid, success: false }), false);
    assert.equal(isVirtualAccountStatusResponse({ ...valid, accounts: [null] }), false);
    assert.equal(isVirtualAccountStatusResponse({
        ...valid,
        accounts: [activeAccount('paystack', { accountNumber: {} })],
    }), false);
    assert.equal(isVirtualAccountStatusResponse({ ...valid, providers: { paystack: {} } }), false);
    assert.equal(isVirtualAccountStatusResponse({
        ...valid,
        providers: { paystack: { status: 'consent_required', consent: { version: {} } } },
    }), false);
    assert.equal(isVirtualAccountStatusResponse({ ...valid, providers: { Paystack: { status: 'active' } } }), false);
    assert.equal(isVirtualAccountStatusResponse({
        ...valid,
        providers: { paystack: { status: 'future_state' }, monnify: consentRequired('monnify') },
    }), false);
    assert.equal(isVirtualAccountStatusResponse({
        ...valid,
        providers: { paystack: { status: 'active' }, monnify: { status: 'active' } },
    }), false);
});

test('request response validation enforces aggregate status and provider structure', () => {
    const valid = {
        success: true,
        status: 'partial',
        accounts: [activeAccount()],
        providers: { paystack: { status: 'active' }, monnify: { status: 'definitive_rejection' } },
    };
    assert.equal(isVirtualAccountRequestResponse(valid), true);
    assert.equal(isVirtualAccountRequestResponse({ ...valid, status: 'future_state' }), false);
    assert.equal(isVirtualAccountRequestResponse({ ...valid, success: false }), false);
    assert.equal(isVirtualAccountRequestResponse({ ...valid, providers: { paystack: { status: 'active' } } }), false);
});

test('web service uses the authoritative status and provider-neutral request routes', () => {
    const service = read('src/services/wallet/walletService.ts');
    assert.match(service, /API\.get\("\/wallet\/virtual-accounts"\)/);
    assert.match(service, /isVirtualAccountStatusResponse\(data\)/);
    assert.match(service, /API\.post\('\/wallet\/virtual-accounts\/request', payload\)/);
    assert.match(service, /isVirtualAccountRequestResponse\(data\)/);
    assert.doesNotMatch(service, /virtual-accounts\/\$\{encodeURIComponent/);
    assert.doesNotMatch(service, /\/auth\/me/);
});

test('request UI shows provider-specific versioned consent but submits one aggregate action', () => {
    const panel = read('src/components/wallet/VirtualAccountProvisioningPanel.tsx');
    assert.match(panel, /I consent to <strong>\{label\}<\/strong> creating and maintaining a permanent bank transfer account/);
    assert.match(panel, /Consent version \{consentVersion/);
    assert.match(panel, /isValidVirtualAccountConsent\(provider, status\)/);
    assert.match(panel, /PERMANENT_VIRTUAL_ACCOUNT_CONSENT_VERSION/);
    assert.match(panel, /!allowedBanks\.includes\(selectedBanks\[provider\]\)/);
    assert.match(panel, /preferredBank: selectedBanks\[provider\]/);
    assert.match(panel, /retryRejectedProviders/);
    assert.match(panel, /const payload = buildPayload\(\)/);
    assert.match(panel, /requestAccounts\(payload\)/);
    assert.match(panel, /Request Bank Account/);
    assert.doesNotMatch(panel, /data-provision-provider|Choose an enabled provider/);
});

test('dashboard displays active accounts only and has no empty, pending, failure, or request card', () => {
    const dashboard = read('src/pages/user/UserDashboardPage.tsx');
    assert.match(dashboard, /usableVirtualAccounts\.length > 0 &&/);
    assert.doesNotMatch(dashboard, /Request a funding account|setup in progress|account unavailable|usePendingVirtualAccountRefresh/);
});

test('pending refresh is bounded and session-owned stores replace authoritative account state', () => {
    const refreshHook = read('src/hooks/usePendingVirtualAccountRefresh.ts');
    const store = read('src/store/wallet/walletStore.js');
    assert.match(refreshHook, /MAX_REFRESH_ATTEMPTS = 6/);
    assert.match(refreshHook, /attempts >= MAX_REFRESH_ATTEMPTS/);
    assert.match(refreshHook, /clearInterval\(interval\)/);
    assert.match(store, /isSessionEpochCurrent\(epoch\)/);
    assert.match(store, /replaceVirtualAccounts\(data\.accounts\)/);
    assert.match(store, /virtualAccountStatusError: 'Unable to check bank account availability/);
    assert.match(store, /virtualAccounts: \[\],[\s\S]*virtualAccountProviders: \{\}/);
    assert.match(store, /if \(!refreshed\) return null/);
    assert.doesNotMatch(store, /mergeVirtualAccounts/);
    assert.doesNotMatch(store, /replaceVirtualAccounts\(result\.accounts\)/);
});

test('dedicated account page keeps partial-provider actions in one panel', () => {
    const details = read('src/pages/user/UserVirtualAccountPage.tsx');
    assert.match(details, /showWhenAccountExists/);
    assert.doesNotMatch(details, /providerOutcomes/);
    const panel = read('src/components/wallet/VirtualAccountProvisioningPanel.tsx');
    assert.match(panel, /virtualAccountStatusError \? \(/);
    assert.equal((details.match(/<VirtualAccountProvisioningPanel/g) || []).length, 1);
});

test('hosted funding is amount-only while permanent accounts remain separately accessible', () => {
    const funding = read('src/pages/user/UserFundWalletPage.tsx');
    const service = read('src/services/wallet/walletService.ts');
    assert.match(funding, /initWalletFunding\(fundingAmount\)/);
    assert.match(funding, /Continue to Payment/);
    assert.match(funding, /wallet\/virtual-account/);
    assert.doesNotMatch(funding, /selected === 'card'|selected === 'ussd'|Debit Card|Pay with USSD/);
    assert.match(service, /API\.post\("\/wallet\/fund", \{ amount \}\)/);
    assert.doesNotMatch(service, /\{ amount, channel/);
    assert.doesNotMatch(funding, /api\.paystack\.co|fetch\([^)]*paystack/i);
});
