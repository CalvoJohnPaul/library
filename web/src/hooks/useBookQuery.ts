import {type Book, BookDefinition, HttpResponseDefinition} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';

const getQueryKey = (id?: number | null): QueryKey => ['Book', {id}];
const getQueryFn = (id?: number | null) => {
	return async (context?: {signal?: AbortSignal}) => {
		const res = await fetch(`${API_BASE_URL}/books/${id}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(BookDefinition).parse(await res.json());

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useBookQuery(
	id?: number | null,
	options?: Pick<
		UseQueryOptions<Book>,
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
		queryKey: getQueryKey(id),
		queryFn: getQueryFn(id),
		enabled: id != null && (options?.enabled ?? true),
	});
}

useBookQuery.getQueryFn = getQueryFn;
useBookQuery.getQueryKey = getQueryKey;
