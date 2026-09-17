import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
            close() { onmessage = null; }
        };
        this.port2 = {
            postMessage(data) { setTimeout(() => onmessage?.({ data }), 0); },
            close() {}
        };
    }
}

class MemoryStorage {
    #values = new Map();

    get length() { return this.#values.size; }
    key(index) { return [...this.#values.keys()][index] ?? null; }
    getItem(key) { return this.#values.get(String(key)) ?? null; }
    setItem(key, value) { this.#values.set(String(key), String(value)); }
    removeItem(key) { this.#values.delete(String(key)); }
    clear() { this.#values.clear(); }
}

globalThis.localStorage = new MemoryStorage();
globalThis.sessionStorage = new MemoryStorage();
globalThis.window = { location: { hostname: 'localhost', href: '/', reload: () => {} } };
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });

let walletBalanceRequest = async () => ({ available: 0, balance: 0, frozen: 0, currency: 'NGN' });
let adminStatsRequest = async () => ({ data: {} });
let authLoginRequest = async () => ({});
let authRegisterRequest = async () => ({});
let authLogoutRequest = async () => {};

globalThis.__batch2d = {
    auth: {
        login: (...args) => authLoginRequest(...args),
        register: (...args) => authRegisterRequest(...args),
        logout: (...args) => authLogoutRequest(...args),
        getMe: async () => ({})
    },
    wallet: {
        getWalletBalance: (...args) => walletBalanceRequest(...args),
        getVirtualAccount: async () => null,
        getLinkedAccounts: async () => [],
        addLinkedAccount: async () => {},
        deleteLinkedAccount: async () => {},
        getMyWithdrawals: async () => [],
        generateVirtualAccounts: async () => {}
    },
    admin: {
        fetchDashboardStats: (...args) => adminStatsRequest(...args)
    }
};

const mockPlugin = {
    name: 'batch-2d-service-mocks',
    setup(builder) {
        builder.onResolve({ filter: /services[\\/]auth[\\/]authService(?:\.[jt]s)?$/ }, () => ({ path: 'auth', namespace: 'batch2d' }));
        builder.onResolve({ filter: /services[\\/]wallet[\\/]walletService(?:\.[jt]s)?$/ }, () => ({ path: 'wallet', namespace: 'batch2d' }));
        builder.onResolve({ filter: /services[\\/]admin[\\/]adminService(?:\.[jt]s)?$/ }, () => ({ path: 'admin', namespace: 'batch2d' }));
        builder.onLoad({ filter: /.*/, namespace: 'batch2d' }, ({ path }) => {
            if (path === 'auth') {
                return { loader: 'js', contents: `
                    export const login = (...args) => globalThis.__batch2d.auth.login(...args);
                    export const register = (...args) => globalThis.__batch2d.auth.register(...args);
                    export const logout = (...args) => globalThis.__batch2d.auth.logout(...args);
                    export const getMe = (...args) => globalThis.__batch2d.auth.getMe(...args);
                ` };
            }
            if (path === 'wallet') {
                return { loader: 'js', contents: `
                    export const getWalletBalance = (...args) => globalThis.__batch2d.wallet.getWalletBalance(...args);
                    export const getVirtualAccount = (...args) => globalThis.__batch2d.wallet.getVirtualAccount(...args);
                    export const getLinkedAccounts = (...args) => globalThis.__batch2d.wallet.getLinkedAccounts(...args);
                    export const addLinkedAccount = (...args) => globalThis.__batch2d.wallet.addLinkedAccount(...args);
                    export const deleteLinkedAccount = (...args) => globalThis.__batch2d.wallet.deleteLinkedAccount(...args);
                    export const getMyWithdrawals = (...args) => globalThis.__batch2d.wallet.getMyWithdrawals(...args);
                    export const generateVirtualAccounts = (...args) => globalThis.__batch2d.wallet.generateVirtualAccounts(...args);
                ` };
            }
            return { loader: 'js', contents: `
                export const fetchDashboardStats = (...args) => globalThis.__batch2d.admin.fetchDashboardStats(...args);
            ` };
        });
    }
};

const bundled = await build({
    stdin: {
        contents: `
            import { useAuthStore } from './src/store/auth/authStore.js';
            import { useWalletStore } from './src/store/wallet/walletStore.js';
            import { useAdminStore } from './src/store/admin/adminStore.ts';
            import API from './src/services/api/apiClient.js';
            import { synchronizeExternalSession } from './src/app/sessionLifecycle.ts';
            import { queryClient, privateQueryKey } from './src/app/queryClient.ts';
            export { useAuthStore, useWalletStore, useAdminStore, API, synchronizeExternalSession, queryClient, privateQueryKey };
        `,
        resolveDir: root,
        sourcefile: 'batch2d-session-entry.js',
        loader: 'js'
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    plugins: [mockPlugin],
    define: {
        'import.meta.env.VITE_API_BASE_URL': '"http://localhost:8000"'
    }
});

const runtime = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const { useAuthStore, useWalletStore, useAdminStore, API, synchronizeExternalSession, queryClient, privateQueryKey } = runtime;

async function loadAdminLogoutHarness() {
    const uiMocks = {
        name: 'batch-2d-admin-ui-mocks',
        setup(builder) {
            builder.onResolve({ filter: /components[\\/]navigation[\\/]Navbar(?:\.jsx)?$/ }, () => ({ path: 'navbar', namespace: 'admin-ui' }));
            builder.onResolve({ filter: /hooks[\\/]useAdminAuth(?:\.[jt]s)?$/ }, () => ({ path: 'admin-auth', namespace: 'admin-ui' }));
            builder.onResolve({ filter: /app[\\/]SiteSettingsContext(?:\.tsx)?$/ }, () => ({ path: 'settings', namespace: 'admin-ui' }));
            builder.onResolve({ filter: /services[\\/]auth[\\/]authService(?:\.[jt]s)?$/ }, () => ({ path: 'auth', namespace: 'admin-ui' }));
            builder.onResolve({ filter: /services[\\/]wallet[\\/]walletService(?:\.[jt]s)?$/ }, () => ({ path: 'wallet', namespace: 'admin-ui' }));
            builder.onResolve({ filter: /services[\\/]admin[\\/]adminService(?:\.[jt]s)?$/ }, () => ({ path: 'admin', namespace: 'admin-ui' }));
            builder.onLoad({ filter: /.*/, namespace: 'admin-ui' }, ({ path }) => {
                if (path === 'navbar') return { loader: 'jsx', contents: 'export default function Navbar() { return null; }' };
                if (path === 'admin-auth') return { loader: 'js', contents: "export const useAdminAuth = () => ({ admin: { id: 'admin-a', roles: ['superAdmin'] } });" };
                if (path === 'settings') return { loader: 'js', contents: "export const useSiteSettings = () => ({ settings: { SITE_NAME: 'Zantara' } });" };
                if (path === 'auth') return { loader: 'js', contents: `
                    export const login = async () => ({});
                    export const register = async () => ({});
                    export const getMe = async () => ({});
                    export const logout = (...args) => globalThis.__batch2dAdminLogout(...args);
                ` };
                if (path === 'wallet') return { loader: 'js', contents: `
                    export const getWalletBalance = async () => ({});
                    export const getVirtualAccount = async () => null;
                    export const getLinkedAccounts = async () => [];
                    export const addLinkedAccount = async () => ({});
                    export const deleteLinkedAccount = async () => ({});
                    export const getMyWithdrawals = async () => [];
                    export const generateVirtualAccounts = async () => ({});
                ` };
                return { loader: 'js', contents: 'export const fetchDashboardStats = async () => ({ data: {} });' };
            });
        }
    };
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import { MemoryRouter, Routes, Route } from 'react-router-dom';
                import AdminLayout from './src/layouts/admin/AdminLayout.tsx';
                import { useAuthStore } from './src/store/auth/authStore.js';
                import { useWalletStore } from './src/store/wallet/walletStore.js';
                import { useAdminStore } from './src/store/admin/adminStore.ts';
                import { queryClient, privateQueryKey } from './src/app/queryClient.ts';

                let root;
                export function seed() {
                    useAuthStore.getState().setAuth({ id: 'admin-a', roles: ['superAdmin'] }, 'token-admin-a', true);
                    useWalletStore.setState({ balance: 4200, virtualAccount: { accountNumber: 'private' }, linkedAccounts: [{ id: 'bank-a' }] });
                    useAdminStore.setState({ stats: { revenue: 99 }, pendingKycCount: 3 });
                    queryClient.setQueryData(privateQueryKey('admin-a', 'wallet', 'balance'), { balance: 4200 });
                }
                export async function mount(container) {
                    root = createRoot(container);
                    await act(async () => {
                        root.render(
                            <MemoryRouter initialEntries={['/admin/dashboard']}>
                                <Routes>
                                    <Route path="/admin" element={<AdminLayout />}>
                                        <Route path="dashboard" element={<div data-route="admin-dashboard">Dashboard</div>} />
                                    </Route>
                                    <Route path="/admin/login" element={<div data-route="admin-login">Login</div>} />
                                </Routes>
                            </MemoryRouter>
                        );
                    });
                }
                export async function terminate(container) {
                    const button = [...container.querySelectorAll('button')].find((candidate) => candidate.textContent.includes('Terminate Session'));
                    if (!button) throw new Error('Terminate Session control not rendered');
                    await act(async () => { button.click(); });
                }
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                }
                export { useAuthStore, useWalletStore, useAdminStore, queryClient };
            `,
            resolveDir: root,
            sourcefile: 'batch2d-admin-logout-entry.tsx',
            loader: 'tsx'
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        plugins: [uiMocks],
        define: { 'process.env.NODE_ENV': '"test"' }
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

function seedSession(id, token = `token-${id}`) {
    useAuthStore.getState().setAuth({ id, roles: id.startsWith('admin') ? ['superAdmin'] : ['user'] }, token, true);
}

function seedPrivateState() {
    useWalletStore.setState({
        balance: 4200,
        totalBalance: 5000,
        frozenBalance: 800,
        virtualAccount: { accountNumber: '0123456789' },
        linkedAccounts: [{ id: 'bank-a' }],
        withdrawals: [{ id: 'withdrawal-a' }],
        error: 'private wallet error'
    });
    useAdminStore.setState({
        stats: { revenue: 99 },
        pendingKycCount: 3,
        pendingWithdrawalsCount: 4,
        failedTxsToday: 5,
        todayProfit: 6,
        error: 'private admin error'
    });
}

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, loading: false, isInitialized: true, error: null, legalActionBlocked: false });
    useWalletStore.setState({ balance: 0, totalBalance: undefined, frozenBalance: undefined, currency: 'NGN', virtualAccount: null, linkedAccounts: [], withdrawals: [], loading: false, error: null });
    useAdminStore.setState({ stats: null, loadingStats: false, error: null, pendingKycCount: 0, pendingWithdrawalsCount: 0, failedTxsToday: 0, todayProfit: 0 });
    walletBalanceRequest = async () => ({ available: 0, balance: 0, frozen: 0, currency: 'NGN' });
    adminStatsRequest = async () => ({ data: {} });
    authLoginRequest = async () => ({});
    authRegisterRequest = async () => ({});
    authLogoutRequest = async () => {};
    queryClient.clear();
    window.location.href = '/';
});

test('C1 normal logout synchronously removes auth, wallet, and privileged in-memory state', async () => {
    let finishRemoteLogout;
    authLogoutRequest = () => new Promise((resolve) => { finishRemoteLogout = resolve; });
    seedSession('admin-a');
    seedPrivateState();

    const remoteLogout = useAuthStore.getState().logout();

    assert.equal(useAuthStore.getState().user, null);
    assert.equal(useWalletStore.getState().balance, 0);
    assert.equal(useWalletStore.getState().virtualAccount, null);
    assert.deepEqual(useWalletStore.getState().linkedAccounts, []);
    assert.equal(useAdminStore.getState().stats, null);
    assert.equal(useAdminStore.getState().pendingKycCount, 0);
    finishRemoteLogout();
    await remoteLogout;
});

test('wallet/admin state from A remains cleared after logout and customer B login', async () => {
    seedSession('admin-a');
    seedPrivateState();

    await useAuthStore.getState().logout();
    seedSession('user-b');

    assert.equal(useAuthStore.getState().user?.id, 'user-b');
    assert.equal(useWalletStore.getState().balance, 0);
    assert.equal(useWalletStore.getState().virtualAccount, null);
    assert.deepEqual(useWalletStore.getState().linkedAccounts, []);
    assert.equal(useAdminStore.getState().stats, null);
    assert.equal(useAdminStore.getState().pendingKycCount, 0);
});

test('a stale login rejection cannot mutate the newer authenticated session', async () => {
    let rejectLogin;
    authLoginRequest = () => new Promise((_, reject) => { rejectLogin = reject; });

    const oldLogin = useAuthStore.getState().login({ email: 'user-a@example.test', password: 'secret' });
    seedSession('user-b');
    useAuthStore.setState({ loading: true, error: 'user-b-owned-state' });
    rejectLogin(new Error('user-a-login-failed'));

    await assert.rejects(oldLogin, /user-a-login-failed/);
    const current = useAuthStore.getState();
    assert.equal(current.user?.id, 'user-b');
    assert.equal(current.token, 'token-user-b');
    assert.equal(current.isAuthenticated, true);
    assert.equal(current.loading, true);
    assert.equal(current.error, 'user-b-owned-state');
    assert.equal(current.legalActionBlocked, false);
});

test('a stale registration rejection cannot mutate the newer authenticated session', async () => {
    let rejectRegistration;
    authRegisterRequest = () => new Promise((_, reject) => { rejectRegistration = reject; });

    const oldRegistration = useAuthStore.getState().register({ email: 'user-a@example.test' });
    seedSession('user-b');
    useAuthStore.setState({ loading: true, error: 'user-b-owned-state' });
    rejectRegistration(new Error('user-a-registration-failed'));

    await assert.rejects(oldRegistration, /user-a-registration-failed/);
    const current = useAuthStore.getState();
    assert.equal(current.user?.id, 'user-b');
    assert.equal(current.token, 'token-user-b');
    assert.equal(current.isAuthenticated, true);
    assert.equal(current.loading, true);
    assert.equal(current.error, 'user-b-owned-state');
    assert.equal(current.legalActionBlocked, false);
});

test('remote logout failure cannot restore local private session state', async () => {
    seedSession('admin-a');
    seedPrivateState();
    queryClient.setQueryData(privateQueryKey('admin-a', 'wallet', 'balance'), { balance: 4200 });
    authLogoutRequest = async () => { throw new Error('network unavailable'); };
    const originalError = console.error;
    console.error = () => {};

    try {
        await useAuthStore.getState().logout();
    } finally {
        console.error = originalError;
    }

    assert.equal(useAuthStore.getState().user, null);
    assert.equal(useAuthStore.getState().token, null);
    assert.equal(useAuthStore.getState().isAuthenticated, false);
    assert.equal(localStorage.getItem('token'), null);
    assert.equal(sessionStorage.getItem('token'), null);
    assert.equal(useWalletStore.getState().balance, 0);
    assert.equal(useAdminStore.getState().stats, null);
    assert.equal(queryClient.getQueryCache().getAll().length, 0);
});

test('C5 teardown removes tokens from both storage mechanisms', () => {
    seedSession('user-a');
    sessionStorage.setItem('token', 'shadow-token');

    useAuthStore.getState().clearAuth();

    assert.equal(localStorage.getItem('token'), null);
    assert.equal(sessionStorage.getItem('token'), null);
});

test('C6 teardown preserves safe global preferences', () => {
    seedSession('user-a');
    localStorage.setItem('zantara-theme', 'dark');
    localStorage.setItem('site-settings', '{"SITE_NAME":"Zantara"}');

    useAuthStore.getState().clearAuth();

    assert.equal(localStorage.getItem('zantara-theme'), 'dark');
    assert.equal(localStorage.getItem('site-settings'), '{"SITE_NAME":"Zantara"}');
});

test('C7 a current-session 401 uses the same complete teardown contract', async () => {
    seedSession('admin-a');
    seedPrivateState();
    API.defaults.adapter = async (config) => Promise.reject({ config, response: { status: 401, data: {} } });

    await assert.rejects(API.get('/private'));

    assert.equal(useAuthStore.getState().user, null);
    assert.equal(localStorage.getItem('token'), null);
    assert.equal(useWalletStore.getState().balance, 0);
    assert.equal(useAdminStore.getState().stats, null);
});

test('a current-session 428 sets the authenticated user legal-action block', async () => {
    seedSession('user-a');
    API.defaults.adapter = async (config) => Promise.reject({ config, response: { status: 428, data: {} } });

    await assert.rejects(API.post('/private-financial-action'));

    assert.equal(useAuthStore.getState().user?.id, 'user-a');
    assert.equal(useAuthStore.getState().legalActionBlocked, true);
});

test('C8 a delayed wallet response from user A cannot write into user B session', async () => {
    let resolveWallet;
    const response = new Promise((resolve) => { resolveWallet = resolve; });
    walletBalanceRequest = () => response;
    seedSession('user-a');

    const pending = useWalletStore.getState().fetchBalance();
    seedSession('user-b');
    resolveWallet({ available: 777, balance: 777, frozen: 0, currency: 'NGN' });
    await pending;

    assert.notEqual(useWalletStore.getState().balance, 777);
});

test('C9 the admin Terminate Session control invokes real logout before navigation', () => {
    const source = readFileSync(join(root, 'src', 'layouts', 'admin', 'AdminLayout.tsx'), 'utf8');
    const handler = source.match(/const handleLogout[\s\S]*?\n\s*};/)?.[0] ?? '';

    assert.match(handler, /logout\s*\(/, 'Terminate Session must invoke the auth logout action');
});

test('C9 behavioral admin Terminate Session clears common private state and navigates', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
        url: 'http://localhost/admin/dashboard',
        pretendToBeVisual: true
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
        Event: dom.window.Event,
        MouseEvent: dom.window.MouseEvent,
        MutationObserver: dom.window.MutationObserver,
        MessageChannel: TestMessageChannel,
        getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
        requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
        cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
        IS_REACT_ACT_ENVIRONMENT: true
    };
    const previous = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const [key, value] of Object.entries(globals)) {
        Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    let logoutToken = null;
    globalThis.__batch2dAdminLogout = async (token) => { logoutToken = token; };
    let harness;

    try {
        harness = await loadAdminLogoutHarness();
        harness.seed();
        const container = document.getElementById('root');
        await harness.mount(container);
        assert.ok(container.querySelector('[data-route="admin-dashboard"]'));

        await harness.terminate(container);

        assert.equal(logoutToken, 'token-admin-a');
        assert.equal(harness.useAuthStore.getState().user, null);
        assert.equal(harness.useAuthStore.getState().token, null);
        assert.equal(harness.useWalletStore.getState().balance, 0);
        assert.equal(harness.useAdminStore.getState().stats, null);
        assert.equal(harness.queryClient.getQueryCache().getAll().length, 0);
        assert.equal(localStorage.getItem('token'), null);
        assert.ok(container.querySelector('[data-route="admin-login"]'));
    } finally {
        try {
            if (harness) await harness.unmount();
        } finally {
            dom.window.close();
            delete globalThis.__batch2dAdminLogout;
            for (const [key, descriptor] of previous) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else delete globalThis[key];
            }
        }
    }
});

test('C10 a delayed privileged response from admin A cannot write into user B session', async () => {
    let resolveStats;
    const response = new Promise((resolve) => { resolveStats = resolve; });
    adminStatsRequest = () => response;
    seedSession('admin-a');

    const pending = useAdminStore.getState().fetchDashboardStats();
    seedSession('user-b');
    resolveStats({ data: { revenue: 123, pendingKyc: 9 } });
    await pending;

    assert.equal(useAdminStore.getState().stats, null);
    assert.equal(useAdminStore.getState().pendingKycCount, 0);
});

test('delayed old-session 401 cannot invalidate a newer authenticated session', async () => {
    let rejectOldRequest;
    let markStarted;
    const started = new Promise((resolve) => { markStarted = resolve; });
    API.defaults.adapter = (config) => new Promise((_, reject) => {
        rejectOldRequest = () => reject({ config, response: { status: 401, data: {} } });
        markStarted();
    });

    seedSession('user-a');
    const oldRequest = API.get('/slow-private');
    await started;
    seedSession('user-b');
    rejectOldRequest();
    await assert.rejects(oldRequest);

    assert.equal(useAuthStore.getState().user?.id, 'user-b');
    assert.equal(localStorage.getItem('token'), 'token-user-b');
});

test('delayed old-session 428 cannot set the newer user legal-action block', async () => {
    let rejectOldRequest;
    let markStarted;
    const started = new Promise((resolve) => { markStarted = resolve; });
    API.defaults.adapter = (config) => new Promise((_, reject) => {
        rejectOldRequest = () => reject({ config, response: { status: 428, data: {} } });
        markStarted();
    });

    seedSession('user-a');
    const oldRequest = API.post('/slow-private-financial-action');
    await started;
    seedSession('user-b');
    rejectOldRequest();
    await assert.rejects(oldRequest);

    assert.equal(useAuthStore.getState().user?.id, 'user-b');
    assert.equal(useAuthStore.getState().legalActionBlocked, false);
    assert.equal(localStorage.getItem('token'), 'token-user-b');
});

test('cross-tab token rotation drops local private state without deleting the new shared token', () => {
    seedSession('admin-a');
    seedPrivateState();
    localStorage.setItem('token', 'token-user-b');

    synchronizeExternalSession();

    assert.equal(useAuthStore.getState().user, null);
    assert.equal(useWalletStore.getState().balance, 0);
    assert.equal(useAdminStore.getState().stats, null);
    assert.equal(localStorage.getItem('token'), 'token-user-b');
});

test('an explicit old logout token is not overwritten by a newly stored token', async () => {
    let authorization;
    API.defaults.adapter = async (config) => {
        authorization = config.headers.get('Authorization');
        return { config, data: {}, headers: {}, status: 204, statusText: 'No Content' };
    };

    localStorage.setItem('token', 'token-user-a');
    const logoutRequest = API.post('/auth/logout', undefined, {
        headers: { Authorization: 'Bearer token-user-a' }
    });
    localStorage.setItem('token', 'token-user-b');
    await logoutRequest;

    assert.equal(authorization, 'Bearer token-user-a');
});

test('a shared token change is canceled before any request can dispatch under the wrong identity', async () => {
    let dispatched = false;
    let reloads = 0;
    window.location.reload = () => { reloads += 1; };
    API.defaults.adapter = async (config) => {
        dispatched = true;
        return { config, data: {}, headers: {}, status: 200, statusText: 'OK' };
    };

    seedSession('user-a');
    localStorage.setItem('token', 'token-user-b');
    await assert.rejects(API.post('/private-mutation'), { code: 'ERR_CANCELED' });

    assert.equal(dispatched, false);
    assert.equal(reloads, 1);
    assert.equal(useAuthStore.getState().user, null);
    assert.equal(localStorage.getItem('token'), 'token-user-b');
});
