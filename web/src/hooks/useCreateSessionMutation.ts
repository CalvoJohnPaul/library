import {type CreateSessionInput, VoidHttpResponseDefinition} from '@library/types';
import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {useCsrfQuery} from './useCsrfQuery';

export function useCreateSessionMutation(
	options?: Pick<
		UseMutationOptions<void, Error, CreateSessionInput>,
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
		mutationKey: ['CreateSession'],
		mutationFn: async (input) => {
			const csrf = await useCsrfQuery.getQueryFn()();
			console.log(csrf.token);

			const res = await fetch(`${API_BASE_URL}/sessions`, {
				method: 'POST',
				body: JSON.stringify(input),
				credentials: 'include',
				headers: {
					'X-CSRF-Token': csrf.token,
					'Content-Type': 'application/json',
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
