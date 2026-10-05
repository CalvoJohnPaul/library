import {
	HttpResponseDefinition,
	type Paginated,
	PaginatedDefinition,
	type SortOrder,
	type Member,
	MemberDefinition,
	type MemberSortByInput,
} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import type {DateFilterInput, IdFilterInput, StringFilterInput} from '@/types/index';

export interface MembersInput {
	page?: number;
	pageSize?: number;
	id?: IdFilterInput;
	externalId?: StringFilterInput;
	name?: StringFilterInput;
	course?: StringFilterInput;
	yearAndSection?: StringFilterInput;
	dateTimeLastBorrowedBook?: DateFilterInput;
	dateTimeCreated?: DateFilterInput;
	dateTimeUpdated?: DateFilterInput;
	sortBy?: MemberSortByInput;
	sortOrder?: SortOrder;
}

const getQueryKey = (input?: MembersInput): QueryKey => ['Members', input ?? {}];
const getQueryParams = (input?: MembersInput) => {
	const params = new URLSearchParams();

	if (input?.page != null) params.append('page', input.page.toString());
	if (input?.pageSize != null) params.append('pageSize', input.pageSize.toString());

	if (input?.id?.eq != null) params.append('id__eq', input.id.eq.toString());
	if (input?.id?.neq != null) params.append('id__neq', input.id.neq.toString());
	if (input?.id?.in != null)
		input.id.in.forEach((id) => void params.append('id__in', id.toString()));
	if (input?.id?.nin != null)
		input.id.nin.forEach((id) => void params.append('id__nin', id.toString()));

	if (input?.externalId?.eq != null) params.append('externalId__eq', input.externalId.eq);
	if (input?.externalId?.neq != null) params.append('externalId__neq', input.externalId.neq);
	if (input?.externalId?.in != null)
		input.externalId.in.forEach(
			(externalId) => void params.append('externalId__in', externalId.toString()),
		);
	if (input?.externalId?.nin != null)
		input.externalId.nin.forEach(
			(externalId) => void params.append('externalId__nin', externalId.toString()),
		);
	if (input?.externalId?.contains != null)
		params.append('externalId__contains', input.externalId.contains);

	if (input?.name?.eq != null) params.append('name__eq', input.name.eq);
	if (input?.name?.neq != null) params.append('name__neq', input.name.neq);
	if (input?.name?.in != null)
		input.name.in.forEach((name) => void params.append('name__in', name.toString()));
	if (input?.name?.nin != null)
		input.name.nin.forEach((name) => void params.append('name__nin', name.toString()));
	if (input?.name?.contains != null) params.append('name__contains', input.name.contains);

	if (input?.course?.eq != null) params.append('course__eq', input.course.eq);
	if (input?.course?.neq != null) params.append('course__neq', input.course.neq);
	if (input?.course?.in != null)
		input.course.in.forEach((course) => void params.append('course__in', course.toString()));
	if (input?.course?.nin != null)
		input.course.nin.forEach((course) => void params.append('course__nin', course.toString()));
	if (input?.course?.contains != null) params.append('course__contains', input.course.contains);

	if (input?.yearAndSection?.eq != null)
		params.append('yearAndSection__eq', input.yearAndSection.eq);
	if (input?.yearAndSection?.neq != null)
		params.append('yearAndSection__neq', input.yearAndSection.neq);
	if (input?.yearAndSection?.in != null)
		input.yearAndSection.in.forEach(
			(yearAndSection) => void params.append('yearAndSection__in', yearAndSection.toString()),
		);
	if (input?.yearAndSection?.nin != null)
		input.yearAndSection.nin.forEach(
			(yearAndSection) => void params.append('yearAndSection__nin', yearAndSection.toString()),
		);
	if (input?.yearAndSection?.contains != null)
		params.append('yearAndSection__contains', input.yearAndSection.contains);

	if (input?.dateTimeLastBorrowedBook?.gt != null)
		params.append('dateTimeLastBorrowedBook__gt', input.dateTimeLastBorrowedBook.gt.toISOString());
	if (input?.dateTimeLastBorrowedBook?.gte != null)
		params.append(
			'dateTimeLastBorrowedBook__gte',
			input.dateTimeLastBorrowedBook.gte.toISOString(),
		);
	if (input?.dateTimeLastBorrowedBook?.lt != null)
		params.append('dateTimeLastBorrowedBook__lt', input.dateTimeLastBorrowedBook.lt.toISOString());
	if (input?.dateTimeLastBorrowedBook?.lte != null)
		params.append(
			'dateTimeLastBorrowedBook__lte',
			input.dateTimeLastBorrowedBook.lte.toISOString(),
		);

	if (input?.dateTimeCreated?.gt != null)
		params.append('dateTimeCreated__gt', input.dateTimeCreated.gt.toISOString());
	if (input?.dateTimeCreated?.gte != null)
		params.append('dateTimeCreated__gte', input.dateTimeCreated.gte.toISOString());
	if (input?.dateTimeCreated?.lt != null)
		params.append('dateTimeCreated__lt', input.dateTimeCreated.lt.toISOString());
	if (input?.dateTimeCreated?.lte != null)
		params.append('dateTimeCreated__lte', input.dateTimeCreated.lte.toISOString());

	if (input?.dateTimeUpdated?.gt != null)
		params.append('dateTimeUpdated__gt', input.dateTimeUpdated.gt.toISOString());
	if (input?.dateTimeUpdated?.gte != null)
		params.append('dateTimeUpdated__gte', input.dateTimeUpdated.gte.toISOString());
	if (input?.dateTimeUpdated?.lt != null)
		params.append('dateTimeUpdated__lt', input.dateTimeUpdated.lt.toISOString());
	if (input?.dateTimeUpdated?.lte != null)
		params.append('dateTimeUpdated__lte', input.dateTimeUpdated.lte.toISOString());

	if (input?.sortBy) params.append('sortBy', input.sortBy);
	if (input?.sortOrder) params.append('sortOrder', input.sortOrder);

	return params;
};
const getQueryFn = (input?: MembersInput) => {
	return async (context?: {signal?: AbortSignal}) => {
		const res = await fetch(`${API_BASE_URL}/members?${getQueryParams(input).toString()}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(PaginatedDefinition(MemberDefinition)).parse(
			await res.json(),
		);

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useMembersQuery(
	input?: MembersInput,
	options?: Pick<
		UseQueryOptions<Paginated<Member>>,
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
		queryKey: getQueryKey(input),
		queryFn: getQueryFn(input),
	});
}

useMembersQuery.getQueryFn = getQueryFn;
useMembersQuery.getQueryKey = getQueryKey;
useMembersQuery.getQueryParams = getQueryParams;
