import {VoidHttpResponseDefinition} from '@library/types';
import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/constants';
import {useCsrfQuery} from './useCsrfQuery';

export type DeleteBookCopyInput = {id: number};

export function useDeleteBookCopyMutation(
	options?: Pick<
		UseMutationOptions<void, Error, DeleteBookCopyInput>,
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
		mutationKey: ['DeleteBookCopy'],
		mutationFn: async (input) => {
			const csrf = await useCsrfQuery.getQueryFn()();
			const res = await fetch(`${API_BASE_URL}/book-copies/${input.id}`, {
				method: 'DELETE',
				credentials: 'include',
				headers: {
					'X-CSRF-Token': csrf.token,
				},
			});

			const obj = VoidHttpResponseDefinition.parse(await res.json());

			if (!obj.ok) {
				const err = new Error();
				err.name = obj.error.name;
				err.message = obj.error.message;
				throw err;
			}
		},
	});
}
