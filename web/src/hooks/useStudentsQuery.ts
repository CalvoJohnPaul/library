import {
	HttpResponseDefinition,
	type Paginated,
	PaginatedDefinition,
	type SortOrder,
	type Student,
	StudentDefinition,
	type StudentSortByInput,
} from '@library/types';
import {type QueryKey, type UseQueryOptions, useQuery} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/constants';
import type {DateFilterInput, IdFilterInput, StringFilterInput} from '@/types/index';

export interface StudentsInput {
	page?: number;
	pageSize?: number;
	id?: IdFilterInput;
	externalId?: StringFilterInput;
	firstName?: StringFilterInput;
	lastName?: StringFilterInput;
	course?: StringFilterInput;
	yearAndSection?: StringFilterInput;
	dateTimeCreated?: DateFilterInput;
	dateTimeUpdated?: DateFilterInput;
	sortBy?: StudentSortByInput;
	sortOrder?: SortOrder;
}

const getQueryKey = (input?: StudentsInput): QueryKey => ['Students', input ?? {}];
const getQueryFn = (input?: StudentsInput) => {
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

		if (input?.firstName?.eq != null) params.append('firstName__eq', input.firstName.eq);
		if (input?.firstName?.neq != null) params.append('firstName__neq', input.firstName.neq);
		if (input?.firstName?.in != null)
			input.firstName.in.forEach(
				(firstName) => void params.append('firstName__in', firstName.toString()),
			);
		if (input?.firstName?.nin != null)
			input.firstName.nin.forEach(
				(firstName) => void params.append('firstName__nin', firstName.toString()),
			);
		if (input?.firstName?.contains != null)
			params.append('firstName__contains', input.firstName.contains);

		if (input?.lastName?.eq != null) params.append('lastName__eq', input.lastName.eq);
		if (input?.lastName?.neq != null) params.append('lastName__neq', input.lastName.neq);
		if (input?.lastName?.in != null)
			input.lastName.in.forEach(
				(lastName) => void params.append('lastName__in', lastName.toString()),
			);
		if (input?.lastName?.nin != null)
			input.lastName.nin.forEach(
				(lastName) => void params.append('lastName__nin', lastName.toString()),
			);
		if (input?.lastName?.contains != null)
			params.append('lastName__contains', input.lastName.contains);

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

		const res = await fetch(`${API_BASE_URL}/students?${params.toString()}`, {
			signal: context?.signal,
			credentials: 'include',
		});

		const obj = HttpResponseDefinition(PaginatedDefinition(StudentDefinition)).parse(
			await res.json(),
		);

		if (obj.ok) return obj.data;

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	};
};

export function useStudentsQuery(
	input?: StudentsInput,
	options?: Pick<
		UseQueryOptions<Paginated<Student>>,
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

useStudentsQuery.getQueryFn = getQueryFn;
useStudentsQuery.getQueryKey = getQueryKey;
