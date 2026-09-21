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

function installDom(url = 'http://localhost/') {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
        url,
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
        HTMLInputElement: dom.window.HTMLInputElement,
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
    return {
        dom,
        restore() {
            dom.window.close();
            for (const [key, descriptor] of previous) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else delete globalThis[key];
            }
        }
    };
}

async function loadRenderedRoutingHarness() {
    const mocks = {
        name: 'batch-2d-routing-mocks',
        setup(builder) {
            builder.onResolve({ filter: /store[\\/]auth[\\/]authStore(?:\.[jt]s)?$/ }, () => ({ path: 'auth-store', namespace: 'routing' }));
            builder.onResolve({ filter: /store[\\/]wallet[\\/]walletStore(?:\.[jt]s)?$/ }, () => ({ path: 'wallet-store', namespace: 'routing' }));
            builder.onResolve({ filter: /services[\\/]user[\\/]userService(?:\.[jt]s)?$/ }, () => ({ path: 'user-service', namespace: 'routing' }));
            builder.onResolve({ filter: /components[\\/]buy[\\/]Buy(?:\.[jt]sx?)?$/ }, () => ({ path: 'buy', namespace: 'routing' }));
            builder.onResolve({ filter: /components[\\/]feedback[\\/]Skeletons(?:\.[jt]sx?)?$/ }, () => ({ path: 'skeletons', namespace: 'routing' }));
            builder.onResolve({ filter: /app[\\/]SiteSettingsContext(?:\.tsx)?$/ }, () => ({ path: 'site-settings', namespace: 'routing' }));
            builder.onResolve({ filter: /^react-hot-toast$/ }, () => ({ path: 'hot-toast', namespace: 'routing' }));
            builder.onResolve({ filter: /^react-toastify$/ }, () => ({ path: 'toastify', namespace: 'routing' }));
            builder.onLoad({ filter: /.*/, namespace: 'routing' }, ({ path }) => {
                if (path === 'auth-store') return { loader: 'js', resolveDir: root, contents: `
                    import { create } from 'zustand';
                    export const useAuthStore = create((set, get) => ({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isInitialized: true,
                        login: async () => set({
                            user: { id: 'user-a', isPinSet: globalThis.__batch2dLoginHasPin },
                            token: 'token-user-a',
                            isAuthenticated: true,
                            isInitialized: true
                        }),
                        fetchMe: async () => set({ user: { ...(get().user || { id: 'user-a' }), isPinSet: true } })
                    }));
                ` };
                if (path === 'wallet-store') return { loader: 'js', resolveDir: root, contents: `
                    import { create } from 'zustand';
                    export const useWalletStore = create(() => ({ currency: 'NGN' }));
                ` };
                if (path === 'user-service') return { loader: 'js', contents: `
                    export const setupPin = (...args) => globalThis.__batch2dSetupPin(...args);
                    export const updatePin = async () => ({});
                ` };
                if (path === 'buy') return { loader: 'jsx', resolveDir: root, contents: `
                    import React from 'react';
                    export function SubmitButton({ children, onClick, disabled }) {
                        return <button type="button" disabled={disabled} onClick={onClick}>{children}</button>;
                    }
                ` };
                if (path === 'skeletons') return { loader: 'jsx', contents: 'export function PageLoader() { return <div data-page-loader="true">Loading</div>; }' };
                if (path === 'site-settings') return { loader: 'js', contents: `
                    export const useSiteSettings = () => ({
                        settings: { SITE_NAME: 'Zantara', SITE_URL: '', SITE_LOGO: '', SUPPORT_EMAIL: '', SUPPORT_PHONE: '' },
                        loading: false,
                        refetch: async () => {}
                    });
                ` };
                if (path === 'hot-toast') return { loader: 'js', contents: `
                    const toast = { success() {}, error() {} };
                    export { toast };
                    export default toast;
                ` };
                return { loader: 'js', contents: 'export const toast = { success() {}, error() {} };' };
            });
        }
    };
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import { createMemoryRouter, RouterProvider } from 'react-router-dom';
                import UserLoginPage from './src/pages/auth/UserLoginPage.tsx';
                import UserPinSetupPage from './src/pages/user/UserPinSetupPage.tsx';
                import TransactionStatusPage from './src/pages/user/TransactionStatusPage.tsx';
                import AuthRoute from './src/routes/guards/AuthRoute.jsx';
                import ProtectedRoute from './src/routes/guards/ProtectedRoute.jsx';
                import { useAuthStore } from './src/store/auth/authStore.js';

                let root;
                let router;
                const callback = <div data-route="payment-callback">Payment callback</div>;
                const profile = <div data-route="profile">Profile</div>;

                function resetAuth() {
                    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isInitialized: true });
                }
                export async function mountFlow(container, initialPath, loginHasPin) {
                    resetAuth();
                    globalThis.__batch2dLoginHasPin = loginHasPin;
                    router = createMemoryRouter([
                        { path: '/login', element: <AuthRoute><UserLoginPage /></AuthRoute> },
                        { path: '/paystack/return', element: <ProtectedRoute>{callback}</ProtectedRoute> },
                        { path: '/app/profile/security/pin', element: <ProtectedRoute><UserPinSetupPage /></ProtectedRoute> },
                        { path: '/app/profile', element: <ProtectedRoute>{profile}</ProtectedRoute> }
                    ], { initialEntries: [initialPath] });
                    root = createRoot(container);
                    await act(async () => { root.render(<RouterProvider router={router} />); });
                }
                export async function submitLogin(container) {
                    const form = container.querySelector('form');
                    if (!form) throw new Error('Login form not rendered');
                    await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
                }
                export async function completePin(container) {
                    const inputs = [...container.querySelectorAll('input[type="password"]')];
                    if (inputs.length !== 8) throw new Error('Expected new and confirmation PIN inputs');
                    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
                    for (const [index, input] of inputs.entries()) {
                        await act(async () => {
                            setter.call(input, String((index % 4) + 1));
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        });
                    }
                    const save = [...container.querySelectorAll('button')].find((button) => button.textContent.includes('Save PIN'));
                    if (!save || save.disabled) throw new Error('Save PIN control not ready');
                    await act(async () => { save.click(); });
                }
                export async function mountStatus(container, currentUser, ownerId) {
                    useAuthStore.setState({ user: { id: currentUser, isPinSet: true }, token: 'token-' + currentUser, isAuthenticated: true, isInitialized: true });
                    router = createMemoryRouter([
                        { path: '/before', element: <div>Before</div> },
                        { path: '/app/services/status', element: <TransactionStatusPage /> }
                    ], {
                        initialEntries: [
                            '/before',
                            {
                                pathname: '/app/services/status',
                                search: '?source=purchase',
                                hash: '#receipt',
                                state: {
                                    ownerId,
                                    payload: {
                                        status: 'success',
                                        message: 'PRIVATE COMPLETION',
                                        transaction: {
                                            service: 'Electricity',
                                            amount: 2500,
                                            target: 'PRIVATE-METER-A',
                                            reference: 'PRIVATE-REFERENCE-A',
                                            token: '1234-5678'
                                        }
                                    }
                                }
                            }
                        ],
                        initialIndex: 1
                    });
                    root = createRoot(container);
                    await act(async () => { root.render(<RouterProvider router={router} />); });
                }
                export async function setCurrentUser(userId) {
                    await act(async () => {
                        useAuthStore.setState({ user: { id: userId, isPinSet: true }, token: 'token-' + userId, isAuthenticated: true });
                    });
                }
                export async function settle() {
                    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
                }
                export function location() { return router.state.location; }
                export function historyAction() { return router.state.historyAction; }
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                    root = null;
                    router = null;
                }
            `,
            resolveDir: root,
            sourcefile: 'batch2d-routing-entry.tsx',
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

let renderedHarness;
async function getRenderedHarness() {
    renderedHarness ||= await loadRenderedRoutingHarness();
    return renderedHarness;
}

async function waitFor(harness, condition) {
    for (let attempt = 0; attempt < 40; attempt += 1) {
        if (condition()) return;
        await harness.settle();
    }
    assert.fail('Timed out waiting for rendered routing state');
}

async function loadRouteStateContract() {
    try {
        return await import('../src/utils/sessionRouteState.ts');
    } catch (error) {
        assert.fail(`session-owned route-state contract is unavailable: ${error.message}`);
    }
}

test('C11 payment callback reauthentication preserves pathname, search, and hash', async () => {
    const { getPostLoginPath } = await loadRouteStateContract();

    assert.equal(
        getPostLoginPath({ from: { pathname: '/paystack/return', search: '?reference=PS_A', hash: '#verify' } }),
        '/paystack/return?reference=PS_A#verify'
    );
});

test('C14 transaction-status state is readable only by its owning identity', async () => {
    const { createOwnedRouteState, readOwnedRouteState } = await loadRouteStateContract();
    const state = createOwnedRouteState('user-a', {
        status: 'success',
        transaction: { reference: 'PRIVATE-A', token: '1234567890' }
    });

    assert.equal(readOwnedRouteState(state, 'user-b'), null);
    assert.equal(readOwnedRouteState(state, 'user-a')?.transaction.reference, 'PRIVATE-A');
});

test('transaction-status rendering consumes and removes sensitive browser history state', () => {
    const page = readFileSync(join(root, 'src', 'pages', 'user', 'TransactionStatusPage.tsx'), 'utf8');

    assert.match(page, /readOwnedRouteState(?:<[^>]+>)?\s*\(/);
    assert.match(page, /ownedRouteState\.ownerId\s*===\s*userId/);
    assert.match(page, /setOwnedRouteState\(\{\s*ownerId:\s*userId,\s*value:\s*null\s*\}\)/);
    assert.match(page, /navigate\([^\n]*replace:\s*true[^\n]*state:\s*null/);
});

test('PIN setup preserves a protected payment callback before resuming it', () => {
    const guard = readFileSync(join(root, 'src', 'routes', 'guards', 'ProtectedRoute.jsx'), 'utf8');
    const pinPage = readFileSync(join(root, 'src', 'pages', 'user', 'UserPinSetupPage.tsx'), 'utf8');

    assert.match(guard, /profile\/security\/pin[^\n]*state=\{\{\s*from:\s*location\s*\}\}/);
    assert.match(pinPage, /getPostLoginPath\s*\(location\.state/);
    assert.match(pinPage, /navigate\(returnTo,\s*\{\s*replace:\s*true\s*\}\)/);
});

test('payment callback behaviorally survives login and required PIN setup with full destination', async () => {
    const environment = installDom('http://localhost/paystack/return?reference=ABC123#verify');
    let setupPayload = null;
    globalThis.__batch2dSetupPin = async (payload) => { setupPayload = payload; };
    let harness;

    try {
        harness = await getRenderedHarness();
        const container = document.getElementById('root');
        await harness.mountFlow(container, '/paystack/return?reference=ABC123#verify', false);
        await waitFor(harness, () => harness.location().pathname === '/login');

        await harness.submitLogin(container);
        await waitFor(harness, () => harness.location().pathname === '/app/profile/security/pin');
        assert.equal(harness.location().state.from.pathname, '/paystack/return');
        assert.equal(harness.location().state.from.search, '?reference=ABC123');
        assert.equal(harness.location().state.from.hash, '#verify');

        await harness.completePin(container);
        await waitFor(harness, () => container.querySelector('[data-route="payment-callback"]'));
        assert.deepEqual(setupPayload, { pin: '1234' });
        assert.equal(harness.location().pathname, '/paystack/return');
        assert.equal(harness.location().search, '?reference=ABC123');
        assert.equal(harness.location().hash, '#verify');
    } finally {
        try {
            if (harness) await harness.unmount();
        } finally {
            delete globalThis.__batch2dSetupPin;
            delete globalThis.__batch2dLoginHasPin;
            environment.restore();
        }
    }
});

test('normal protected destination behaviorally survives login without callback special-casing', async () => {
    const environment = installDom('http://localhost/app/profile');
    globalThis.__batch2dSetupPin = async () => {};
    let harness;

    try {
        harness = await getRenderedHarness();
        const container = document.getElementById('root');
        await harness.mountFlow(container, '/app/profile', true);
        await waitFor(harness, () => harness.location().pathname === '/login');

        await harness.submitLogin(container);
        await waitFor(harness, () => container.querySelector('[data-route="profile"]'));
        assert.equal(harness.location().pathname, '/app/profile');
        assert.equal(harness.location().search, '');
        assert.equal(harness.location().hash, '');
    } finally {
        try {
            if (harness) await harness.unmount();
        } finally {
            delete globalThis.__batch2dSetupPin;
            delete globalThis.__batch2dLoginHasPin;
            environment.restore();
        }
    }
});

test('TransactionStatusPage behaviorally filters identity changes and scrubs consumed history state', async () => {
    const environment = installDom('http://localhost/app/services/status');
    globalThis.__batch2dSetupPin = async () => {};
    let harness;

    try {
        harness = await getRenderedHarness();
        const container = document.getElementById('root');
        await harness.mountStatus(container, 'user-a', 'user-a');
        await waitFor(harness, () => container.textContent.includes('PRIVATE-REFERENCE-A'));

        assert.match(container.textContent, /PRIVATE COMPLETION/);
        assert.match(container.textContent, /12345678/);
        assert.equal(harness.location().state, null);
        assert.equal(harness.location().pathname, '/app/services/status');
        assert.equal(harness.location().search, '?source=purchase');
        assert.equal(harness.location().hash, '#receipt');
        assert.equal(harness.historyAction(), 'REPLACE');

        await harness.setCurrentUser('user-b');
        await waitFor(harness, () => container.textContent.includes('No Transaction Data'));
        for (const secret of ['PRIVATE COMPLETION', 'PRIVATE-REFERENCE-A', 'PRIVATE-METER-A', '12345678']) {
            assert.doesNotMatch(container.textContent, new RegExp(secret));
        }
    } finally {
        try {
            if (harness) await harness.unmount();
        } finally {
            delete globalThis.__batch2dSetupPin;
            delete globalThis.__batch2dLoginHasPin;
            environment.restore();
        }
    }
});
