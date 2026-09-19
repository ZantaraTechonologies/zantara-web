import { after, afterEach, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PENDING_MESSAGE = 'Your transaction is awaiting provider confirmation. Please do not make the purchase again. You can check the transaction status using the reference below.';

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
        url: 'http://localhost/app/services',
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

async function loadServiceHarness() {
    const apiMock = {
        name: 'vtu-pending-service-api',
        setup(builder) {
            builder.onResolve({ filter: /api[\\/]apiClient(?:\.js)?$/ }, () => ({ path: 'api', namespace: 'vtu-pending-service' }));
            builder.onLoad({ filter: /.*/, namespace: 'vtu-pending-service' }, () => ({
                loader: 'js',
                contents: `
                    const api = {
                        get: (...args) => globalThis.__vtuPending.api('get', ...args),
                        post: (...args) => globalThis.__vtuPending.api('post', ...args)
                    };
                    export default api;
                `,
            }));
        },
    };
    const result = await build({
        stdin: {
            contents: `
                import * as service from './src/services/vtu/vtuService.ts';
                export const purchase = (kind, body) => service[kind](body);
            `,
            resolveDir: root,
            sourcefile: 'vtu-pending-service-entry.ts',
            loader: 'ts',
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        jsx: 'automatic',
        write: false,
        plugins: [apiMock],
        define: { 'import.meta.env.DEV': 'false' },
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

async function loadPurchaseHarness() {
    const mocks = {
        name: 'vtu-pending-page-mocks',
        setup(builder) {
            const resolve = (filter, path) => builder.onResolve({ filter }, () => ({ path, namespace: 'vtu-pending-page' }));
            resolve(/layouts[\\/]user[\\/]PurchaseLayout(?:\.tsx)?$/, 'layout');
            resolve(/components[\\/]buy[\\/]Buy(?:\.tsx)?$/, 'buy');
            resolve(/components[\\/]modals[\\/]SecurePinModal(?:\.tsx)?$/, 'pin-modal');
            resolve(/services[\\/]vtu[\\/]vtuService(?:\.ts)?$/, 'vtu');
            resolve(/store[\\/]wallet[\\/]walletStore(?:\.js)?$/, 'wallet');
            resolve(/store[\\/]auth[\\/]authStore(?:\.js)?$/, 'auth');
            resolve(/services[\\/]api[\\/]apiClient(?:\.js)?$/, 'api');
            resolve(/utils[\\/]phoneValidation(?:\.ts)?$/, 'phone');
            resolve(/utils[\\/]sessionRouteState(?:\.ts)?$/, 'route-state');
            resolve(/^react-router-dom$/, 'router');
            resolve(/^react-hot-toast$/, 'toast');
            builder.onResolve({ filter: /\.webp$/ }, () => ({ path: 'asset', namespace: 'vtu-pending-page' }));
            builder.onLoad({ filter: /.*/, namespace: 'vtu-pending-page' }, ({ path }) => {
                if (path === 'layout') return { loader: 'jsx', resolveDir: root, contents: `export default ({ children }) => <main>{children}</main>;` };
                if (path === 'buy') return { loader: 'jsx', resolveDir: root, contents: `
                    export const Row = ({ children }) => <div>{children}</div>;
                    export const Input = (props) => <input {...props} />;
                    export const SubmitButton = ({ children, loading, ...props }) => <button type="submit" {...props}>{loading ? 'Processing' : children}</button>;
                ` };
                if (path === 'pin-modal') return { loader: 'jsx', resolveDir: root, contents: `
                    export default function PinModal({ isOpen, onConfirm, error, loading }) {
                        if (!isOpen) return null;
                        return <div><button type="button" data-confirm-pin disabled={loading} onClick={() => onConfirm('1234')}>Authorize</button>{error && <p data-pin-error>{error}</p>}</div>;
                    }
                ` };
                if (path === 'vtu') return { loader: 'js', contents: `
                    export const fetchDataPlans = async () => ({ data: { variations: [globalThis.__vtuPage.plan] } });
                    export const previewPrice = async () => ({ success: true, data: { salePrice: globalThis.__vtuPage.plan.variation_amount } });
                    export const verifyMeter = async () => ({ data: { content: { Customer_Name: 'Test Customer' } } });
                    export const verifyMerchant = async () => ({ data: { content: { Customer_Name: 'Test Customer' } } });
                    export const verifyJambProfile = async () => ({ data: { content: { Customer_Name: 'Test Customer' } } });
                    export const buyAirtime = (body) => globalThis.__vtuPage.purchase('buyAirtime', body);
                    export const buyData = (body) => globalThis.__vtuPage.purchase('buyData', body);
                    export const buyElectricity = (body) => globalThis.__vtuPage.purchase('buyElectricity', body);
                    export const buyCable = (body) => globalThis.__vtuPage.purchase('buyCable', body);
                    export const buyExamPin = (body) => globalThis.__vtuPage.purchase('buyExamPin', body);
                ` };
                if (path === 'wallet') return { loader: 'js', contents: `export const useWalletStore = () => ({ balance: 100000, currency: '₦', fetchBalance: async () => globalThis.__vtuPage.balanceCalls++ });` };
                if (path === 'auth') return { loader: 'js', contents: `export const useAuthStore = () => ({ user: { id: 'user-a', phone: '08030000000', email: 'user@example.test' } });` };
                if (path === 'api') return { loader: 'js', contents: `export default { get: async () => ({ data: { data: [globalThis.__vtuPage.identity] } }) };` };
                if (path === 'phone') return { loader: 'js', contents: `export const detectNetwork = () => null;` };
                if (path === 'route-state') return { loader: 'js', contents: `export const getSessionIdentity = (user) => user.id; export const createOwnedRouteState = (_owner, value) => value;` };
                if (path === 'router') return { loader: 'js', contents: `export const useNavigate = () => (...args) => globalThis.__vtuPage.navigations.push(args);` };
                if (path === 'toast') return { loader: 'js', contents: `export const toast = { success: (message) => globalThis.__vtuPage.toasts.push(['success', message]), error: (message) => globalThis.__vtuPage.toasts.push(['error', message]) };` };
                return { loader: 'js', contents: `export default '/asset.webp';` };
            });
        },
    };
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import Airtime from './src/pages/user/UserBuyAirtimePage.tsx';
                import Data from './src/pages/user/UserBuyDataPage.tsx';
                import Electricity from './src/pages/user/UserBuyElectricityPage.tsx';
                import Cable from './src/pages/user/UserBuyCablePage.tsx';
                import ExamPin from './src/pages/user/UserBuyExamPinPage.tsx';

                const pages = { airtime: Airtime, data: Data, electricity: Electricity, cable: Cable, examPin: ExamPin };
                let root;
                const container = () => document.getElementById('root');
                const setter = () => Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

                export async function mount(flow) {
                    const Page = pages[flow];
                    root = createRoot(container());
                    await act(async () => { root.render(<Page />); });
                    await wait();
                    await wait();
                }
                export async function wait(ms = 0) {
                    await act(async () => { await new Promise((resolve) => setTimeout(resolve, ms)); });
                }
                export async function input(placeholder, value) {
                    const element = [...container().querySelectorAll('input')].find((node) => node.placeholder === placeholder);
                    if (!element) throw new Error('Input not found: ' + placeholder);
                    await act(async () => {
                        setter().call(element, value);
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                }
                export async function clickText(text) {
                    const element = [...container().querySelectorAll('button')].find((node) => node.textContent.includes(text));
                    if (!element) throw new Error('Button not found: ' + text);
                    await act(async () => { element.click(); });
                    await wait();
                }
                export async function submit() {
                    const form = container().querySelector('form');
                    await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
                    await wait();
                }
                export async function confirm() {
                    const button = container().querySelector('[data-confirm-pin]');
                    if (!button) throw new Error('PIN confirmation not found');
                    await act(async () => { button.click(); });
                    await wait();
                }
                export const text = () => container().textContent;
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                    root = null;
                }
            `,
            resolveDir: root,
            sourcefile: 'vtu-pending-page-entry.tsx',
            loader: 'tsx',
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        jsx: 'automatic',
        write: false,
        plugins: [mocks],
        define: { 'process.env.NODE_ENV': '"test"' },
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

async function loadAdminHarness() {
    const mocks = {
        name: 'admin-requery-mocks',
        setup(builder) {
            builder.onResolve({ filter: /services[\\/]api[\\/]apiClient(?:\.js)?$/ }, () => ({ path: 'api', namespace: 'admin-requery' }));
            builder.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'admin-requery' }));
            builder.onResolve({ filter: /^react-hot-toast$/ }, () => ({ path: 'toast', namespace: 'admin-requery' }));
            builder.onLoad({ filter: /.*/, namespace: 'admin-requery' }, ({ path }) => {
                if (path === 'api') return { loader: 'js', contents: `
                    export default {
                        get: (...args) => globalThis.__adminRequery.get(...args),
                        post: (...args) => globalThis.__adminRequery.post(...args)
                    };
                ` };
                if (path === 'router') return { loader: 'jsx', resolveDir: root, contents: `
                    export const useLocation = () => ({ search: '' });
                    export const useNavigate = () => () => {};
                    export const Link = ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>;
                ` };
                return { loader: 'js', contents: `export const toast = { error() {}, success() {} };` };
            });
        },
    };
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import TransactionsPage from './src/pages/admin/TransactionsPage.tsx';
                let root;
                export async function mount() {
                    root = createRoot(document.getElementById('root'));
                    await act(async () => { root.render(<TransactionsPage />); });
                    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
                }
                export async function requery() {
                    const button = document.querySelector('[title="Trace Transaction"]');
                    if (!button) throw new Error('Trace Transaction button not found');
                    await act(async () => { button.click(); });
                    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
                }
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                    root = null;
                }
            `,
            resolveDir: root,
            sourcefile: 'admin-requery-entry.tsx',
            loader: 'tsx',
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        jsx: 'automatic',
        write: false,
        plugins: [mocks],
        define: { 'process.env.NODE_ENV': '"test"' },
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

const flows = {
    airtime: {
        method: 'buyAirtime',
        identity: { _id: 'airtime-id', slug: 'mtn', name: 'MTN' },
        setup: async (harness) => {
            await harness.input('08012345678', '08030000000');
            await harness.input('0.00', '100');
            await harness.wait(550);
        },
    },
    data: {
        method: 'buyData',
        identity: { _id: 'data-id', slug: 'mtn-data', name: 'MTN' },
        setup: async (harness) => {
            await harness.input('08012345678', '08030000000');
            await harness.clickText('Test Plan');
        },
    },
    electricity: {
        method: 'buyElectricity',
        identity: { _id: 'electricity-id', slug: 'ikeja-electric', name: 'Ikeja Electric' },
        setup: async (harness) => {
            await harness.input('Enter meter number', '1234567890');
            await harness.clickText('Verify');
            await harness.input('0.00', '1000');
            await harness.wait(550);
        },
    },
    cable: {
        method: 'buyCable',
        identity: { _id: 'cable-id', slug: 'dstv', name: 'DSTV' },
        setup: async (harness) => {
            await harness.clickText('Test Plan');
            await harness.input('Enter decoder number', '1234567890');
            await harness.clickText('Verify');
        },
    },
    examPin: {
        method: 'buyExamPin',
        identity: { _id: 'exam-id', slug: 'waec', name: 'WAEC' },
        setup: async (harness) => {
            await harness.clickText('Test Plan');
        },
    },
};

let environment;
let serviceHarness;
let purchaseHarness;
let adminHarness;

before(async () => {
    environment = installDom();
    serviceHarness = await loadServiceHarness();
    purchaseHarness = await loadPurchaseHarness();
    adminHarness = await loadAdminHarness();
});

beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
});

afterEach(async () => {
    await purchaseHarness.unmount();
    await adminHarness.unmount();
    delete globalThis.__vtuPending;
    delete globalThis.__vtuPage;
    delete globalThis.__adminRequery;
});

after(() => environment.restore());

for (const [flow, config] of Object.entries(flows)) {
    test(`${flow} service preserves HTTP 202 as pending`, async () => {
        globalThis.__vtuPending = {
            api: async () => ({
                status: 202,
                data: {
                    success: false,
                    data: {
                        status: 'pending',
                        providerOutcome: flow === 'examPin' ? 'success' : 'unknown',
                        reference: `REF-${flow}`,
                        transactionId: `TX-${flow}`,
                        token: 'UNCONFIRMED-TOKEN',
                    },
                },
            }),
        };

        const result = await serviceHarness.purchase(config.method, {});

        assert.equal(result.httpStatus, 202);
        assert.equal(result.outcome, 'pending');
        assert.equal(result.data.reference, `REF-${flow}`);
    });

    test(`${flow} pending purchase navigates once to pending with backend reference`, async () => {
        const calls = [];
        globalThis.__vtuPage = {
            identity: config.identity,
            plan: { variation_code: 'test-plan', variation_amount: 100, name: 'Test Plan' },
            navigations: [],
            toasts: [],
            balanceCalls: 0,
            purchase: async (method, body) => {
                calls.push({ method, body });
                return {
                    httpStatus: 202,
                    outcome: 'pending',
                    success: false,
                    message: 'Provider response is unresolved',
                    data: {
                        status: 'pending',
                        providerOutcome: flow === 'examPin' ? 'success' : 'unknown',
                        reference: `REF-${flow}`,
                        transactionId: `TX-${flow}`,
                        token: 'UNCONFIRMED-TOKEN',
                        purchased_code: 'UNCONFIRMED-PIN',
                    },
                };
            },
        };

        await purchaseHarness.mount(flow);
        await config.setup(purchaseHarness);
        await purchaseHarness.submit();
        await purchaseHarness.confirm();

        assert.equal(calls.length, 1);
        assert.equal(globalThis.__vtuPage.navigations.length, 1);
        const [path, options] = globalThis.__vtuPage.navigations[0];
        assert.equal(path, '/app/services/status');
        assert.equal(options.state.status, 'pending');
        assert.equal(options.state.message, PENDING_MESSAGE);
        assert.equal(options.state.transaction.reference, `REF-${flow}`);
        assert.equal(options.state.transaction.token, undefined);
        const rendered = JSON.stringify(options.state).toLowerCase();
        assert.equal(rendered.includes('successful'), false);
        assert.equal(rendered.includes('transaction failed'), false);
        assert.equal(rendered.includes('retry'), false);
    });
}

test('normal HTTP 200 purchase success remains confirmed success', async () => {
    globalThis.__vtuPending = {
        api: async () => ({
            status: 200,
            data: { success: true, message: 'Purchase successful', data: { status: 'success', reference: 'REF-SUCCESS' } },
        }),
    };

    const result = await serviceHarness.purchase('buyAirtime', {});

    assert.equal(result.httpStatus, 200);
    assert.equal(result.outcome, 'success');
    assert.equal(result.data.reference, 'REF-SUCCESS');
});

test('HTTP 202 alone takes precedence over a success body', async () => {
    globalThis.__vtuPending = {
        api: async () => ({
            status: 202,
            data: { success: true, data: { status: 'success', providerOutcome: 'success', reference: 'REF-202' } },
        }),
    };

    const result = await serviceHarness.purchase('buyExamPin', {});

    assert.equal(result.outcome, 'pending');
    assert.equal(result.data.reference, 'REF-202');
});

test('pending body status is pending even on HTTP 200 with provider success', async () => {
    globalThis.__vtuPending = {
        api: async () => ({
            status: 200,
            data: { success: false, data: { status: 'pending', providerOutcome: 'success', reference: 'REF-BODY-PENDING' } },
        }),
    };

    const result = await serviceHarness.purchase('buyExamPin', {});

    assert.equal(result.outcome, 'pending');
    assert.equal(result.data.reference, 'REF-BODY-PENDING');
});

test('rendered purchase flow preserves normal confirmed success navigation', async () => {
    const calls = [];
    globalThis.__vtuPage = {
        identity: flows.airtime.identity,
        plan: { variation_code: 'test-plan', variation_amount: 100, name: 'Test Plan' },
        navigations: [],
        toasts: [],
        balanceCalls: 0,
        purchase: async (method, body) => {
            calls.push({ method, body });
            return {
                httpStatus: 200,
                outcome: 'success',
                success: true,
                message: 'Airtime delivered',
                data: { status: 'success', reference: 'REF-SUCCESS-PAGE' },
            };
        },
    };

    await purchaseHarness.mount('airtime');
    await flows.airtime.setup(purchaseHarness);
    await purchaseHarness.submit();
    await purchaseHarness.confirm();

    assert.equal(calls.length, 1);
    assert.equal(globalThis.__vtuPage.navigations.length, 1);
    const [, options] = globalThis.__vtuPage.navigations[0];
    assert.equal(options.state.status, 'success');
    assert.equal(options.state.message, 'Airtime delivered');
    assert.equal(options.state.transaction.reference, 'REF-SUCCESS-PAGE');
});

test('rendered confirmed failure preserves backend message without success navigation', async () => {
    const backendMessage = 'Insufficient balance';
    const calls = [];
    globalThis.__vtuPage = {
        identity: flows.data.identity,
        plan: { variation_code: 'test-plan', variation_amount: 100, name: 'Test Plan' },
        navigations: [],
        toasts: [],
        balanceCalls: 0,
        purchase: async (method, body) => {
            calls.push({ method, body });
            throw { response: { status: 400, data: { success: false, message: backendMessage } } };
        },
    };

    await purchaseHarness.mount('data');
    await flows.data.setup(purchaseHarness);
    await purchaseHarness.submit();
    await purchaseHarness.confirm();

    assert.equal(calls.length, 1);
    assert.equal(globalThis.__vtuPage.navigations.length, 0);
    assert.ok(purchaseHarness.text().includes(backendMessage));
    assert.ok(globalThis.__vtuPage.toasts.some(([kind, message]) => kind === 'error' && message === backendMessage));
});

test('confirmed backend failure remains a rejected purchase with its safe message', async () => {
    const failure = { response: { status: 400, data: { success: false, message: 'Insufficient balance' } } };
    globalThis.__vtuPending = { api: async () => { throw failure; } };

    await assert.rejects(serviceHarness.purchase('buyData', {}), (error) => error === failure);
});

test('admin transaction requery sends refId', async () => {
    const posts = [];
    const transaction = {
        _id: 'txn-1',
        createdAt: '2026-09-19T00:00:00.000Z',
        service: 'airtime',
        amount: 100,
        status: 'pending',
        reference: 'REF-ADMIN',
    };
    globalThis.__adminRequery = {
        get: async () => ({ data: { data: { transactions: [transaction], pagination: { total: 1 } } } }),
        post: async (url, body) => { posts.push({ url, body }); },
    };

    await adminHarness.mount();
    await adminHarness.requery();

    assert.deepEqual(posts, [{ url: '/services/transaction/status', body: { refId: 'REF-ADMIN' } }]);
});
