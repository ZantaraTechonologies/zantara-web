import assert from 'node:assert/strict';
import { after, afterEach, before, test } from 'node:test';
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
            close() { onmessage = null; },
        };
        this.port2 = {
            postMessage(data) { setTimeout(() => onmessage?.({ data }), 0); },
            close() {},
        };
    }
}

let dom;
let harness;

before(async () => {
    dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
        url: 'http://localhost/admin/settings',
        pretendToBeVisual: true,
    });
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.Event = dom.window.Event;
    globalThis.MouseEvent = dom.window.MouseEvent;
    globalThis.MessageChannel = TestMessageChannel;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import AdminOnboardingSettingsCard from './src/components/admin/AdminOnboardingSettingsCard.tsx';

                let appRoot;
                const flush = async () => act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
                const button = (container, text) => [...container.querySelectorAll('button')].find(candidate => candidate.textContent.includes(text));

                export async function mount(container) {
                    appRoot = createRoot(container);
                    await act(async () => { appRoot.render(<AdminOnboardingSettingsCard />); });
                    await flush();
                }
                export async function selectMode(container, mode) {
                    const select = container.querySelector('select[aria-label="Stored enforcement mode"]');
                    await act(async () => {
                        select.value = mode;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    await flush();
                }
                export async function click(container, text) {
                    const target = button(container, text);
                    if (!target) throw new Error('Button not found: ' + text);
                    await act(async () => { target.click(); });
                    await flush();
                }
                export async function unmount() {
                    if (appRoot) await act(async () => { appRoot.unmount(); });
                    appRoot = null;
                    document.getElementById('root').replaceChildren();
                }
            `,
            resolveDir: root,
            sourcefile: 'admin-onboarding-settings-entry.tsx',
            loader: 'tsx',
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        define: { 'process.env.NODE_ENV': '"test"' },
        plugins: [{
            name: 'admin-onboarding-settings-mocks',
            setup(builder) {
                builder.onResolve({ filter: /services[\\/]api[\\/]apiClient(?:\.js)?$/ }, () => ({ path: 'api-client', namespace: 'admin-onboarding' }));
                builder.onResolve({ filter: /^react-hot-toast$/ }, () => ({ path: 'toast', namespace: 'admin-onboarding' }));
                builder.onLoad({ filter: /.*/, namespace: 'admin-onboarding' }, ({ path }) => {
                    if (path === 'api-client') return { loader: 'js', contents: `
                        export default {
                            get: (...args) => globalThis.__adminOnboardingApi.get(...args),
                            put: (...args) => globalThis.__adminOnboardingApi.put(...args),
                        };
                    ` };
                    return { loader: 'js', contents: `
                        export default {
                            success: (message) => globalThis.__adminOnboardingToasts.push(['success', message]),
                            error: (message) => globalThis.__adminOnboardingToasts.push(['error', message]),
                        };
                    ` };
                });
            },
        }],
    });
    harness = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
});

afterEach(async () => {
    if (harness) await harness.unmount();
    delete globalThis.__adminOnboardingApi;
    delete globalThis.__adminOnboardingToasts;
});

after(() => {
    dom?.window.close();
});

const response = (overrides = {}) => ({
    success: true,
    data: {
        databaseMode: 'new_users',
        environmentCeilingMode: 'observe',
        effectiveMode: 'observe',
        policyVersion: 4,
        capped: true,
        ...overrides,
    },
});

test('SuperAdmin card is outside the business form and renders stored, ceiling, effective, version, and cap values', async () => {
    const pageSource = readFileSync(join(root, 'src/pages/admin/AdminSettingsPage.tsx'), 'utf8');
    assert.ok(pageSource.indexOf('<AdminOnboardingSettingsCard />') < pageSource.indexOf('<form onSubmit={handleSave}'));
    assert.doesNotMatch(pageSource.match(/apiClient\.post\('\/admin\/settings\/business',[\s\S]*?\);/)?.[0] || '', /onboarding|mode/i);

    globalThis.__adminOnboardingToasts = [];
    globalThis.__adminOnboardingApi = {
        get: async path => {
            assert.equal(path, '/admin/settings/onboarding');
            return { data: response() };
        },
        put: async () => { throw new Error('PUT should not be called'); },
    };

    const container = document.getElementById('root');
    await harness.mount(container);
    assert.match(container.textContent, /Stored mode\s*New users/);
    assert.match(container.textContent, /Environment ceiling\s*Observe/);
    assert.match(container.textContent, /Effective mode\s*Observe/);
    assert.match(container.textContent, /Policy version\s*4/);
    assert.match(container.textContent, /Environment cap active/);
    assert.deepEqual([...container.querySelectorAll('option')].map(option => option.value), ['off', 'observe', 'new_users']);
});

test('mode changes require confirmation, cancellation sends nothing, and confirmation sends the bound payload', async () => {
    const puts = [];
    globalThis.__adminOnboardingToasts = [];
    globalThis.__adminOnboardingApi = {
        get: async () => ({ data: response({ databaseMode: 'off', environmentCeilingMode: 'new_users', effectiveMode: 'off', capped: false }) }),
        put: async (path, body) => {
            puts.push([path, body]);
            return { data: response({ databaseMode: 'observe', environmentCeilingMode: 'new_users', effectiveMode: 'observe', capped: false }) };
        },
    };

    const container = document.getElementById('root');
    await harness.mount(container);
    await harness.selectMode(container, 'observe');
    await harness.click(container, 'Review mode change');
    assert.ok(container.querySelector('[role="dialog"]'));
    assert.equal(puts.length, 0);

    await harness.click(container, 'Cancel');
    assert.equal(container.querySelector('[role="dialog"]'), null);
    assert.equal(puts.length, 0);

    await harness.click(container, 'Review mode change');
    await harness.click(container, 'Confirm mode change');
    assert.deepEqual(puts, [[
        '/admin/settings/onboarding',
        {
            mode: 'observe',
            expectedCurrentMode: 'off',
            confirmOnboardingModeChange: 'off-to-observe',
        },
    ]]);
    assert.equal(container.querySelector('[role="dialog"]'), null);
    assert.match(container.textContent, /Stored mode\s*Observe/);
});

test('load and update failures stay within the onboarding card', async () => {
    globalThis.__adminOnboardingToasts = [];
    globalThis.__adminOnboardingApi = {
        get: async () => { throw { response: { data: { message: 'Policy read unavailable' } } }; },
        put: async () => { throw new Error('PUT should not be called'); },
    };

    const container = document.getElementById('root');
    await harness.mount(container);
    assert.match(container.querySelector('[role="alert"]').textContent, /Policy read unavailable/);
    await harness.unmount();

    globalThis.__adminOnboardingApi = {
        get: async () => ({ data: response({ databaseMode: 'off', environmentCeilingMode: 'new_users', effectiveMode: 'off', capped: false }) }),
        put: async () => { throw { response: { data: { message: 'Mode changed by another admin' } } }; },
    };
    await harness.mount(container);
    await harness.selectMode(container, 'new_users');
    await harness.click(container, 'Review mode change');
    await harness.click(container, 'Confirm mode change');
    assert.ok(container.querySelector('[role="dialog"]'));
    assert.match(container.querySelector('[role="alert"]').textContent, /Mode changed by another admin/);
});
