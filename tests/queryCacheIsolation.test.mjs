import { test } from 'node:test';
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

async function loadIsolationContract() {
    try {
        const result = await build({
            stdin: {
                contents: `
                    export * from './src/app/queryClient.ts';
                    export * from './src/app/sessionLifecycle.ts';
                `,
                resolveDir: root,
                sourcefile: 'batch2d-query-entry.ts',
                loader: 'ts'
            },
            bundle: true,
            format: 'esm',
            platform: 'node',
            write: false
        });
        return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
    } catch (error) {
        assert.fail(`private cache/session contract is unavailable: ${error.message}`);
    }
}

async function loadPrivateHookHarness() {
    const mocks = {
        name: 'batch-2d-private-hook-mocks',
        setup(builder) {
            builder.onResolve({ filter: /store[\\/]auth[\\/]authStore(?:\.[jt]s)?$/ }, () => ({ path: 'auth-store', namespace: 'private-hook' }));
            builder.onResolve({ filter: /services[\\/]wallet[\\/]walletService(?:\.[jt]s)?$/ }, () => ({ path: 'wallet', namespace: 'private-hook' }));
            builder.onResolve({ filter: /services[\\/]transactions[\\/]transactionService(?:\.[jt]s)?$/ }, () => ({ path: 'transactions', namespace: 'private-hook' }));
            builder.onLoad({ filter: /.*/, namespace: 'private-hook' }, ({ path }) => {
                if (path === 'auth-store') return { loader: 'js', resolveDir: root, contents: `
                    import { create } from 'zustand';
                    export const useAuthStore = create(() => ({ user: null, token: null, isAuthenticated: false }));
                ` };
                if (path === 'wallet') return { loader: 'js', contents: `
                    export const getWalletBalance = (...args) => globalThis.__batch2dWalletBalance(...args);
                    export const initWalletFunding = async () => ({});
                ` };
                return { loader: 'js', contents: `
                    export const getMyTransactionLogs = async () => ({ items: [] });
                    export const getTransactionById = async () => null;
                ` };
            });
        }
    };
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import { QueryClientProvider } from '@tanstack/react-query';
                import { useWallet } from './src/hooks/useWallet.ts';
                import { useAuthStore } from './src/store/auth/authStore.js';
                import { queryClient, privateQueryKey } from './src/app/queryClient.ts';
                import { teardownSession } from './src/app/sessionLifecycle.ts';

                let root;
                function Probe() {
                    const wallet = useWallet();
                    return <div data-status={wallet.fetchStatus} data-balance={wallet.data?.available ?? ''}>{wallet.data?.available ?? ''}</div>;
                }
                export async function mount(container) {
                    queryClient.clear();
                    queryClient.setDefaultOptions({ queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false } });
                    root = createRoot(container);
                    await act(async () => {
                        root.render(<QueryClientProvider client={queryClient}><Probe /></QueryClientProvider>);
                    });
                }
                export async function setAuth(next) {
                    await act(async () => { useAuthStore.setState(next); });
                }
                export async function settle() {
                    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
                }
                export async function teardown() {
                    await act(async () => { useAuthStore.setState({ token: null, user: null, isAuthenticated: false }); });
                    teardownSession();
                }
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                    queryClient.clear();
                }
                export { queryClient, privateQueryKey };
            `,
            resolveDir: root,
            sourcefile: 'batch2d-private-hook-entry.tsx',
            loader: 'tsx'
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        plugins: [mocks],
        define: { 'process.env.NODE_ENV': '"test"' }
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

async function waitFor(harness, condition) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
        if (condition()) return;
        await harness.settle();
    }
    assert.fail('Timed out waiting for rendered private query state');
}

test('C2 private query keys include the authenticated identity', async () => {
    const { privateQueryKey } = await loadIsolationContract();

    assert.notDeepEqual(
        privateQueryKey('user-a', 'wallet', 'balance'),
        privateQueryKey('user-b', 'wallet', 'balance')
    );
});

test('C3 user B cannot read user A cached private query data', async () => {
    const { queryClient, privateQueryKey } = await loadIsolationContract();
    queryClient.clear();
    queryClient.setQueryData(privateQueryKey('user-a', 'txlog', 'tx-1'), { owner: 'user-a' });

    assert.equal(queryClient.getQueryData(privateQueryKey('user-b', 'txlog', 'tx-1')), undefined);
});

test('C4 session teardown clears query and mutation caches', async () => {
    const { queryClient, privateQueryKey, teardownSession } = await loadIsolationContract();
    queryClient.setQueryData(privateQueryKey('user-a', 'wallet'), { balance: 50 });
    queryClient.getMutationCache().build(queryClient, { mutationKey: privateQueryKey('user-a', 'redeem') });

    teardownSession();

    assert.equal(queryClient.getQueryCache().getAll().length, 0);
    assert.equal(queryClient.getMutationCache().getAll().length, 0);
});

test('C15 every private React Query hook scopes keys and gates reads on authentication', () => {
    const privateHookFiles = [
        'src/hooks/useWallet.ts',
        'src/hooks/useSupport.ts',
        'src/hooks/useReferral.ts',
        'src/hooks/useNotifications.ts',
        'src/hooks/useInvestment.ts',
        'src/hooks/admin/useAdminInvestment.ts',
        'src/hooks/admin/useAdminAnalytics.ts'
    ];

    for (const relativePath of privateHookFiles) {
        const source = readFileSync(join(root, relativePath), 'utf8');
        assert.match(source, /privateQueryKey\s*\(/, `${relativePath} must identity-scope private keys`);
        assert.match(source, /enabled:\s*[^,\n]*isAuthenticated/, `${relativePath} must not fetch before authentication`);
        assert.doesNotMatch(source, /queryKey:\s*\[/, `${relativePath} still contains an unscoped query key`);
    }
});

test('C15 behavioral private hook gates unresolved identity and isolates A from B cache', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
        url: 'http://localhost/app/wallet',
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
    let balance = 111;
    let calls = 0;
    globalThis.__batch2dWalletBalance = async () => {
        calls += 1;
        return { available: balance, balance, frozen: 0, currency: 'NGN' };
    };
    let harness;

    try {
        harness = await loadPrivateHookHarness();
        const container = document.getElementById('root');
        await harness.mount(container);
        await harness.settle();
        assert.equal(calls, 0, 'unauthenticated query must remain disabled');

        await harness.setAuth({ token: 'token-a', user: null, isAuthenticated: true });
        await harness.settle();
        assert.equal(calls, 0, 'token without resolved identity must remain disabled');

        await harness.setAuth({ token: 'token-a', user: { id: 'user-a' }, isAuthenticated: true });
        await waitFor(harness, () => container.textContent === '111');
        assert.equal(calls, 1);
        assert.equal(harness.queryClient.getQueryData(harness.privateQueryKey('user-a', 'wallet', 'balance')).available, 111);

        balance = 222;
        await harness.setAuth({ token: 'token-b', user: { id: 'user-b' }, isAuthenticated: true });
        assert.notEqual(container.textContent, '111', 'A cached result must not render under B identity');
        await waitFor(harness, () => container.textContent === '222');
        assert.equal(harness.queryClient.getQueryData(harness.privateQueryKey('user-a', 'wallet', 'balance')).available, 111);
        assert.equal(harness.queryClient.getQueryData(harness.privateQueryKey('user-b', 'wallet', 'balance')).available, 222);

        await harness.teardown();
        assert.equal(harness.queryClient.getQueryCache().getAll().length, 0);
    } finally {
        try {
            if (harness) await harness.unmount();
        } finally {
            dom.window.close();
            delete globalThis.__batch2dWalletBalance;
            for (const [key, descriptor] of previous) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else delete globalThis[key];
            }
        }
    }
});
