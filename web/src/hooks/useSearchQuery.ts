import {HttpResponseDefinition, type SearchResult, SearchResultDefinition} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import * as z from 'zod';
import {API_BASE_URL} from '@/config/env';

const getQueryKey = (q: string): QueryKey => ['Search', q];

export function useSearchQuery(
	q: string,
	options?: Pick<
		UseQueryOptions<SearchResult[]>,
		| 'enabled'
		| 'gcTime'
		| 'staleTime'
		| 'initialData'
		| 'initialDataUpdatedAt'
		| 'placeholderData'
		| 'refetchInterval'
		| 'refetchOnMount'
		| 'refetchOnReconnect'
		| 'refetchOnWindowFocus'
		| 'retry'
		| 'retryDelay'
		| 'retryOnMount'
	>,
) {
	return useQuery({
		...options,
		queryKey: getQueryKey(q),
		queryFn: async ({signal}) => {
			const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(q)}`, {
				signal,
				credentials: 'include',
			});

			const obj = HttpResponseDefinition(z.array(SearchResultDefinition)).parse(await res.json());

			if (obj.ok) return obj.data;

			const err = new Error();
			err.name = obj.error.name;
			err.message = obj.error.message;

			throw err;
		},
		enabled: !!q && (options?.enabled ?? true),
	});
}

useSearchQuery.getQueryKey = getQueryKey;
