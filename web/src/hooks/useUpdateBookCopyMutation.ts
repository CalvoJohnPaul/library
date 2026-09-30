import {
	type BookCopy,
	BookCopyDefinition,
	HttpResponseDefinition,
	type UpdateBookCopyInput,
} from '@library/types';
import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {useCsrfQuery} from './useCsrfQuery';

export function useUpdateBookCopyMutation(
	options?: Pick<
		UseMutationOptions<BookCopy, Error, UpdateBookCopyInput>,
		| 'gcTime'
		| 'onMutate'
		| 'onSettled'
		| 'onSuccess'
		| 'onError'
		| 'retry'
		| 'retryDelay'
		| 'throwOnError'
	>,
) {
	return useMutation({
		...options,
		mutationKey: ['UpdateBookCopy'],
		mutationFn: async (input) => {
			const csrf = await useCsrfQuery.getQueryFn()();
			const res = await fetch(`${API_BASE_URL}/book-copies/${input.id}`, {
				method: 'PATCH',
				body: JSON.stringify(input.data),
				credentials: 'include',
				headers: {
					'X-CSRF-Token': csrf.token,
					'Content-Type': 'application/json',
				},
			});

			const obj = HttpResponseDefinition(BookCopyDefinition).parse(await res.json());

			if (obj.ok) return obj.data;

			const err = new Error();
			err.name = obj.error.name;
			err.message = obj.error.message;
			throw err;
		},
	});
}
