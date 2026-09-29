import {HttpResponseDefinition, type Student, StudentDefinition} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/constants';

const getQueryKey = (id?: number | null): QueryKey => ['Student', {id}];
const getQueryFn = (id?: number | null) => {
	return async (context?: {signal?: AbortSignal}) => {
		const res = await fetch(`${API_BASE_URL}/students/${id}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(StudentDefinition).parse(await res.json());

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useStudentQuery(
	id?: number | null,
	options?: Pick<
		UseQueryOptions<Student>,
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

useStudentQuery.getQueryFn = getQueryFn;
useStudentQuery.getQueryKey = getQueryKey;
