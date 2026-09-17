import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';

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

async function loadBoundary() {
    try {
        const result = await build({
            entryPoints: [join(root, 'src', 'components', 'errors', 'AppErrorBoundary.tsx')],
            bundle: true,
            format: 'esm',
            platform: 'browser',
            write: false
        });
        return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
    } catch (error) {
        assert.fail(`AppErrorBoundary is unavailable: ${error.message}`);
    }
}

async function loadRenderedBoundaryHarness() {
    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import { MemoryRouter, Routes, Route } from 'react-router-dom';
                import AppErrorBoundary from './src/components/errors/AppErrorBoundary.tsx';

                let root;
                function ThrowingDescendant() {
                    throw new Error('PRIVATE_RENDER_SECRET');
                }
                function BrokenRoute() {
                    return <div data-private-child="true">PRIVATE CHILD<ThrowingDescendant /></div>;
                }
                export async function mount(container) {
                    root = createRoot(container);
                    await act(async () => {
                        root.render(
                            <MemoryRouter initialEntries={['/broken']}>
                                <AppErrorBoundary>
                                    <Routes>
                                        <Route path="/broken" element={<BrokenRoute />} />
                                    </Routes>
                                </AppErrorBoundary>
                            </MemoryRouter>
                        );
                    });
                }
                export async function retry(container) {
                    const button = [...container.querySelectorAll('button')].find((candidate) => candidate.textContent.includes('Retry'));
                    if (!button) throw new Error('Recovery control not rendered');
                    await act(async () => { button.click(); });
                }
                export async function unmount() {
                    if (root) await act(async () => { root.unmount(); });
                }
            `,
            resolveDir: root,
            sourcefile: 'batch2d-error-boundary-entry.tsx',
            loader: 'tsx'
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        write: false,
        define: { 'process.env.NODE_ENV': '"test"' }
    });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}

function flattenText(node) {
    if (node == null || typeof node === 'boolean') return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(flattenText).join(' ');
    return flattenText(node.props?.children);
}

function findButton(node) {
    if (!node || typeof node !== 'object') return null;
    if (node.type === 'button') return node;
    const children = Array.isArray(node.props?.children) ? node.props.children : [node.props?.children];
    for (const child of children) {
        const result = findButton(child);
        if (result) return result;
    }
    return null;
}

test('C12 render failures produce a safe first-party fallback without exposing error details', async () => {
    const module = await loadBoundary();
    const Boundary = module.default || module.AppErrorBoundary;
    const secret = 'private-token-and-stack-trace';
    const boundary = new Boundary({ children: 'private child' });
    boundary.state = Boundary.getDerivedStateFromError(new Error(secret));

    const fallback = boundary.render();
    const visibleText = flattenText(fallback);

    assert.match(visibleText, /something went wrong/i);
    assert.doesNotMatch(visibleText, new RegExp(secret));
});

test('C13 the route-tree boundary offers recovery and wraps routed rendering', async () => {
    const module = await loadBoundary();
    const Boundary = module.default || module.AppErrorBoundary;
    const boundary = new Boundary({ children: 'private child' });
    boundary.state = Boundary.getDerivedStateFromError(new Error('boom'));
    let reloads = 0;
    globalThis.window = { location: { reload: () => { reloads += 1; } } };

    const retry = findButton(boundary.render());
    assert.ok(retry?.props?.onClick, 'fallback must expose a recovery action');
    retry.props.onClick();
    assert.equal(reloads, 1, 'recovery must start a clean browser render');

    const routes = readFileSync(join(root, 'src', 'routes', 'AppRoutes.jsx'), 'utf8');
    assert.match(routes, /<AppErrorBoundary>[\s\S]*<Routes>[\s\S]*<\/AppErrorBoundary>/);
});

test('C12/C13 rendered route descendant failure is caught with a safe recoverable fallback', async () => {
    const virtualConsole = new VirtualConsole();
    const jsdomErrors = [];
    virtualConsole.on('jsdomError', (error) => { jsdomErrors.push(error); });
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
        url: 'http://localhost/broken',
        pretendToBeVisual: true,
        virtualConsole
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
    const previous = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const [key, value] of Object.entries(globals)) {
        Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const originalError = console.error;
    console.error = () => {};
    let harness;

    try {
        harness = await loadRenderedBoundaryHarness();
        const container = document.getElementById('root');
        await harness.mount(container);

        assert.match(container.textContent, /Application Recovery/);
        assert.match(container.textContent, /Something went wrong/);
        assert.match(container.textContent, /Retry/);
        assert.equal(container.querySelector('a[href="/app"]')?.textContent, 'Dashboard');
        assert.doesNotMatch(container.textContent, /PRIVATE_RENDER_SECRET/);
        assert.doesNotMatch(container.textContent, /PRIVATE CHILD/);
        assert.doesNotMatch(container.textContent, /ThrowingDescendant|\bat\s+\w/);
        assert.equal(container.querySelector('[data-private-child]'), null);

        await harness.retry(container);
        assert.equal(jsdomErrors.filter((error) => /navigation/i.test(error.message)).length, 1);
    } finally {
        try {
            if (harness) await harness.unmount();
        } finally {
            console.error = originalError;
            dom.window.close();
            for (const [key, descriptor] of previous) {
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else delete globalThis[key];
            }
        }
    }
});
