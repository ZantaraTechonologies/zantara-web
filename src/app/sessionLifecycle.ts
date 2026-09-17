import { queryClient } from './queryClient';

type SessionReset = () => void;

export type SessionRequestContext = {
    epoch: number;
    token: string | null;
};

const resetters = new Map<string, SessionReset>();
let sessionEpoch = 0;
let requestController = new AbortController();
let storageSyncInstalled = false;

function readToken() {
    if (typeof localStorage === 'undefined' || typeof sessionStorage === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function clearCredentials() {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('token');
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('token');
}

function rotateSession(removeCredentials: boolean) {
    sessionEpoch += 1;
    requestController.abort();
    requestController = new AbortController();

    void queryClient.cancelQueries();
    queryClient.clear();
    if (removeCredentials) clearCredentials();

    for (const reset of resetters.values()) reset();
    return sessionEpoch;
}

export function registerSessionReset(name: string, reset: SessionReset) {
    resetters.set(name, reset);
    return () => resetters.delete(name);
}

export function beginAuthenticatedSession() {
    return rotateSession(true);
}

export function adoptAuthenticatedIdentity() {
    return rotateSession(false);
}

export function teardownSession() {
    return rotateSession(true);
}

export function synchronizeExternalSession() {
    return rotateSession(false);
}

export function reloadForExternalSession() {
    synchronizeExternalSession();
    window.location.reload();
}

export function installSessionStorageSync() {
    if (storageSyncInstalled || typeof window === 'undefined') return;
    storageSyncInstalled = true;
    window.addEventListener('storage', (event) => {
        if (event.key !== 'token' || event.storageArea !== localStorage) return;
        reloadForExternalSession();
    });
}

export function getSessionEpoch() {
    return sessionEpoch;
}

export function isSessionEpochCurrent(epoch: number) {
    return epoch === sessionEpoch;
}

export function getSessionRequestSignal() {
    return requestController.signal;
}

export function captureSessionRequest(token = readToken()): SessionRequestContext {
    return { epoch: sessionEpoch, token };
}

export function isSessionRequestCurrent(context?: SessionRequestContext | null) {
    if (!context) return false;
    return context.epoch === sessionEpoch && context.token === readToken();
}
