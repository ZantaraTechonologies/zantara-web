import { useAuthStore } from '../store/auth/authStore';

export function usePrivateQueryContext() {
    const user = useAuthStore((state) => state.user);
    const authenticated = useAuthStore((state) => state.isAuthenticated);
    const userId = user?.id || user?._id || null;

    return {
        userId,
        isAuthenticated: authenticated && !!userId,
    };
}
