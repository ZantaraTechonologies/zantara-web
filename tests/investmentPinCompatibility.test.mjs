import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

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

function installDom(url = 'http://localhost/app/investments') {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
        url,
        pretendToBeVisual: true,
    });
    const globals = {
        window: dom.window,
        self: dom.window,
        document: dom.window.document,
        navigator: dom.window.navigator,
        localStorage: dom.window.localStorage,
        sessionStorage: dom.window.sessionStorage,
        Node: dom.window.Node,
        HTMLElement: dom.window.HTMLElement,
        HTMLInputElement: dom.window.HTMLInputElement,
        Event: dom.window.Event,
        MouseEvent: dom.window.MouseEvent,
        MutationObserver: dom.window.MutationObserver,
        MessageChannel: TestMessageChannel,
        getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
        requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
        cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
        IS_REACT_ACT_ENVIRONMENT: true,
    };
    const previous = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const [key, value] of Object.entries(globals)) {
        Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    return {
        dom,
        restore() {
            dom.window.close();
            for (const [key, descriptor] of previous) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else delete globalThis[key];
            }
        },
    };
}

async function loadServiceHarness() {
    const result = await build({
        stdin: {
            contents: `
                import {
                    buyShares,
                    requestShareExit,
                    reinvestDividends,
                    redeemToMainWallet,
                    requestDividendWithdrawal
                } from './src/services/investment/investmentService.ts';
                import { paymentService } from './src/services/payment/paymentService.ts';

                export const buy = (qty, pin) => buyShares({ qty, pin });
                export const exit = (qty, pin) => requestShareExit({ qty, pin });
                export const reinvest = (qty, pin) => reinvestDividends({ qty, pin });
                export const redeem = (amount, source, pin) => redeemToMainWallet({ amount, source, pin });
                export const withdraw = (pin) => requestDividendWithdrawal({
                    amount: 750,
                    source: 'referral',
                    bankName: 'Test Bank',
                    accountNumber: '0123456789',
                    accountName: 'Test User',
                    pin
                });
                export const externalBuy = () => paymentService.initializePayment(
                    2000,
                    'investment_buy',
                    { qty: 2 },
                    false
                );
            `,
            resolveDir: root,
            sourcefile: 'batch4b-service-entry.ts',
            loader: 'ts',
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        plugins: [{
            name: 'batch4b-api-mock',
            setup(builder) {
                builder.onResolve({ filter: /apiClient(?:\.js)?$/ }, () => ({ path: 'api', namespace: 'batch4b' }));
                builder.onLoad({ filter: /.*/, namespace: 'batch4b' }, () => ({
                    loader: 'js',
                    contents: `
                        const api = {
                            get: (...args) => globalThis.__batch4bApi('get', ...args),
                            post: (...args) => globalThis.__batch4bApi('post', ...args)
                        };
                        export default api;
                    `,
                }));
            },
        }],
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

const uiMocks = {
    name: 'batch4b-ui-mocks',
    setup(builder) {
        builder.onResolve({ filter: /hooks[\\/]useInvestment(?:\.[jt]s)?$/ }, () => ({ path: 'investment-hooks', namespace: 'batch4b-ui' }));
        builder.onResolve({ filter: /store[\\/]wallet[\\/]walletStore(?:\.[jt]s)?$/ }, () => ({ path: 'wallet-store', namespace: 'batch4b-ui' }));
        builder.onResolve({ filter: /services[\\/]payment[\\/]paymentService(?:\.[jt]s)?$/ }, () => ({ path: 'payment-service', namespace: 'batch4b-ui' }));
        builder.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'batch4b-ui' }));
        builder.onResolve({ filter: /^react-hot-toast$/ }, () => ({ path: 'toast', namespace: 'batch4b-ui' }));
        builder.onLoad({ filter: /.*/, namespace: 'batch4b-ui' }, ({ path }) => {
            if (path === 'investment-hooks') return { loader: 'js', contents: `
                const summary = {
                    sharesOwned: 5,
                    availableShares: 5,
                    dividendBalance: 5000,
                    referralBalance: 3000,
                    totalDividendsEarned: 7000,
                    lockExpiresAt: null,
                    canExit: true,
                    settings: {
                        sharePrice: 1000,
                        minSharesPerPurchase: 1,
                        maxSharesPerUser: 20,
                        investorAllocationPercent: 20,
                        dividendWithdrawalFee: 2,
                        dividendRedeemFee: 1
                    }
                };
                const action = (name) => ({
                    mutate: (payload, options) => globalThis.__batch4bUi.mutate(name, payload, options),
                    isPending: false
                });
                export const useInvestmentSummary = () => ({ data: summary, isLoading: false });
                export const useInvestmentHistory = () => ({ data: { data: [] }, isLoading: false });
                export const useBuyShares = () => action('buy');
                export const useReinvestDividends = () => action('reinvest');
                export const useRedeemToMainWallet = () => action('redeem');
                export const useRequestShareExit = () => action('exit');
                export const useRequestDividendWithdrawal = () => action('withdraw');
            ` };
            if (path === 'wallet-store') return { loader: 'js', contents: `
                export const useWalletStore = () => ({
                    currency: 'NGN ',
                    linkedAccounts: [{
                        _id: 'bank-1',
                        bankName: 'Test Bank',
                        accountNumber: '0123456789',
                        accountName: 'Test User'
                    }],
                    fetchLinkedAccounts() {}
                });
            ` };
            if (path === 'payment-service') return { loader: 'js', contents: `
                export const paymentService = {
                    initializePayment: (...args) => globalThis.__batch4bUi.initializePayment(...args)
                };
            ` };
            if (path === 'router') return { loader: 'jsx', resolveDir: root, contents: `
                import React from 'react';
                export const Link = ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>;
                export const useNavigate = () => () => {};
            ` };
            return { loader: 'js', contents: `
                const toast = {
                    success: (message) => globalThis.__batch4bUi.toasts.push(message),
                    error: (message) => globalThis.__batch4bUi.toasts.push(message)
                };
                export { toast };
                export default toast;
            ` };
        });
    },
};

async function loadUiHarness() {
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import InvestmentPage from './src/pages/user/InvestmentPage.tsx';
                import InvestmentWithdrawPage from './src/pages/user/InvestmentWithdrawPage.tsx';

                let root;
                const container = () => document.getElementById('root');
                const setter = () => Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

                export async function mount(page = 'investment') {
                    root = createRoot(container());
                    await act(async () => {
                        root.render(page === 'withdraw' ? <InvestmentWithdrawPage /> : <InvestmentPage />);
                    });
                }
                export async function input(selector, value, index = 0) {
                    const element = [...container().querySelectorAll(selector)][index];
                    if (!element) throw new Error('Input not found: ' + selector + '[' + index + ']');
                    await act(async () => {
                        setter().call(element, value);
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                }
                export async function clickText(text, index = 0) {
                    const matches = [...container().querySelectorAll('button')].filter((button) => button.textContent.includes(text));
                    const button = matches[index];
                    if (!button) throw new Error('Button not found: ' + text + '[' + index + ']');
                    await act(async () => { button.click(); });
                }
                export async function clickInputAction(selector, index = 0) {
                    const element = [...container().querySelectorAll(selector)][index];
                    const button = element?.parentElement?.parentElement?.querySelector('button');
                    if (!button) throw new Error('Action button not found for: ' + selector + '[' + index + ']');
                    await act(async () => { button.click(); });
                }
                export async function enterPin(pin) {
                    const inputs = [...container().querySelectorAll('input[type="password"]')];
                    if (inputs.length !== 4) throw new Error('Expected four PIN inputs');
                    for (const [index, element] of inputs.entries()) {
                        await act(async () => {
                            setter().call(element, pin[index]);
                            element.dispatchEvent(new Event('input', { bubbles: true }));
                        });
                    }
                }
                export const pinValues = () => [...container().querySelectorAll('input[type="password"]')].map((input) => input.value);
                export const hasPinModal = () => container().querySelectorAll('input[type="password"]').length === 4;
                export async function settle() {
                    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
                }
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                    root = null;
                }
            `,
            resolveDir: root,
            sourcefile: 'batch4b-ui-entry.tsx',
            loader: 'tsx',
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        plugins: [uiMocks],
        define: { 'process.env.NODE_ENV': '"test"' },
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

let serviceHarness;
let uiHarness;
let environment;
let apiCalls;
let uiCalls;
let paymentCalls;

beforeEach(async () => {
    environment = installDom();
    apiCalls = [];
    uiCalls = [];
    paymentCalls = [];
    globalThis.__batch4bApi = async (method, url, data) => {
        apiCalls.push({ method, url, data });
        return { data: {} };
    };
    globalThis.__batch4bUi = {
        outcome: 'pending',
        toasts: [],
        mutate(name, payload, options) {
            uiCalls.push({ name, payload });
            if (this.outcome === 'success') options?.onSuccess?.({ data: { data: { refId: 'REF-1' } } });
            if (this.outcome === 'error') options?.onError?.({ response: { data: { message: 'Invalid transaction PIN' } } });
        },
        async initializePayment(...args) {
            paymentCalls.push(args);
            return {};
        },
    };
    serviceHarness ||= await loadServiceHarness();
    uiHarness ||= await loadUiHarness();
});

afterEach(async () => {
    try {
        await uiHarness?.unmount();
    } finally {
        delete globalThis.__batch4bApi;
        delete globalThis.__batch4bUi;
        environment.restore();
    }
});

test('internal investment services send required PIN request bodies', async () => {
    await serviceHarness.buy(2, '1234');
    await serviceHarness.exit(1, '2345');
    await serviceHarness.reinvest(3, '3456');
    await serviceHarness.redeem(500, 'dividend', '4567');
    await serviceHarness.redeem(250, 'referral', '5678');

    assert.deepEqual(apiCalls, [
        { method: 'post', url: '/investment/buy', data: { qty: 2, pin: '1234' } },
        { method: 'post', url: '/investment/exit', data: { qty: 1, pin: '2345' } },
        { method: 'post', url: '/investment/reinvest', data: { qty: 3, pin: '3456' } },
        { method: 'post', url: '/investment/redeem', data: { amount: 500, source: 'dividend', pin: '4567' } },
        { method: 'post', url: '/investment/redeem', data: { amount: 250, source: 'referral', pin: '5678' } },
    ]);
});

test('wallet buy forwards entered PIN and cancellation sends no request', async () => {
    await uiHarness.mount();
    await uiHarness.input('input[placeholder="Enter quantity of shares"]', '2');
    await uiHarness.clickText('Purchase Shares Now');
    await uiHarness.enterPin('1234');
    await uiHarness.clickText('Cancel');
    assert.deepEqual(uiCalls, []);

    await uiHarness.clickText('Purchase Shares Now');
    await uiHarness.enterPin('2345');
    await uiHarness.clickText('Authorize Transaction');
    assert.deepEqual(uiCalls, [{ name: 'buy', payload: { qty: 2, pin: '2345' } }]);
});

test('exit forwards entered PIN and cancellation sends no request', async () => {
    await uiHarness.mount();
    await uiHarness.input('input[placeholder="Qty"]', '2', 1);
    await uiHarness.clickInputAction('input[placeholder="Qty"]', 1);
    await uiHarness.enterPin('1234');
    await uiHarness.clickText('Cancel');
    assert.deepEqual(uiCalls, []);

    await uiHarness.clickInputAction('input[placeholder="Qty"]', 1);
    await uiHarness.enterPin('2345');
    await uiHarness.clickText('Authorize Transaction');
    assert.deepEqual(uiCalls, [{ name: 'exit', payload: { qty: 2, pin: '2345' } }]);
});

test('reinvest forwards entered PIN and cancellation sends no request', async () => {
    await uiHarness.mount();
    await uiHarness.input('input[placeholder="Qty"]', '2', 0);
    await uiHarness.clickInputAction('input[placeholder="Qty"]', 0);
    await uiHarness.enterPin('1234');
    await uiHarness.clickText('Cancel');
    assert.deepEqual(uiCalls, []);

    await uiHarness.clickInputAction('input[placeholder="Qty"]', 0);
    await uiHarness.enterPin('2345');
    await uiHarness.clickText('Authorize Transaction');
    assert.deepEqual(uiCalls, [{ name: 'reinvest', payload: { qty: 2, pin: '2345' } }]);
});

test('redeem requires PIN for dividend and referral sources', async () => {
    await uiHarness.mount();
    await uiHarness.input('input[placeholder="Enter amount from dividends"]', '500');
    await uiHarness.clickText('Move Earnings');
    await uiHarness.enterPin('1234');
    await uiHarness.clickText('Authorize Transaction');

    await uiHarness.clickText('Cancel');
    await uiHarness.clickText('Referrals');
    await uiHarness.input('input[placeholder="Enter amount from referrals"]', '250');
    await uiHarness.clickText('Move Referral');
    await uiHarness.enterPin('2345');
    await uiHarness.clickText('Authorize Transaction');

    assert.deepEqual(uiCalls, [
        { name: 'redeem', payload: { amount: 500, source: 'dividend', pin: '1234' } },
        { name: 'redeem', payload: { amount: 250, source: 'referral', pin: '2345' } },
    ]);
});

test('withdrawal runtime includes bank fields, source, and PIN', async () => {
    await serviceHarness.withdraw('6789');
    assert.deepEqual(apiCalls, [{
        method: 'post',
        url: '/investment/withdraw',
        data: {
            amount: 750,
            source: 'referral',
            bankName: 'Test Bank',
            accountNumber: '0123456789',
            accountName: 'Test User',
            pin: '6789',
        },
    }]);

    await uiHarness.mount('withdraw');
    await uiHarness.input('input[placeholder="0.00"]', '750');
    await uiHarness.clickText('Test Bank');
    await uiHarness.clickText('Confirm dividend Withdrawal');
    await uiHarness.enterPin('6789');
    await uiHarness.clickText('Authorize Transaction');
    assert.deepEqual(uiCalls, [{
        name: 'withdraw',
        payload: {
            amount: 750,
            source: 'dividend',
            bankName: 'Test Bank',
            accountNumber: '0123456789',
            accountName: 'Test User',
            pin: '6789',
        },
    }]);
});

test('investment request types require PIN at compile time', () => {
    execFileSync(process.execPath, [
        join(root, 'node_modules', 'typescript', 'bin', 'tsc'),
        '--noEmit',
        '--skipLibCheck',
        '--target', 'ESNext',
        '--module', 'ESNext',
        '--moduleResolution', 'Node',
        '--lib', 'DOM,ESNext',
        join(root, 'tests', 'types', 'investmentPinContracts.ts'),
    ], { cwd: root, stdio: 'pipe' });
});

test('PIN inputs clear after success and reopening starts empty', async () => {
    globalThis.__batch4bUi.outcome = 'success';
    await uiHarness.mount();
    await uiHarness.input('input[placeholder="Enter quantity of shares"]', '2');
    await uiHarness.clickText('Purchase Shares Now');
    await uiHarness.enterPin('1234');
    await uiHarness.clickText('Authorize Transaction');
    assert.equal(uiHarness.hasPinModal(), false);

    await uiHarness.input('input[placeholder="Enter quantity of shares"]', '2');
    await uiHarness.clickText('Purchase Shares Now');
    assert.deepEqual(uiHarness.pinValues(), ['', '', '', '']);
});

test('PIN inputs clear after failure while preserving the backend PIN error', async () => {
    globalThis.__batch4bUi.outcome = 'error';
    await uiHarness.mount();
    await uiHarness.input('input[placeholder="Enter quantity of shares"]', '2');
    await uiHarness.clickText('Purchase Shares Now');
    await uiHarness.enterPin('1234');
    await uiHarness.clickText('Authorize Transaction');

    assert.deepEqual(uiHarness.pinValues(), ['', '', '', '']);
    assert.ok(globalThis.__batch4bUi.toasts.includes('Invalid transaction PIN'));
    assert.ok(globalThis.__batch4bUi.toasts.every((message) => !message.includes('1234')));
});

test('PIN inputs clear after modal cancellation and are not reused', async () => {
    await uiHarness.mount();
    await uiHarness.input('input[placeholder="Enter quantity of shares"]', '2');
    await uiHarness.clickText('Purchase Shares Now');
    await uiHarness.enterPin('1234');
    await uiHarness.clickText('Cancel');
    assert.equal(uiHarness.hasPinModal(), false);

    await uiHarness.clickText('Purchase Shares Now');
    assert.deepEqual(uiHarness.pinValues(), ['', '', '', '']);
    assert.deepEqual(uiCalls, []);
});

test('investment PIN is not written to browser storage or URL parameters', async () => {
    const writes = [];
    const originalLocal = window.localStorage.setItem.bind(window.localStorage);
    const originalSession = window.sessionStorage.setItem.bind(window.sessionStorage);
    window.localStorage.setItem = (...args) => { writes.push(['local', ...args]); return originalLocal(...args); };
    window.sessionStorage.setItem = (...args) => { writes.push(['session', ...args]); return originalSession(...args); };

    await uiHarness.mount();
    await uiHarness.input('input[placeholder="Enter quantity of shares"]', '2');
    await uiHarness.clickText('Purchase Shares Now');
    await uiHarness.enterPin('1234');
    await uiHarness.clickText('Authorize Transaction');

    assert.deepEqual(writes, []);
    assert.equal(window.location.href.includes('1234'), false);
    assert.equal(window.location.search, '');
});

test('external Paystack investment initialization remains PIN-free and separate', async () => {
    await serviceHarness.externalBuy();
    assert.deepEqual(apiCalls, [{
        method: 'post',
        url: '/paystack/initialize',
        data: {
            amount: 2000,
            channels: ['card', 'bank_transfer', 'ussd'],
            metadata: {
                qty: 2,
                type: 'investment_buy',
                callback_url: 'http://localhost/paystack/return',
            },
            isDirectTransfer: false,
        },
    }]);
    assert.equal(JSON.stringify(apiCalls).includes('pin'), false);

    apiCalls.length = 0;
    await uiHarness.mount();
    await uiHarness.input('input[placeholder="Enter quantity of shares"]', '2');
    await uiHarness.clickText('Card');
    await uiHarness.clickText('Purchase Shares Now');
    await uiHarness.settle();

    assert.deepEqual(paymentCalls, [[2000, 'investment_buy', { qty: 2 }, false]]);
    assert.deepEqual(uiCalls, []);
    assert.equal(uiHarness.hasPinModal(), false);
    assert.equal(JSON.stringify(paymentCalls).includes('pin'), false);
});
