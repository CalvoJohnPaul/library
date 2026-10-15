import {type BookCopy, BookCopyDefinition, HttpResponseDefinition} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';

const getQueryKey = (id?: number | null): QueryKey => ['BookCopy', {id}];
const getQueryFn = (id?: number | null) => {
	return async (context?: {signal?: AbortSignal}) => {
		const res = await fetch(`${API_BASE_URL}/book-copies/${id}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(BookCopyDefinition).parse(await res.json());

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useBookCopyQuery(
	id?: number | null,
	options?: Pick<
		UseQueryOptions<BookCopy>,
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

useBookCopyQuery.getQueryFn = getQueryFn;
useBookCopyQuery.getQueryKey = getQueryKey;
