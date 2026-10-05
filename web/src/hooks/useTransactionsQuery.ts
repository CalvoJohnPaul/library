import {
	HttpResponseDefinition,
	type Paginated,
	PaginatedDefinition,
	type SortOrder,
	type Transaction,
	TransactionDefinition,
	type TransactionSortByInput,
	type TransactionStatus,
	type TransactionType,
} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import type {
	DateFilterInput,
	EnumFilterInput,
	IdFilterInput,
	StringFilterInput,
} from '@/types/index';

export interface TransactionsInput {
	page?: number;
	pageSize?: number;
	id?: IdFilterInput;
	type?: EnumFilterInput<TransactionType>;
	status?: EnumFilterInput<TransactionStatus>;
	ticket?: StringFilterInput;
	studentId?: IdFilterInput;
	bookCopyId?: IdFilterInput;
	bookId?: IdFilterInput;
	isbn?: StringFilterInput;
	dateTimeCreated?: DateFilterInput;
	dateTimeUpdated?: DateFilterInput;
	sortBy?: TransactionSortByInput;
	sortOrder?: SortOrder;
}

const getQueryKey = (input?: TransactionsInput): QueryKey => ['Transactions', input ?? {}];
const getQueryParams = (input?: TransactionsInput) => {
	const params = new URLSearchParams();

	if (input?.page != null) params.append('page', input.page.toString());
	if (input?.pageSize != null) params.append('pageSize', input.pageSize.toString());

	if (input?.id?.eq != null) params.append('id__eq', input.id.eq.toString());
	if (input?.id?.neq != null) params.append('id__neq', input.id.neq.toString());
	if (input?.id?.in != null)
		input.id.in.forEach((id) => void params.append('id__in', id.toString()));
	if (input?.id?.nin != null)
		input.id.nin.forEach((id) => void params.append('id__nin', id.toString()));

	if (input?.type?.eq != null) params.append('type__eq', input.type.eq);
	if (input?.type?.neq != null) params.append('type__neq', input.type.neq);
	if (input?.type?.in != null)
		input.type.in.forEach((type) => void params.append('type__in', type.toString()));
	if (input?.type?.nin != null)
		input.type.nin.forEach((type) => void params.append('type__nin', type.toString()));

	if (input?.status?.eq != null) params.append('status__eq', input.status.eq);
	if (input?.status?.neq != null) params.append('status__neq', input.status.neq);
	if (input?.status?.in != null)
		input.status.in.forEach((status) => void params.append('status__in', status.toString()));
	if (input?.status?.nin != null)
		input.status.nin.forEach((status) => void params.append('status__nin', status.toString()));

	if (input?.ticket?.eq != null) params.append('ticket__eq', input.ticket.eq);
	if (input?.ticket?.neq != null) params.append('ticket__neq', input.ticket.neq);
	if (input?.ticket?.in != null)
		input.ticket.in.forEach((ticket) => void params.append('ticket__in', ticket));
	if (input?.ticket?.nin != null)
		input.ticket.nin.forEach((ticket) => void params.append('ticket__nin', ticket));
	if (input?.ticket?.contains != null) params.append('ticket__contains', input.ticket.contains);

	if (input?.studentId?.eq != null) params.append('studentId__eq', input.studentId.eq.toString());
	if (input?.studentId?.neq != null)
		params.append('studentId__neq', input.studentId.neq.toString());
	if (input?.studentId?.in != null)
		input.studentId.in.forEach(
			(studentId) => void params.append('studentId__in', studentId.toString()),
		);
	if (input?.studentId?.nin != null)
		input.studentId.nin.forEach(
			(studentId) => void params.append('studentId__nin', studentId.toString()),
		);

	if (input?.bookCopyId?.eq != null)
		params.append('bookCopyId__eq', input.bookCopyId.eq.toString());
	if (input?.bookCopyId?.neq != null)
		params.append('bookCopyId__neq', input.bookCopyId.neq.toString());
	if (input?.bookCopyId?.in != null)
		input.bookCopyId.in.forEach(
			(bookCopyId) => void params.append('bookCopyId__in', bookCopyId.toString()),
		);
	if (input?.bookCopyId?.nin != null)
		input.bookCopyId.nin.forEach(
			(bookCopyId) => void params.append('bookCopyId__nin', bookCopyId.toString()),
		);

	if (input?.bookId?.eq != null) params.append('bookId__eq', input.bookId.eq.toString());
	if (input?.bookId?.neq != null) params.append('bookId__neq', input.bookId.neq.toString());
	if (input?.bookId?.in != null)
		input.bookId.in.forEach((bookId) => void params.append('bookId__in', bookId.toString()));
	if (input?.bookId?.nin != null)
		input.bookId.nin.forEach((bookId) => void params.append('bookId__nin', bookId.toString()));

	if (input?.isbn?.eq != null) params.append('isbn__eq', input.isbn.eq);
	if (input?.isbn?.neq != null) params.append('isbn__neq', input.isbn.neq);
	if (input?.isbn?.in != null)
		input.isbn.in.forEach((isbn) => void params.append('isbn__in', isbn));
	if (input?.isbn?.nin != null)
		input.isbn.nin.forEach((isbn) => void params.append('isbn__nin', isbn));
	if (input?.isbn?.contains != null) params.append('isbn__contains', input.isbn.contains);

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
const getQueryFn = (input?: TransactionsInput) => {
	return async (context?: {signal?: AbortSignal}) => {
		const res = await fetch(`${API_BASE_URL}/transactions?${getQueryParams(input).toString()}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(PaginatedDefinition(TransactionDefinition)).parse(
			await res.json(),
		);

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useTransactionsQuery(
	input?: TransactionsInput,
	options?: Pick<
		UseQueryOptions<Paginated<Transaction>>,
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

useTransactionsQuery.getQueryFn = getQueryFn;
useTransactionsQuery.getQueryKey = getQueryKey;
useTransactionsQuery.getQueryParams = getQueryParams;
