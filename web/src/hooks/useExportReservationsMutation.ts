import {FailedHttpResponseDefinition} from '@library/types';
import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {downloadFile} from '@/utils/downloadFile';
import {type ReservationsInput, useReservationsQuery} from './useReservationsQuery';

export type ExportReservationsInput = Omit<ReservationsInput, 'page' | 'pageSize'>;

export function useExportReservationsMutation(
	options?: Pick<
		UseMutationOptions<void, Error, ExportReservationsInput>,
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
		mutationKey: ['ExportReservations'],
		mutationFn: async (input: ExportReservationsInput) => {
			const params = useReservationsQuery.getSearchParams(input);
			const res = await fetch(`${API_BASE_URL}/reservations/export?${params}`, {
				method: 'POST',
				credentials: 'include',
			});
			if (!res.ok) {
				const obj = FailedHttpResponseDefinition.parse(await res.json());
				const err = new Error();
				err.name = obj.error.name;
				err.message = obj.error.message;
				throw err;
			}
			const blob = await res.blob();
			downloadFile(blob, `reservations-${Date.now()}.xlsx`);
		},
	});
}
