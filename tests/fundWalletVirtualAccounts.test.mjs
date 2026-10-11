import { after, afterEach, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import {
    getEnvironmentBankSlugs,
    getFundingMethodAccountProvider,
    mergeVirtualAccounts,
} from '../src/utils/virtualAccounts.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let dom;
let harness;
let copiedValues;

class TestMessageChannel {
    constructor() {
        let onmessage = null;
        this.port1 = {
            get onmessage() { return onmessage; },
            set onmessage(handler) { onmessage = handler; },
            close() { onmessage = null; },
        };
        this.port2 = {
            postMessage(data) { setTimeout(() => onmessage?.({ data }), 0); },
            close() {},
        };
    }
}

const activeAccount = (provider, accountNumber, overrides = {}) => ({
    _id: `${provider}-${accountNumber}`,
    provider,
    bankName: provider === 'paystack' ? 'Paystack Test Bank' : 'Monnify Test Bank',
    accountName: 'ZANTARA / TEST USER',
    accountNumber,
    provisioningStatus: 'active',
    active: true,
    assigned: true,
    ...overrides,
});

async function loadHarness() {
    const mocks = {
        name: 'fund-wallet-virtual-account-mocks',
        setup(builder) {
            builder.onResolve({ filter: /store[\\/]wallet[\\/]walletStore(?:\.js)?$/ }, () => ({ path: 'wallet-store', namespace: 'fund-wallet' }));
            builder.onResolve({ filter: /services[\\/]wallet[\\/]walletService(?:\.ts)?$/ }, () => ({ path: 'wallet-service', namespace: 'fund-wallet' }));
            builder.onResolve({ filter: /^react-hot-toast$/ }, () => ({ path: 'toast', namespace: 'fund-wallet' }));
            builder.onLoad({ filter: /.*/, namespace: 'fund-wallet' }, ({ path }) => {
                if (path === 'wallet-store') return { loader: 'js', contents: `
                    export const useWalletStore = () => globalThis.__fundWalletTest.store;
                ` };
                if (path === 'wallet-service') return { loader: 'js', contents: `
                    export const getFundingMethods = async () => [
                        {
                            code: 'paystack-primary',
                            name: 'Paystack',
                            supportedChannels: ['card', 'ussd'],
                            isDefault: true,
                            environment: 'test',
                            virtualAccounts: { supported: true, type: 'dedicated', providerSlugs: ['wema-bank', 'titan-paystack', 'test-bank'] }
                        },
                        {
                            code: 'paystack-backup',
                            name: 'Paystack Backup',
                            supportedChannels: ['card'],
                            isDefault: false,
                            environment: 'test',
                            virtualAccounts: { supported: true, type: 'dedicated', providerSlugs: ['test-bank'] }
                        },
                        {
                            code: 'monnify',
                            name: 'Monnify',
                            supportedChannels: ['bank_transfer'],
                            environment: 'test',
                            virtualAccounts: { supported: true, type: 'reserved', providerSlugs: [] }
                        }
                    ];
                    export const initWalletFunding = async () => ({ authorization_url: 'https://checkout.example', reference: 'ref' });
                ` };
                return { loader: 'js', contents: `
                    export const toast = {
                        success: (...args) => globalThis.__fundWalletTest.toasts.push(['success', ...args]),
                        error: (...args) => globalThis.__fundWalletTest.toasts.push(['error', ...args])
                    };
                ` };
            });
        },
    };

    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import { MemoryRouter } from 'react-router-dom';
                import UserFundWalletPage from './src/pages/user/UserFundWalletPage.tsx';

                let appRoot;
                const container = () => document.getElementById('root');

                export async function mount(accounts) {
                    globalThis.__fundWalletTest.store = {
                        virtualAccounts: accounts,
                        currency: '₦',
                        fetchVirtualAccount: async () => {},
                        provisioningProvider: null,
                        provisionAccount: async (...args) => {
                            globalThis.__fundWalletTest.provisionCalls.push(args);
                            return { status: 'pending' };
                        }
                    };
                    appRoot = createRoot(container());
                    await act(async () => {
                        appRoot.render(<MemoryRouter><UserFundWalletPage /></MemoryRouter>);
                    });
                    const bankButton = [...container().querySelectorAll('button')]
                        .find((button) => button.textContent.includes('Bank Transfer'));
                    await act(async () => { bankButton.click(); });
                }

                export async function clickCopy(provider) {
                    const button = container().querySelector('[aria-label="Copy ' + provider + ' account number"]');
                    if (!button) throw new Error('Copy control not found for ' + provider);
                    await act(async () => { button.click(); });
                }

                export const text = () => container().textContent;
                export const accountProviders = () => [...container().querySelectorAll('[data-virtual-account-provider]')]
                    .map((node) => node.getAttribute('data-virtual-account-provider'));
                export const hasGenerateButton = () => [...container().querySelectorAll('button')]
                    .some((button) => button.textContent.includes('Generate Account'));
                export const provisionProviders = () => [...container().querySelectorAll('[data-provision-provider]')]
                    .map((button) => button.getAttribute('data-provision-provider'));
                export async function clickProvision(provider) {
                    const button = container().querySelector('[data-provision-provider="' + provider + '"]');
                    if (!button) throw new Error('Provision control not found for ' + provider);
                    await act(async () => { button.click(); });
                }
                export async function unmount() {
                    if (appRoot) await act(async () => { appRoot.unmount(); });
                    appRoot = null;
                }
            `,
            resolveDir: root,
            sourcefile: 'fund-wallet-virtual-accounts-entry.tsx',
            loader: 'tsx',
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        plugins: [mocks],
        define: { 'process.env.NODE_ENV': '"test"' },
    });

    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

before(async () => {
    dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
        url: 'https://localhost/app/wallet/fund',
        pretendToBeVisual: true,
    });
    const globals = {
        window: dom.window,
        self: dom.window,
        document: dom.window.document,
        navigator: dom.window.navigator,
        Node: dom.window.Node,
        HTMLElement: dom.window.HTMLElement,
        Event: dom.window.Event,
        MouseEvent: dom.window.MouseEvent,
        MutationObserver: dom.window.MutationObserver,
        MessageChannel: TestMessageChannel,
        getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
        requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
        cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
        IS_REACT_ACT_ENVIRONMENT: true,
    };
    for (const [key, value] of Object.entries(globals)) {
        Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    Object.defineProperty(dom.window, 'isSecureContext', { configurable: true, value: true });
    Object.defineProperty(dom.window.navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (value) => copiedValues.push(value) },
    });
    harness = await loadHarness();
});

beforeEach(() => {
    copiedValues = [];
    globalThis.__fundWalletTest = { store: {}, toasts: [], provisionCalls: [] };
    document.body.innerHTML = '<div id="root"></div>';
});

afterEach(async () => {
    await harness.unmount();
});

after(() => {
    dom.window.close();
    delete globalThis.__fundWalletTest;
});

test('shows one active Paystack account with provider and bank details', async () => {
    await harness.mount([activeAccount('paystack', '0123456789')]);

    assert.deepEqual(harness.accountProviders(), ['paystack']);
    assert.match(harness.text(), /Paystack/);
    assert.match(harness.text(), /Paystack Test Bank/);
    assert.match(harness.text(), /ZANTARA \/ TEST USER/);
    assert.match(harness.text(), /0123456789/);
    assert.match(harness.text(), /Debit Card/);
    assert.match(harness.text(), /USSD/);
});

test('shows one active Monnify account', async () => {
    await harness.mount([activeAccount('monnify', '1000000001')]);

    assert.deepEqual(harness.accountProviders(), ['monnify']);
    assert.match(harness.text(), /Monnify/);
    assert.match(harness.text(), /Monnify Test Bank/);
    assert.match(harness.text(), /1000000001/);
});

test('shows Paystack and Monnify accounts together without choosing index zero', async () => {
    await harness.mount([
        activeAccount('monnify', '1000000001'),
        activeAccount('paystack', '2000000002'),
    ]);

    assert.deepEqual(harness.accountProviders(), ['monnify', 'paystack']);
    assert.match(harness.text(), /1000000001/);
    assert.match(harness.text(), /2000000002/);
});

test('shows every usable account when one provider has multiple accounts', async () => {
    await harness.mount([
        activeAccount('paystack', '2000000001', { bankName: 'Wema Bank' }),
        activeAccount('paystack', '2000000002', { bankName: 'Titan Trust Bank' }),
        activeAccount('monnify', '1000000001'),
    ]);

    assert.deepEqual(harness.accountProviders(), ['paystack', 'paystack', 'monnify']);
    assert.match(harness.text(), /Wema Bank/);
    assert.match(harness.text(), /Titan Trust Bank/);
    assert.match(harness.text(), /Monnify Test Bank/);
});

test('presents pending Paystack provisioning as status, not an active account', async () => {
    await harness.mount([{
        provider: 'paystack',
        provisioningStatus: 'pending',
        active: false,
        assigned: false,
        accountNumber: 'SHOULD_NOT_RENDER',
    }]);

    assert.deepEqual(harness.accountProviders(), []);
    assert.match(harness.text(), /Paystack account setup in progress/);
    assert.match(harness.text(), /account details here when they are ready/);
    assert.doesNotMatch(harness.text(), /SHOULD_NOT_RENDER/);
    assert.equal(harness.hasGenerateButton(), false);
});

test('presents failed provisioning as unavailable without leaking placeholder details', async () => {
    await harness.mount([{
        provider: 'paystack',
        provisioningStatus: 'failed',
        active: false,
        assigned: false,
        bankName: 'SHOULD_NOT_RENDER',
    }]);

    assert.deepEqual(harness.accountProviders(), []);
    assert.match(harness.text(), /Paystack account unavailable/);
    assert.doesNotMatch(harness.text(), /SHOULD_NOT_RENDER/);
    assert.equal(harness.hasGenerateButton(), false);
});

test('shows explicit enabled-provider actions in the empty state', async () => {
    await harness.mount([]);

    assert.deepEqual(harness.accountProviders(), []);
    assert.match(harness.text(), /No bank transfer account available yet/);
    assert.match(harness.text(), /Choose an enabled provider below/);
    assert.deepEqual(harness.provisionProviders(), ['paystack-primary', 'monnify']);
    assert.equal(harness.hasGenerateButton(), false);
});

test('submits explicit Paystack consent with an environment-safe preferred bank', async () => {
    await harness.mount([]);

    await harness.clickProvision('paystack-primary');

    assert.deepEqual(globalThis.__fundWalletTest.provisionCalls, [
        ['paystack-primary', { consent: true, preferredBank: 'test-bank' }],
    ]);
    assert.deepEqual(globalThis.__fundWalletTest.toasts, [
        ['success', 'Paystack account request submitted'],
    ]);
});

test('submits Monnify through the provider-neutral provisioning action', async () => {
    await harness.mount([]);

    await harness.clickProvision('monnify');

    assert.deepEqual(globalThis.__fundWalletTest.provisionCalls, [
        ['monnify', {}],
    ]);
});

test('filters preferred-bank slugs by gateway environment', () => {
    const slugs = ['wema-bank', 'titan-paystack', 'test-bank'];
    assert.deepEqual(getEnvironmentBankSlugs('test', slugs), ['test-bank']);
    assert.deepEqual(getEnvironmentBankSlugs('live', slugs), ['wema-bank', 'titan-paystack']);
    assert.deepEqual(getEnvironmentBankSlugs('test', ['wema-bank']), []);
    assert.deepEqual(getEnvironmentBankSlugs('staging', slugs), []);
});

test('derives adapter identity from capability type when a gateway code is aliased', () => {
    assert.equal(getFundingMethodAccountProvider({ code: 'paystack-primary', virtualAccounts: { type: 'dedicated' } }), 'paystack');
    assert.equal(getFundingMethodAccountProvider({ code: 'monnify-backup', virtualAccounts: { type: 'reserved' } }), 'monnify');
});

test('merges accepted pending provisioning into existing accounts before profile refresh', () => {
    const monnify = activeAccount('monnify', '1000000001');
    const pending = { provider: 'paystack', gatewayId: 'gateway-a', provisioningKey: 'key-a', provisioningStatus: 'pending' };
    assert.deepEqual(mergeVirtualAccounts([monnify], [pending]), [monnify, pending]);
});

test('web provisioning has no legacy generator or singular wallet compatibility state', () => {
    const read = (relative) => readFileSync(join(root, relative), 'utf8');
    const service = read('src/services/wallet/walletService.ts');
    const store = read('src/store/wallet/walletStore.js');
    const dashboard = read('src/pages/user/UserDashboardPage.tsx');

    assert.match(service, /\/wallet\/virtual-accounts\/\$\{encodeURIComponent\(normalizedProvider\)\}/);
    assert.doesNotMatch(service, /monnify\/generate-virtual-accounts|api\.paystack\.co/i);
    assert.doesNotMatch(store, /\bvirtualAccount\s*:/);
    assert.doesNotMatch(store, /generateAccounts|generateVirtualAccounts/);
    assert.match(store, /virtualAccountRefreshPromise/);
    assert.match(store, /virtualAccountRefreshGeneration/);
    assert.doesNotMatch(dashboard, /Silently generating|generateAccounts/);
});

test('copies the selected provider account number through the shared clipboard helper', async () => {
    await harness.mount([
        activeAccount('monnify', '1000000001'),
        activeAccount('paystack', '2000000002'),
    ]);

    await harness.clickCopy('Paystack');

    assert.deepEqual(copiedValues, ['2000000002']);
    assert.deepEqual(globalThis.__fundWalletTest.toasts, [
        ['success', 'Account number copied to clipboard'],
    ]);
});
