import {HttpResponseDefinition, type MemberStats, MemberStatsDefinition} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';

export function useMemberStatsQuery(
	id: number,
	options?: Pick<
		UseQueryOptions<MemberStats>,
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
		queryFn: async ({signal}) => {
			const res = await fetch(`${API_BASE_URL}/members/${id}/stats`, {
				signal,
				credentials: 'include',
			});
			const obj = HttpResponseDefinition(MemberStatsDefinition).parse(await res.json());
			if (obj.ok) return obj.data;

			const err = new Error();
			err.name = obj.error.name;
			err.message = obj.error.message;
			throw err;
		},
	});
}

const getQueryKey = (id?: number): QueryKey => ['MemberStats', {id}];

useMemberStatsQuery.getQueryKey = getQueryKey;
