import {
	HttpResponseDefinition,
	type Paginated,
	PaginatedDefinition,
	type Reservation,
	ReservationDefinition,
	type ReservationSortByInput,
	type ReservationStatus,
	type SortOrder,
} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import type {
	DateFilterInput,
	EnumFilterInput,
	IdFilterInput,
	StringFilterInput,
} from '@/types/index';

export interface ReservationsInput {
	page?: number;
	pageSize?: number;
	bookId?: IdFilterInput;
	memberId?: IdFilterInput;
	status?: EnumFilterInput<ReservationStatus>;
	ticket?: StringFilterInput;
	isbn?: StringFilterInput;
	dateTimeCreated?: DateFilterInput;
	dateTimeUpdated?: DateFilterInput;
	sortBy?: ReservationSortByInput;
	sortOrder?: SortOrder;
}

const getQueryKey = (input?: ReservationsInput): QueryKey => ['Reservations', input ?? {}];
const getSearchParams = (input?: ReservationsInput) => {
	const params = new URLSearchParams();
	if (input?.page != null) params.append('page', input.page.toString());
	if (input?.pageSize != null) params.append('pageSize', input.pageSize.toString());
	for (const key of ['bookId', 'memberId'] as const) {
		const filter = input?.[key];
		if (filter?.eq != null) params.append(`${key}__eq`, filter.eq.toString());
		if (filter?.neq != null) params.append(`${key}__neq`, filter.neq.toString());
		filter?.in?.forEach((id) => void params.append(`${key}__in`, id.toString()));
		filter?.nin?.forEach((id) => void params.append(`${key}__nin`, id.toString()));
	}
	if (input?.status?.eq != null) params.append('status__eq', input.status.eq);
	if (input?.status?.neq != null) params.append('status__neq', input.status.neq);
	input?.status?.in?.forEach((status) => void params.append('status__in', status));
	input?.status?.nin?.forEach((status) => void params.append('status__nin', status));
	for (const key of ['ticket', 'isbn'] as const) {
		const filter = input?.[key];
		if (filter?.eq != null) params.append(`${key}__eq`, filter.eq);
		if (filter?.neq != null) params.append(`${key}__neq`, filter.neq);
		filter?.in?.forEach((value) => void params.append(`${key}__in`, value));
		filter?.nin?.forEach((value) => void params.append(`${key}__nin`, value));
		if (filter?.contains != null) params.append(`${key}__contains`, filter.contains);
	}
	for (const key of ['dateTimeCreated', 'dateTimeUpdated'] as const) {
		const filter = input?.[key];
		if (filter?.gt != null) params.append(`${key}__gt`, filter.gt.toISOString());
		if (filter?.gte != null) params.append(`${key}__gte`, filter.gte.toISOString());
		if (filter?.lt != null) params.append(`${key}__lt`, filter.lt.toISOString());
		if (filter?.lte != null) params.append(`${key}__lte`, filter.lte.toISOString());
	}
	if (input?.sortBy) params.append('sortBy', input.sortBy);
	if (input?.sortOrder) params.append('sortOrder', input.sortOrder);
	return params;
};
const getQueryFn = (input?: ReservationsInput) => {
	return async (context?: {signal?: AbortSignal}) => {
		const res = await fetch(`${API_BASE_URL}/reservations?${getSearchParams(input)}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(PaginatedDefinition(ReservationDefinition)).parse(
			await res.json(),
		);
		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useReservationsQuery(
	input?: ReservationsInput,
	options?: Pick<
		UseQueryOptions<Paginated<Reservation>>,
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
		queryKey: getQueryKey(input),
		queryFn: getQueryFn(input),
	});
}

useReservationsQuery.getQueryFn = getQueryFn;
useReservationsQuery.getQueryKey = getQueryKey;
useReservationsQuery.getSearchParams = getSearchParams;
