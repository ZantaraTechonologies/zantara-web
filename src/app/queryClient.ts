import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
        },
    },
});

export const privateQueryKey = (identity: string | null | undefined, ...parts: unknown[]) => (
    ['private', identity || 'unresolved', ...parts] as const
);
