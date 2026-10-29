import {
	type CreateReservationInput,
	HttpResponseDefinition,
	type Reservation,
	ReservationDefinition,
} from '@library/types';
import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {useCsrfQuery} from './useCsrfQuery';

export function useCreateReservationMutation(
	options?: Pick<
		UseMutationOptions<Reservation, Error, CreateReservationInput>,
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
		mutationKey: ['CreateReservation'],
		mutationFn: async (input) => {
			const csrf = await useCsrfQuery.getQueryFn()();
			const res = await fetch(`${API_BASE_URL}/reservations`, {
				method: 'POST',
				body: JSON.stringify(input),
				credentials: 'include',
				headers: {
					'X-CSRF-Token': csrf.token,
					'Content-Type': 'application/json',
				},
			});

			const obj = HttpResponseDefinition(ReservationDefinition).parse(await res.json());
			if (obj.ok) return obj.data;

			const err = new Error(obj.error.message);
			err.name = obj.error.name;
			throw err;
		},
	});
}
