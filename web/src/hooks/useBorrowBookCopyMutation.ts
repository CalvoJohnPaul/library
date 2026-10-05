import {
	type BookCopy,
	BookCopyDefinition,
	HttpResponseDefinition,
	type BorrowBookCopyInput,
	type Transaction,
	TransactionDefinition,
} from '@library/types';
import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import * as z from 'zod';
import {API_BASE_URL} from '@/config/env';
import {useCsrfQuery} from './useCsrfQuery';

export function useBorrowBookCopyMutation(
	options?: Pick<
		UseMutationOptions<
			{bookCopy: BookCopy; transaction: Transaction},
			Error,
			BorrowBookCopyInput
		>,
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
		mutationKey: ['BorrowBookCopy'],
		mutationFn: async (input) => {
			const csrf = await useCsrfQuery.getQueryFn()();
			const res = await fetch(`${API_BASE_URL}/book-copies/${input.id}/borrow`, {
				method: 'POST',
				body: JSON.stringify(input.data),
				credentials: 'include',
				headers: {
					'X-CSRF-Token': csrf.token,
					'Content-Type': 'application/json',
				},
			});

			const obj = HttpResponseDefinition(
				z.object({bookCopy: BookCopyDefinition, transaction: TransactionDefinition}),
			).parse(await res.json());

			if (obj.ok) return obj.data;

			const err = new Error();
			err.name = obj.error.name;
			err.message = obj.error.message;
			throw err;
		},
	});
}
