import {HttpResponseDefinition, type Stats, StatsDefinition} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';

export function useStatsQuery(
	options?: Pick<
		UseQueryOptions<Stats>,
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
		queryKey: getQueryKey(),
		queryFn: async ({signal}) => {
			const res = await fetch(`${API_BASE_URL}/stats`, {
				signal,
				credentials: 'include',
			});

			const obj = HttpResponseDefinition(StatsDefinition).parse(await res.json());

			if (obj.ok) return obj.data;

			const err = new Error();
			err.name = obj.error.name;
			err.message = obj.error.message;
			throw err;
		},
	});
}

const getQueryKey = (): QueryKey => ['Stats'];

useStatsQuery.getQueryKey = getQueryKey;
