import {type BookCopy, BookCopyDefinition, HttpResponseDefinition} from '@library/types';
import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/constants';
import {useCsrfQuery} from './useCsrfQuery';

export function useReturnBookCopyMutation(
	options?: Pick<
		UseMutationOptions<BookCopy, Error, number>,
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
		mutationKey: ['ReturnBookCopy'],
		mutationFn: async (id) => {
			const csrf = await useCsrfQuery.getQueryFn()();
			const res = await fetch(`${API_BASE_URL}/book-copies/${id}/return`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-CSRF-Token': csrf.token,
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
