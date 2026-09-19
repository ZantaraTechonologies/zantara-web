import { test, before, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASSWORD_SENTINEL = 'TEST_PASSWORD_SENTINEL';
const TOKEN_SENTINEL = 'TEST_BEARER_TOKEN_SENTINEL';

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
        url: 'http://localhost/login',
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
        restore() {
            dom.window.close();
            for (const [key, descriptor] of previous) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else delete globalThis[key];
            }
        },
    };
}

function axiosLikeError(message, body, token = TOKEN_SENTINEL) {
    return {
        message: 'Request failed',
        response: { status: 400, data: { message } },
        config: {
            data: JSON.stringify(body),
            headers: { Authorization: `Bearer ${token}` },
            __sessionContext: { token },
        },
    };
}

function captureConsole() {
    const calls = [];
    const methods = ['log', 'error', 'warn', 'info', 'debug'];
    const originals = new Map(methods.map((method) => [method, console[method]]));
    for (const method of methods) console[method] = (...args) => calls.push([method, ...args]);
    return {
        calls,
        restore() {
            for (const [method, original] of originals) console[method] = original;
        },
    };
}

function assertSecretsAbsent(calls, ...secrets) {
    const output = JSON.stringify(calls);
    for (const secret of secrets) assert.equal(output.includes(secret), false);
}

async function loadAuthUiHarness() {
    const mocks = {
        name: 'sensitive-auth-ui-mocks',
        setup(builder) {
            builder.onResolve({ filter: /store[\\/]auth[\\/]authStore(?:\.[jt]s)?$/ }, () => ({ path: 'auth-store', namespace: 'sensitive-auth-ui' }));
            builder.onResolve({ filter: /services[\\/]api[\\/]apiClient(?:\.js)?$/ }, () => ({ path: 'api', namespace: 'sensitive-auth-ui' }));
            builder.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'sensitive-auth-ui' }));
            builder.onResolve({ filter: /^react-hot-toast$/ }, () => ({ path: 'toast', namespace: 'sensitive-auth-ui' }));
            builder.onLoad({ filter: /.*/, namespace: 'sensitive-auth-ui' }, ({ path }) => {
                if (path === 'auth-store') return { loader: 'js', contents: `
                    export const useAuthStore = () => ({
                        login: (...args) => globalThis.__sensitiveAuth.login(...args),
                        register: (...args) => globalThis.__sensitiveAuth.register(...args)
                    });
                ` };
                if (path === 'api') return { loader: 'js', contents: `
                    const api = { get: (...args) => globalThis.__sensitiveAuth.apiGet(...args) };
                    export default api;
                ` };
                if (path === 'router') return { loader: 'jsx', resolveDir: root, contents: `
                    import React from 'react';
                    export const Link = ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>;
                    export const useNavigate = () => () => {};
                    export const useLocation = () => ({ state: null });
                    export const useSearchParams = () => [new URLSearchParams()];
                ` };
                return { loader: 'js', contents: `
                    const toast = {
                        success: (message) => globalThis.__sensitiveAuth.toasts.push(message),
                        error: (message) => globalThis.__sensitiveAuth.toasts.push(message)
                    };
                    export default toast;
                ` };
            });
        },
    };
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import UserLoginPage from './src/pages/auth/UserLoginPage.tsx';
                import UserRegisterPage from './src/pages/auth/UserRegisterPage.tsx';

                let root;
                const container = () => document.getElementById('root');
                const valueSetter = () => Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

                export async function mount(page) {
                    root = createRoot(container());
                    await act(async () => {
                        root.render(page === 'register' ? <UserRegisterPage /> : <UserLoginPage />);
                    });
                }
                export async function input(selector, value, index = 0) {
                    const element = [...container().querySelectorAll(selector)][index];
                    if (!element) throw new Error('Input not found: ' + selector + '[' + index + ']');
                    await act(async () => {
                        valueSetter().call(element, value);
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                }
                export async function click(selector) {
                    const element = container().querySelector(selector);
                    if (!element) throw new Error('Control not found: ' + selector);
                    await act(async () => { element.click(); });
                }
                export async function submit() {
                    const form = container().querySelector('form');
                    await act(async () => {
                        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                        await new Promise((resolve) => setTimeout(resolve, 0));
                    });
                }
                export const text = () => container().textContent;
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                    root = null;
                }
            `,
            resolveDir: root,
            sourcefile: 'sensitive-auth-ui-entry.tsx',
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

async function loadStoreHarness() {
    const mocks = {
        name: 'sensitive-store-mocks',
        setup(builder) {
            builder.onResolve({ filter: /services[\\/]auth[\\/]authService(?:\.[jt]s)?$/ }, () => ({ path: 'auth-service', namespace: 'sensitive-store' }));
            builder.onResolve({ filter: /services[\\/]wallet[\\/]walletService(?:\.[jt]s)?$/ }, () => ({ path: 'wallet-service', namespace: 'sensitive-store' }));
            builder.onResolve({ filter: /services[\\/]api[\\/]apiClient(?:\.js)?$/ }, () => ({ path: 'api', namespace: 'sensitive-store' }));
            builder.onLoad({ filter: /.*/, namespace: 'sensitive-store' }, ({ path }) => {
                if (path === 'auth-service') return { loader: 'js', contents: `
                    export const login = async () => ({});
                    export const register = async () => ({});
                    export const getMe = async () => ({});
                    export const logout = (...args) => globalThis.__sensitiveStore.logout(...args);
                ` };
                if (path === 'wallet-service') return { loader: 'js', contents: `
                    export const getWalletBalance = (...args) => globalThis.__sensitiveStore.wallet(...args);
                    export const getVirtualAccount = async () => null;
                    export const getLinkedAccounts = async () => [];
                    export const addLinkedAccount = async () => ({});
                    export const deleteLinkedAccount = async () => ({});
                    export const getMyWithdrawals = async () => [];
                    export const generateVirtualAccounts = async () => ({});
                ` };
                return { loader: 'js', contents: `
                    const api = { get: (...args) => globalThis.__sensitiveStore.apiGet(...args) };
                    export default api;
                ` };
            });
        },
    };
    const result = await build({
        stdin: {
            contents: `
                import { useAuthStore } from './src/store/auth/authStore.js';
                import { useWalletStore } from './src/store/wallet/walletStore.js';
                import { getTransactionById } from './src/services/transactions/transactionService.ts';

                export async function failLogout(token) {
                    useAuthStore.setState({ user: { id: 'user-a' }, token, isAuthenticated: true });
                    localStorage.setItem('token', token);
                    await useAuthStore.getState().logout();
                    return useAuthStore.getState();
                }
                export async function failWalletBalance() {
                    await useWalletStore.getState().fetchBalance();
                    return useWalletStore.getState();
                }
                export const failTransactionLookup = () => getTransactionById('transaction-a');
            `,
            resolveDir: root,
            sourcefile: 'sensitive-store-entry.ts',
            loader: 'ts',
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        plugins: [mocks],
        define: { 'import.meta.env.VITE_API_BASE_URL': '"http://localhost:8000"' },
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

let environment;
let authUiHarness;
let storeHarness;
let consoleCapture;

before(async () => {
    environment = installDom();
    authUiHarness = await loadAuthUiHarness();
    storeHarness = await loadStoreHarness();
});

beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    localStorage.clear();
    sessionStorage.clear();
    consoleCapture = captureConsole();
    globalThis.__sensitiveAuth = {
        toasts: [],
        apiGet: async () => ({ data: { data: [] } }),
        login: async () => {},
        register: async () => {},
    };
    globalThis.__sensitiveStore = {
        logout: async () => {},
        wallet: async () => ({ available: 0, balance: 0, frozen: 0 }),
        apiGet: async () => ({ data: null }),
    };
});

afterEach(async () => {
    try {
        await authUiHarness.unmount();
    } finally {
        consoleCapture.restore();
        delete globalThis.__sensitiveAuth;
        delete globalThis.__sensitiveStore;
    }
});

test('failed login preserves user error without logging password or token', async () => {
    let submitted;
    const backendMessage = 'Login request rejected';
    globalThis.__sensitiveAuth.login = async (credentials, rememberMe) => {
        submitted = { ...credentials, rememberMe };
        throw axiosLikeError(backendMessage, submitted);
    };

    await authUiHarness.mount('login');
    await authUiHarness.input('input[type="text"]', 'user@example.test');
    await authUiHarness.input('input[type="password"]', PASSWORD_SENTINEL);
    await authUiHarness.submit();

    assert.equal(submitted.password, PASSWORD_SENTINEL);
    assert.ok(authUiHarness.text().includes(backendMessage));
    assert.ok(globalThis.__sensitiveAuth.toasts.includes(backendMessage));
    assertSecretsAbsent(consoleCapture.calls, PASSWORD_SENTINEL, TOKEN_SENTINEL);
});

test('failed registration preserves user error without logging password or token', async () => {
    let submitted;
    const backendMessage = 'Registration request rejected';
    globalThis.__sensitiveAuth.register = async (payload) => {
        submitted = payload;
        throw axiosLikeError(backendMessage, payload);
    };

    await authUiHarness.mount('register');
    await authUiHarness.input('input[name="name"]', 'Test User');
    await authUiHarness.input('input[name="email"]', 'user@example.test');
    await authUiHarness.input('input[name="phone"]', '08000000000');
    await authUiHarness.input('input[name="password"]', PASSWORD_SENTINEL);
    await authUiHarness.click('input[name="agreeToTerms"]');
    await authUiHarness.submit();

    assert.equal(submitted.password, PASSWORD_SENTINEL);
    assert.ok(authUiHarness.text().includes(backendMessage));
    assert.ok(globalThis.__sensitiveAuth.toasts.includes(backendMessage));
    assertSecretsAbsent(consoleCapture.calls, PASSWORD_SENTINEL, TOKEN_SENTINEL);
});

test('failed logout clears the session without logging its bearer token', async () => {
    globalThis.__sensitiveStore.logout = async (token) => {
        throw axiosLikeError('Logout failed', undefined, token);
    };

    const state = await storeHarness.failLogout(TOKEN_SENTINEL);

    assert.equal(state.user, null);
    assert.equal(state.token, null);
    assert.equal(localStorage.getItem('token'), null);
    assertSecretsAbsent(consoleCapture.calls, TOKEN_SENTINEL);
});

test('failed authenticated financial reads do not log complete HTTP errors', async () => {
    globalThis.__sensitiveStore.wallet = async () => {
        throw axiosLikeError('Wallet unavailable', { operation: 'wallet-balance' });
    };
    globalThis.__sensitiveStore.apiGet = async () => {
        throw axiosLikeError('Transaction unavailable', { operation: 'transaction-lookup' });
    };

    const walletState = await storeHarness.failWalletBalance();
    const transaction = await storeHarness.failTransactionLookup();

    assert.equal(walletState.loading, false);
    assert.equal(transaction, null);
    assertSecretsAbsent(consoleCapture.calls, TOKEN_SENTINEL);
    assert.equal(consoleCapture.calls.some((call) => call.some((value) => value?.config)), false);
});

test.after(() => environment.restore());
