import {QueryClient} from '@tanstack/react-query';

export const client = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: /* 1hr */ 1000 * 60 * 60,
			staleTime: /* 10m */ 1000 * 60 * 10,
			refetchOnMount: 'always',
			refetchOnReconnect: 'always',
			refetchOnWindowFocus: 'always',
			retry: 3,
		},
	},
});
