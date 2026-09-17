type RouteLocation = {
    pathname?: string;
    search?: string;
    hash?: string;
};

type LoginLocationState = {
    from?: RouteLocation;
};

type OwnedRouteState<T> = {
    ownerId: string;
    payload: T;
};

export function getSessionIdentity(user: { id?: unknown; _id?: unknown } | null | undefined) {
    const identity = user?.id || user?._id;
    return identity == null ? null : String(identity);
}

export function getPostLoginPath(state: LoginLocationState | null | undefined, fallback = '/app/wallet') {
    const from = state?.from;
    const pathname = from?.pathname;
    if (!pathname || !pathname.startsWith('/') || pathname.startsWith('//')) return fallback;
    return `${pathname}${from.search || ''}${from.hash || ''}`;
}

export function createOwnedRouteState<T>(ownerId: string | null | undefined, payload: T): OwnedRouteState<T> {
    return { ownerId: ownerId || '', payload };
}

export function readOwnedRouteState<T>(state: unknown, ownerId: string | null | undefined): T | null {
    if (!ownerId || !state || typeof state !== 'object') return null;
    const owned = state as Partial<OwnedRouteState<T>>;
    return owned.ownerId === ownerId ? owned.payload ?? null : null;
}
