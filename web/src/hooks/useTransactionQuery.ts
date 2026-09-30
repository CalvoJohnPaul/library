import {HttpResponseDefinition, type Transaction, TransactionDefinition} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';

const getQueryKey = (id?: number | null): QueryKey => ['Transaction', {id}];
const getQueryFn = (id?: number | null) => {
	return async (context?: {signal?: AbortSignal}) => {
		const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(TransactionDefinition).parse(await res.json());

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useTransactionQuery(
	id?: number | null,
	options?: Pick<
		UseQueryOptions<Transaction>,
		| 'enabled'
		| 'gcTime'
		| 'staleTime'
		| 'initialData'
		| 'initialDataUpdatedAt'
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

useTransactionQuery.getQueryFn = getQueryFn;
useTransactionQuery.getQueryKey = getQueryKey;
