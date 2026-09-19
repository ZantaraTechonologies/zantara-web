import { test } from 'node:test';
import assert from 'node:assert/strict';
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

function installDom() {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
        url: 'http://localhost/app/wallet/withdraw',
        pretendToBeVisual: true,
    });
    const globals = {
        window: dom.window,
        self: dom.window,
        document: dom.window.document,
        navigator: dom.window.navigator,
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
        restore() {
            dom.window.close();
            for (const [key, descriptor] of previous) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else delete globalThis[key];
            }
        },
    };
}

async function loadHarness() {
    const mocks = {
        name: 'wallet-withdrawal-mocks',
        setup(builder) {
            builder.onResolve({ filter: /store[\\/]wallet[\\/]walletStore(?:\.[jt]s)?$/ }, () => ({ path: 'wallet-store', namespace: 'withdrawal' }));
            builder.onResolve({ filter: /services[\\/]wallet[\\/]walletService(?:\.[jt]s)?$/ }, () => ({ path: 'wallet-service', namespace: 'withdrawal' }));
            builder.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'withdrawal' }));
            builder.onLoad({ filter: /.*/, namespace: 'withdrawal' }, ({ path }) => {
                if (path === 'wallet-store') return { loader: 'js', contents: `
                    export const useWalletStore = () => ({
                        balance: 5000,
                        currency: 'NGN ',
                        linkedAccounts: [{
                            _id: 'bank-1',
                            bankName: 'Test Bank',
                            accountNumber: '0123456789',
                            accountName: 'Test User'
                        }],
                        loading: false,
                        fetchBalance() {},
                        fetchLinkedAccounts() {}
                    });
                ` };
                if (path === 'wallet-service') return { loader: 'js', contents: `
                    export const requestWithdrawal = (...args) => globalThis.__walletWithdrawal(...args);
                ` };
                return { loader: 'js', contents: `
                    export const useNavigate = () => () => {};
                ` };
            });
        },
    };
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import UserWithdrawPage from './src/pages/user/UserWithdrawPage.tsx';

                let root;
                const container = () => document.getElementById('root');
                const setter = () => Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

                export async function mount() {
                    root = createRoot(container());
                    await act(async () => { root.render(<UserWithdrawPage />); });
                }
                export async function input(selector, value, index = 0) {
                    const element = [...container().querySelectorAll(selector)][index];
                    if (!element) throw new Error('Input not found: ' + selector + '[' + index + ']');
                    await act(async () => {
                        setter().call(element, value);
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                }
                export async function clickText(text) {
                    const button = [...container().querySelectorAll('button')].find((candidate) => candidate.textContent.includes(text));
                    if (!button) throw new Error('Button not found: ' + text);
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
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                    root = null;
                }
            `,
            resolveDir: root,
            sourcefile: 'wallet-withdrawal-entry.tsx',
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

test('failed wallet withdrawal preserves safe UI error without logging request secrets', async () => {
    const environment = installDom();
    const requests = [];
    const alerts = [];
    const consoleErrors = [];
    const secretPin = '4931';
    const secretToken = 'secret-bearer-token';
    const originalConsoleError = console.error;
    const previousAlert = Object.getOwnPropertyDescriptor(globalThis, 'alert');
    let harness;

    globalThis.__walletWithdrawal = async (payload) => {
        requests.push(payload);
        throw {
            message: 'Request failed with status code 400',
            response: { data: { message: 'Invalid transaction PIN' } },
            config: {
                data: JSON.stringify(payload),
                headers: { Authorization: `Bearer ${secretToken}` },
            },
        };
    };
    console.error = (...args) => consoleErrors.push(args);
    Object.defineProperty(globalThis, 'alert', {
        configurable: true,
        writable: true,
        value: (message) => alerts.push(message),
    });

    try {
        harness = await loadHarness();
        await harness.mount();
        await harness.input('input[placeholder="0.00"]', '750');
        await harness.clickText('Test Bank');
        await harness.clickText('Initiate Settlement');
        await harness.enterPin(secretPin);
        await harness.clickText('Authorize & Send');

        assert.deepEqual(requests, [{ amount: 750, accountId: 'bank-1', pin: secretPin }]);
        assert.deepEqual(alerts, ['Invalid transaction PIN']);
        assert.deepEqual(consoleErrors, []);
        assert.deepEqual(harness.pinValues(), ['', '', '', '']);

        await harness.enterPin(secretPin);
        await harness.clickText('Cancel Transaction');
        await harness.clickText('Initiate Settlement');
        assert.deepEqual(harness.pinValues(), ['', '', '', '']);

        const logged = JSON.stringify(consoleErrors);
        assert.equal(logged.includes(secretPin), false);
        assert.equal(logged.includes(secretToken), false);
    } finally {
        try {
            if (harness) await harness.unmount();
        } finally {
            delete globalThis.__walletWithdrawal;
            console.error = originalConsoleError;
            if (previousAlert) Object.defineProperty(globalThis, 'alert', previousAlert);
            else delete globalThis.alert;
            environment.restore();
        }
    }
});
