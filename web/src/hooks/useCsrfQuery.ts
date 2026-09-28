import {type Csrf, CsrfDefinition, HttpResponseDefinition} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/constants';

const getQueryKey = (): QueryKey => ['Csrf'];
const getQueryFn = () => {
	return async (context?: {signal?: AbortSignal}) => {
		const res = await fetch(`${API_BASE_URL}/csrf`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(CsrfDefinition).parse(await res.json());

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useCsrfQuery(
	options?: Pick<
		UseQueryOptions<Csrf>,
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
		queryKey: getQueryKey(),
		queryFn: getQueryFn(),
		gcTime: 0,
		staleTime: 0,
		refetchOnMount: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
	});
}

useCsrfQuery.getQueryFn = getQueryFn;
useCsrfQuery.getQueryKey = getQueryKey;
