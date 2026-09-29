import {
	type Book,
	BookDefinition,
	type BookSortByInput,
	HttpResponseDefinition,
	type Paginated,
	PaginatedDefinition,
	type SortOrder,
} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/constants';
import type {
	BooleanFilterInput,
	DateFilterInput,
	IdFilterInput,
	NumberFilterInput,
	StringFilterInput,
} from '@/types/index';

export interface BooksInput {
	page?: number;
	pageSize?: number;
	id?: IdFilterInput;
	title?: StringFilterInput;
	author?: StringFilterInput;
	genre?: StringFilterInput;
	yearPublished?: NumberFilterInput;
	dateTimeCreated?: DateFilterInput;
	dateTimeUpdated?: DateFilterInput;
	available?: BooleanFilterInput;
	sortBy?: BookSortByInput;
	sortOrder?: SortOrder;
}

const getQueryKey = (input?: BooksInput): QueryKey => ['Books', input ?? {}];
const getQueryFn = (input?: BooksInput) => {
	return async (context?: {signal?: AbortSignal}) => {
		const params = new URLSearchParams();

		if (input?.page != null) params.append('page', input.page.toString());
		if (input?.pageSize != null) params.append('pageSize', input.pageSize.toString());

		if (input?.id?.eq != null) params.append('id__eq', input.id.eq.toString());
		if (input?.id?.neq != null) params.append('id__neq', input.id.neq.toString());
		if (input?.id?.in != null)
			input.id.in.forEach((id) => void params.append('id__in', id.toString()));
		if (input?.id?.nin != null)
			input.id.nin.forEach((id) => void params.append('id__nin', id.toString()));

		if (input?.title?.eq != null) params.append('title__eq', input.title.eq);
		if (input?.title?.neq != null) params.append('title__neq', input.title.neq);
		if (input?.title?.in != null)
			input.title.in.forEach((title) => void params.append('title__in', title.toString()));
		if (input?.title?.nin != null)
			input.title.nin.forEach((title) => void params.append('title__nin', title.toString()));
		if (input?.title?.contains != null) params.append('title__contains', input.title.contains);

		if (input?.author?.eq != null) params.append('author__eq', input.author.eq);
		if (input?.author?.neq != null) params.append('author__neq', input.author.neq);
		if (input?.author?.in != null)
			input.author.in.forEach((author) => void params.append('author__in', author.toString()));
		if (input?.author?.nin != null)
			input.author.nin.forEach((author) => void params.append('author__nin', author.toString()));

		if (input?.genre?.eq != null) params.append('genre__eq', input.genre.eq);
		if (input?.genre?.neq != null) params.append('genre__neq', input.genre.neq);
		if (input?.genre?.in != null)
			input.genre.in.forEach((genre) => void params.append('genre__in', genre.toString()));
		if (input?.genre?.nin != null)
			input.genre.nin.forEach((genre) => void params.append('genre__nin', genre.toString()));

		if (input?.yearPublished?.gt != null)
			params.append('yearPublished__gt', input.yearPublished.gt.toString());
		if (input?.yearPublished?.gte != null)
			params.append('yearPublished__gte', input.yearPublished.gte.toString());
		if (input?.yearPublished?.lt != null)
			params.append('yearPublished__lt', input.yearPublished.lt.toString());
		if (input?.yearPublished?.lte != null)
			params.append('yearPublished__lte', input.yearPublished.lte.toString());

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

		if (input?.available?.eq != null) params.append('available__eq', input.available.eq.toString());
		if (input?.available?.neq != null)
			params.append('available__neq', input.available.neq.toString());

		if (input?.sortBy) params.append('sortBy', input.sortBy);
		if (input?.sortOrder) params.append('sortOrder', input.sortOrder);

		const res = await fetch(`${API_BASE_URL}/books?${params.toString()}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(PaginatedDefinition(BookDefinition)).parse(await res.json());

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useBooksQuery(
	input?: BooksInput,
	options?: Pick<
		UseQueryOptions<Paginated<Book>>,
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

useBooksQuery.getQueryFn = getQueryFn;
useBooksQuery.getQueryKey = getQueryKey;
