import {type Account, AccountDefinition, HttpResponseDefinition} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';

export function useMeQuery(
	options?: Pick<
		UseQueryOptions<Account | null>,
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
		queryFn: async ({signal}) => {
			const res = await fetch(`${API_BASE_URL}/me`, {
				signal,
				credentials: 'include',
			});

			const obj = HttpResponseDefinition(AccountDefinition.nullable()).parse(await res.json());

			if (obj.ok) return obj.data;

			const err = new Error();
			err.name = obj.error.name;
			err.message = obj.error.message;
			throw err;
		},
	});
}

const getQueryKey = (): QueryKey => ['Me'];

useMeQuery.getQueryKey = getQueryKey;
