import assert from 'node:assert/strict';
import { test } from 'node:test';
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

async function loadHarness() {
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import { MemoryRouter } from 'react-router-dom';
                import { SiteSettingsProvider, useSiteSettings } from './src/app/SiteSettingsContext.tsx';
                import Footer from './src/components/common/Footer.jsx';
                import AdminSettingsPage from './src/pages/admin/AdminSettingsPage.tsx';
                import SiteLogo from './src/components/common/SiteLogo.tsx';

                let root;
                const CurrentBrand = () => {
                    const { settings } = useSiteSettings();
                    return <output data-testid="current-brand">{settings.SITE_NAME}</output>;
                };
                const BrandProbe = () => {
                    const { settings } = useSiteSettings();
                    return <div><CurrentBrand /><SiteLogo src={settings.SITE_LOGO} siteName={settings.SITE_NAME} /></div>;
                };

                async function render(container, child) {
                    root = createRoot(container);
                    await act(async () => { root.render(<MemoryRouter><SiteSettingsProvider>{child}</SiteSettingsProvider></MemoryRouter>); });
                    await flush();
                }
                export async function flush() {
                    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
                }
                export async function mountAdmin(container) {
                    await render(container, <><CurrentBrand /><AdminSettingsPage /></>);
                }
                export async function saveAdmin(container) {
                    await act(async () => { container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
                    await flush();
                }
                export async function mountFooter(container) {
                    await render(container, <Footer />);
                }
                export async function mountBrandProbe(container) {
                    await render(container, <BrandProbe />);
                }
                export async function failLogo(container) {
                    await act(async () => { container.querySelector('img').dispatchEvent(new Event('error')); });
                    await flush();
                }
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                    root = undefined;
                }
            `,
            resolveDir: root,
            sourcefile: 'site-settings-branding-harness.tsx',
            loader: 'tsx'
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        define: { 'process.env.NODE_ENV': '"test"' },
        plugins: [{
            name: 'site-settings-test-mocks',
            setup(buildApi) {
                buildApi.onResolve({ filter: /services\/api\/apiClient$/ }, () => ({ path: 'api-client', namespace: 'test-mock' }));
                buildApi.onLoad({ filter: /^api-client$/, namespace: 'test-mock' }, () => ({
                    loader: 'js',
                    contents: 'export default { get: (...args) => globalThis.__siteApi.get(...args), post: (...args) => globalThis.__siteApi.post(...args) };'
                }));
                buildApi.onResolve({ filter: /^react-hot-toast$/ }, () => ({ path: 'hot-toast', namespace: 'test-mock' }));
                buildApi.onLoad({ filter: /^hot-toast$/, namespace: 'test-mock' }, () => ({
                    loader: 'js',
                    contents: 'export default { success() {}, error() {} };'
                }));
            }
        }]
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

async function withDom(run) {
    const dom = new JSDOM('<!doctype html><html><head><meta name="description"><meta name="author"></head><body><div id="root"></div></body></html>', {
        url: 'http://localhost/',
        pretendToBeVisual: true
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
        IS_REACT_ACT_ENVIRONMENT: true
    };
    const previous = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });

    let harness;
    try {
        harness = await loadHarness();
        await run(harness, document.getElementById('root'));
    } finally {
        if (harness) await harness.unmount();
        delete globalThis.__siteApi;
        dom.window.close();
        for (const [key, descriptor] of previous) {
            if (descriptor) Object.defineProperty(globalThis, key, descriptor);
            else delete globalThis[key];
        }
    }
}

test('site settings fetch initially and refetch after a successful admin save', async () => {
    await withDom(async (harness, container) => {
        let publicSettings = { SITE_NAME: 'Initial Brand', SITE_URL: '', SITE_LOGO: '', SUPPORT_EMAIL: '', SUPPORT_PHONE: '' };
        let publicFetches = 0;
        globalThis.__siteApi = {
            async get(path) {
                if (path === '/settings/public') {
                    publicFetches += 1;
                    return { data: { success: true, data: publicSettings } };
                }
                if (path === '/admin/settings/business') {
                    return { data: { success: true, data: { ...publicSettings, REFERRAL_RATE: 0, APP_LOCK_TIMEOUT_MINUTES: 3 } } };
                }
                throw new Error(`Unexpected GET ${path}`);
            },
            async post(path) {
                assert.equal(path, '/admin/settings/business');
                publicSettings = { ...publicSettings, SITE_NAME: 'Saved Brand' };
                return { data: { success: true } };
            }
        };

        await harness.mountAdmin(container);
        assert.equal(container.querySelector('[data-testid="current-brand"]').textContent, 'Initial Brand');
        assert.equal(document.title, 'Initial Brand');

        await harness.saveAdmin(container);
        assert.equal(container.querySelector('[data-testid="current-brand"]').textContent, 'Saved Brand');
        assert.equal(document.title, 'Saved Brand');
        assert.ok(publicFetches >= 2, 'admin save must refetch public settings');
    });
});

test('footer renders configured identity, contacts, website, and broken-logo fallback', async () => {
    await withDom(async (harness, container) => {
        globalThis.__siteApi = {
            async get(path) {
                assert.equal(path, '/settings/public');
                return { data: { success: true, data: {
                    SITE_NAME: 'Acme Pay',
                    SITE_URL: 'https://acme.example',
                    SITE_LOGO: 'https://cdn.example/missing.png',
                    SUPPORT_EMAIL: 'help@acme.example',
                    SUPPORT_PHONE: '+234 800 123 4567'
                } } };
            },
            async post() { throw new Error('Unexpected POST'); }
        };

        await harness.mountFooter(container);
        assert.match(container.textContent, /Acme Pay/);
        assert.equal(container.querySelector('a[href="mailto:help@acme.example"]')?.textContent, 'help@acme.example');
        assert.equal(container.querySelector('a[href="tel:+234 800 123 4567"]')?.textContent, '+234 800 123 4567');
        assert.equal(container.querySelector('a[href="https://acme.example/"]')?.textContent, 'Public Website');
        assert.doesNotMatch(container.textContent, /support@zantara\.com|\+234 Support Line/);
        assert.equal(container.querySelector('img').getAttribute('src'), 'https://cdn.example/missing.png');

        await harness.failLogo(container);
        assert.equal(container.querySelector('img').getAttribute('src'), '/app_store_icon.webp');
    });
});

test('failed public settings preserve fallback branding', async () => {
    await withDom(async (harness, container) => {
        globalThis.__siteApi = {
            async get() { throw new Error('offline'); },
            async post() { throw new Error('Unexpected POST'); }
        };
        const originalError = console.error;
        console.error = () => {};
        try {
            await harness.mountBrandProbe(container);
        } finally {
            console.error = originalError;
        }

        assert.equal(container.querySelector('[data-testid="current-brand"]').textContent, 'Zantara');
        assert.equal(container.querySelector('img').getAttribute('src'), '/app_store_icon.webp');
        assert.equal(document.title, 'Zantara');
    });
});
