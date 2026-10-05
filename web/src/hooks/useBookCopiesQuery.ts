import {
	type BookCopy,
	BookCopyDefinition,
	type BookCopySortByInput,
	type BookCopyStatus,
	HttpResponseDefinition,
	type Paginated,
	PaginatedDefinition,
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

export interface BookCopiesInput {
	page?: number;
	pageSize?: number;
	id?: IdFilterInput;
	isbn?: StringFilterInput;
	status?: EnumFilterInput<BookCopyStatus>;
	bookId?: IdFilterInput;
	dateTimeCreated?: DateFilterInput;
	dateTimeUpdated?: DateFilterInput;
	sortBy?: BookCopySortByInput;
	sortOrder?: SortOrder;
}

const getQueryKey = (input?: BookCopiesInput): QueryKey => ['BookCopies', input ?? {}];
const getSearchParams = (input?: BookCopiesInput) => {
	const params = new URLSearchParams();

	if (input?.page != null) params.append('page', input.page.toString());
	if (input?.pageSize != null) params.append('pageSize', input.pageSize.toString());

	if (input?.id?.eq != null) params.append('id__eq', input.id.eq.toString());
	if (input?.id?.neq != null) params.append('id__neq', input.id.neq.toString());
	if (input?.id?.in != null)
		input.id.in.forEach((id) => void params.append('id__in', id.toString()));
	if (input?.id?.nin != null)
		input.id.nin.forEach((id) => void params.append('id__nin', id.toString()));

	if (input?.isbn?.eq != null) params.append('isbn__eq', input.isbn.eq);
	if (input?.isbn?.neq != null) params.append('isbn__neq', input.isbn.neq);
	if (input?.isbn?.in != null)
		input.isbn.in.forEach((isbn) => void params.append('isbn__in', isbn.toString()));
	if (input?.isbn?.nin != null)
		input.isbn.nin.forEach((isbn) => void params.append('isbn__nin', isbn.toString()));
	if (input?.isbn?.contains != null) params.append('isbn__contains', input.isbn.contains);

	if (input?.status?.eq != null) params.append('status__eq', input.status.eq);
	if (input?.status?.neq != null) params.append('status__neq', input.status.neq);
	if (input?.status?.in != null)
		input.status.in.forEach((status) => void params.append('status__in', status.toString()));
	if (input?.status?.nin != null)
		input.status.nin.forEach((status) => void params.append('status__nin', status.toString()));

	if (input?.bookId?.eq != null) params.append('bookId__eq', input.bookId.eq.toString());
	if (input?.bookId?.neq != null) params.append('bookId__neq', input.bookId.neq.toString());
	if (input?.bookId?.in != null)
		input.bookId.in.forEach((bookId) => void params.append('bookId__in', bookId.toString()));
	if (input?.bookId?.nin != null)
		input.bookId.nin.forEach((bookId) => void params.append('bookId__nin', bookId.toString()));

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
const getQueryFn = (input?: BookCopiesInput) => {
	return async (context?: {signal?: AbortSignal}) => {
		const res = await fetch(`${API_BASE_URL}/book-copies?${getSearchParams(input).toString()}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(PaginatedDefinition(BookCopyDefinition)).parse(
			await res.json(),
		);

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useBookCopiesQuery(
	input?: BookCopiesInput,
	options?: Pick<
		UseQueryOptions<Paginated<BookCopy>>,
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

useBookCopiesQuery.getQueryFn = getQueryFn;
useBookCopiesQuery.getQueryKey = getQueryKey;
useBookCopiesQuery.getSearchParams = getSearchParams;
