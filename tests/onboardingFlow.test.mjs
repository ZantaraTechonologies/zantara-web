import { after, afterEach, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import {
    buildRegistrationPayload,
    getOnboardingPath,
    resolvePostAuthPath,
    shouldRestrictDashboard,
    validateBasicKyc,
    validatePin,
    validateRegistration,
} from '../src/utils/onboarding.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = relative => readFileSync(join(root, relative), 'utf8');

const completeState = {
    policyVersion: 1,
    mode: 'new_users',
    enrolled: true,
    enforced: true,
    status: 'complete',
    currentStep: 'complete',
    complete: true,
    dashboardAllowed: true,
};

const incompleteState = step => ({
    ...completeState,
    status: 'incomplete',
    currentStep: step,
    complete: false,
    dashboardAllowed: false,
});

test('registration validates profile, password confirmation, and Nigerian phone format', () => {
    const mismatch = validateRegistration({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '08012345678',
        password: 'Passw0rd!',
        confirmPassword: 'different',
    });
    assert.equal(mismatch.valid, false);
    assert.equal(mismatch.errors.confirmPassword, 'Passwords do not match.');

    const invalidPhone = validateRegistration({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+15550000000',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
    });
    assert.equal(invalidPhone.valid, false);
    assert.match(invalidPhone.errors.phone, /Nigerian/);
});

test('registration payload preserves an optional referral and sends confirmation only to the API', () => {
    const payload = buildRegistrationPayload({
        name: ' Ada   Lovelace ',
        email: 'ADA@example.com ',
        phone: '+2348012345678',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
        referrerCode: ' friend ',
    }, [{ documentType: 'terms', version: 2, contentHash: 'hash', channel: 'web' }]);

    assert.equal(payload.name, 'Ada Lovelace');
    assert.equal(payload.email, 'ada@example.com');
    assert.equal(payload.referrerCode, 'friend');
    assert.equal(payload.confirmPassword, 'Passw0rd!');
    const registerSource = source('src/pages/auth/UserRegisterPage.tsx');
    assert.doesNotMatch(registerSource, /localStorage.*confirmPassword|sessionStorage.*confirmPassword/);
});

test('authoritative resolver maps every interrupted step and completed onboarding', () => {
    assert.equal(resolvePostAuthPath(incompleteState('basic_kyc')), '/onboarding/basic-kyc');
    assert.equal(resolvePostAuthPath(incompleteState('contact_verification')), '/onboarding/contact-verification');
    assert.equal(resolvePostAuthPath(incompleteState('legal_acceptance')), '/onboarding/legal-acceptance');
    assert.equal(resolvePostAuthPath(incompleteState('transaction_pin')), '/onboarding/transaction-pin');
    assert.equal(resolvePostAuthPath(completeState, '/app/transactions'), '/app/transactions');
});

test('missing or unavailable authoritative state never resolves to the dashboard', () => {
    assert.equal(resolvePostAuthPath(null), '/onboarding/unavailable');
    assert.equal(getOnboardingPath({ ...incompleteState('legal_acceptance'), status: 'unavailable' }), '/onboarding/unavailable');
    assert.equal(shouldRestrictDashboard(null), true);
});

test('off, observe, and legacy not-applicable states preserve requested navigation', () => {
    for (const state of [
        { ...incompleteState('contact_verification'), mode: 'off', enforced: false, dashboardAllowed: true },
        { ...incompleteState('contact_verification'), mode: 'observe', enforced: false, observed: true, dashboardAllowed: true },
        { ...incompleteState(null), enrolled: false, enforced: false, status: 'not_applicable', dashboardAllowed: true },
    ]) {
        assert.equal(resolvePostAuthPath(state, '/app/referral'), '/app/referral');
        assert.equal(shouldRestrictDashboard(state), false);
    }
});

test('Basic KYC collects only the approved profile fields', () => {
    assert.equal(validateBasicKyc({ name: 'Ada Lovelace', email: 'ada@example.com', phone: '08012345678' }).valid, true);
    const pageSource = source('src/pages/onboarding/UserOnboardingPage.tsx');
    assert.match(pageSource, /updateProfile\(validation\.values\)/);
    assert.doesNotMatch(pageSource, /name="(?:bvn|nin|dateOfBirth|address|document)"/i);
    assert.doesNotMatch(pageSource, /uploadKYC/);
});

test('contact verification uses real backend OTP endpoints with controlled resend', () => {
    const serviceSource = source('src/services/onboarding/onboardingService.ts');
    assert.match(serviceSource, /\/auth\/send-otp/);
    assert.match(serviceSource, /\/auth\/verify-otp/);
    assert.match(serviceSource, /\/auth\/email\/send-otp/);
    assert.match(serviceSource, /\/auth\/email\/verify-otp/);
    const pageSource = source('src/pages/onboarding/UserOnboardingPage.tsx');
    assert.match(pageSource, /setCooldown\(60\)/);
    assert.match(pageSource, /refreshOnboarding\(true\)/);
});

test('legal onboarding requests only missing documents and registration acceptance remains intact', () => {
    const pageSource = source('src/pages/onboarding/UserOnboardingPage.tsx');
    const registerSource = source('src/pages/auth/UserRegisterPage.tsx');
    assert.match(pageSource, /filter\(document => document\.acceptanceRequired\)/);
    assert.match(pageSource, /acceptLegalDocument\(document\)/);
    assert.match(registerSource, /legal\/documents\/current/);
    assert.match(registerSource, /legalAcceptances/);
});

test('PIN validation requires matching four-digit values and neither PIN nor OTP is persisted or logged', () => {
    assert.equal(validatePin('1234', '1234'), null);
    assert.match(validatePin('1234', '4321'), /do not match/);
    assert.match(validatePin('123', '123'), /4-digit/);
    const pageSource = source('src/pages/onboarding/UserOnboardingPage.tsx');
    assert.match(pageSource, /setupPin\(\{ pin, confirmPin \}\)/);
    assert.match(pageSource, /autoComplete="off" data-lpignore="true" data-1p-ignore/);
    assert.doesNotMatch(pageSource, /localStorage|sessionStorage|console\.(?:log|info|error)/);
    assert.doesNotMatch(source('src/pages/auth/UserLoginPage.tsx'), /console\.(?:log|info|error)/);
});

test('session restoration hydrates onboarding from login, registration, and auth me', () => {
    const storeSource = source('src/store/auth/authStore.js');
    assert.match(storeSource, /setAuth\(user, token, rememberMe, data\.onboarding/);
    assert.match(storeSource, /setAuth\(user, token, localStorage\.getItem\('token'\) === token, data\.onboarding\)/);
    assert.match(storeSource, /refreshOnboarding/);
    assert.match(source('src/services/auth/authService.ts'), /\/onboarding\/status/);
});

test('403 and onboarding 503 responses update authoritative routing state without global dashboard fallback', () => {
    const apiSource = source('src/services/api/apiClient.js');
    assert.match(apiSource, /ONBOARDING_INCOMPLETE/);
    assert.match(apiSource, /ONBOARDING_STATE_UNAVAILABLE/);
    assert.match(apiSource, /ONBOARDING_DEPENDENCY_UNAVAILABLE/);
    assert.match(apiSource, /authoritativeOnboarding/);
    assert.match(apiSource, /setOnboarding\(authoritativeOnboarding\)/);
    assert.match(apiSource, /requestIsCurrent/);
    assert.doesNotMatch(apiSource, /ONBOARDING_(?:INCOMPLETE|STATE_UNAVAILABLE)[\s\S]{0,300}window\.location\.href\s*=\s*['"]\/app/);
});

test('onboarding routes render outside DashboardLayout and recovery callbacks remain exempt', () => {
    const routesSource = source('src/routes/AppRoutes.jsx');
    assert.ok(routesSource.indexOf('path="/onboarding"') < routesSource.indexOf('path="/app"'));
    assert.match(routesSource, /ProtectedRoute allowRecovery/);
    assert.match(routesSource, /ProtectedRoute allowOnboarding/);
    assert.doesNotMatch(source('src/pages/onboarding/UserOnboardingPage.tsx'), /DashboardLayout|walletService|useWalletStore/);
});

let dom;
let harness;

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

before(async () => {
    dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' });
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.MessageChannel = TestMessageChannel;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const mocks = {
        name: 'onboarding-guard-mocks',
        setup(builder) {
            builder.onResolve({ filter: /store[\/]auth[\/]authStore(?:\.js)?$/ }, () => ({ path: 'auth-store', namespace: 'onboarding-guard' }));
            builder.onResolve({ filter: /components[\/]feedback[\/]Skeletons(?:\.[jt]sx?)?$/ }, () => ({ path: 'loader', namespace: 'onboarding-guard' }));
            builder.onLoad({ filter: /.*/, namespace: 'onboarding-guard' }, ({ path }) => {
                if (path === 'auth-store') return { loader: 'js', contents: 'export const useAuthStore = () => globalThis.__onboardingGuardState;' };
                return { loader: 'jsx', contents: 'export const PageLoader = () => <div data-route="loading">Loading</div>;' };
            });
        },
    };

    const result = await build({
        stdin: {
            contents: `
                import React, { act } from 'react';
                import { createRoot } from 'react-dom/client';
                import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
                import ProtectedRoute from './src/routes/guards/ProtectedRoute.jsx';

                let appRoot;
                function Dashboard() { globalThis.__dashboardMounts++; return <div data-route="dashboard">Dashboard</div>; }
                function Onboarding() { const location = useLocation(); return <div data-route="onboarding">{location.pathname}</div>; }

                export async function mount(initialPath, state) {
                    globalThis.__dashboardMounts = 0;
                    globalThis.__onboardingGuardState = state;
                    appRoot = createRoot(document.getElementById('root'));
                    await act(async () => {
                        appRoot.render(
                            <MemoryRouter initialEntries={[initialPath]}>
                                <Routes>
                                    <Route path="/app/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                                    <Route path="/app/profile/security/pin" element={<div data-route="legacy-pin">Legacy PIN</div>} />
                                    <Route path="/onboarding/:step" element={<Onboarding />} />
                                    <Route path="/login" element={<div data-route="login">Login</div>} />
                                </Routes>
                            </MemoryRouter>
                        );
                    });
                    await act(async () => { await Promise.resolve(); });
                    return {
                        route: document.getElementById('root').firstElementChild?.getAttribute('data-route'),
                        text: document.getElementById('root').textContent,
                        dashboardMounts: globalThis.__dashboardMounts,
                    };
                }

                export async function unmount() {
                    if (appRoot) await act(async () => { appRoot.unmount(); });
                    appRoot = null;
                    document.getElementById('root').replaceChildren();
                }
            `,
            resolveDir: root,
            sourcefile: 'onboarding-guard-entry.tsx',
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
    harness = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
});

afterEach(async () => {
    if (harness) await harness.unmount();
});

after(() => {
    dom?.window.close();
});

const guardState = onboarding => ({
    user: { id: 'user-1', isPinSet: true },
    isAuthenticated: true,
    isInitialized: true,
    fetchMe: async () => {},
    refreshOnboarding: async () => onboarding,
    onboarding,
    onboardingStatus: 'ready',
});

test('direct dashboard access redirects an enrolled incomplete user before dashboard mounts', async () => {
    const result = await harness.mount('/app/transactions', guardState(incompleteState('contact_verification')));
    assert.equal(result.route, 'onboarding');
    assert.equal(result.text, '/onboarding/contact-verification');
    assert.equal(result.dashboardMounts, 0);
});

test('off and observe modes retain the existing PIN requirement for pinless legacy users', async () => {
    for (const mode of ['off', 'observe']) {
        const state = guardState({
            ...incompleteState('contact_verification'),
            mode,
            enforced: false,
            dashboardAllowed: true,
        });
        state.user = { id: 'legacy-user', isPinSet: false };
        const result = await harness.mount('/app', state);
        assert.equal(result.route, 'legacy-pin');
        assert.equal(result.dashboardMounts, 0);
        await harness.unmount();
    }
});

test('completed and legacy users access the dashboard without redirect loops', async () => {
    const complete = await harness.mount('/app', guardState(completeState));
    assert.equal(complete.route, 'dashboard');
    assert.equal(complete.dashboardMounts, 1);
    await harness.unmount();

    const legacy = await harness.mount('/app', guardState({
        ...incompleteState(null),
        mode: 'new_users',
        enrolled: false,
        enforced: false,
        status: 'not_applicable',
        dashboardAllowed: true,
    }));
    assert.equal(legacy.route, 'dashboard');
    assert.equal(legacy.dashboardMounts, 1);
});

test('an unavailable onboarding state routes to a safe retry screen and never mounts dashboard', async () => {
    const result = await harness.mount('/app', guardState({
        ...incompleteState(null),
        status: 'unavailable',
        code: 'ONBOARDING_STATE_UNAVAILABLE',
    }));
    assert.equal(result.text, '/onboarding/unavailable');
    assert.equal(result.dashboardMounts, 0);
});
