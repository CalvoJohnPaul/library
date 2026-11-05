import {FailedHttpResponseDefinition} from '@library/types';
import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {downloadFile} from '@/utils/downloadFile';
import {useCsrfQuery} from './useCsrfQuery';
import {type TransactionsInput, useTransactionsQuery} from './useTransactionsQuery';

export type ExportTransactionsInput = Omit<TransactionsInput, 'page' | 'pageSize'>;

export function useExportTransactionsMutation(
	options?: Pick<
		UseMutationOptions<void, Error, ExportTransactionsInput>,
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
		mutationKey: ['ExportTransactions'],
		mutationFn: async (input: ExportTransactionsInput) => {
			const csrf = await useCsrfQuery.getQueryFn()();
			const params = useTransactionsQuery.getSearchParams(input);

			const res = await fetch(`${API_BASE_URL}/transactions/export?${params.toString()}`, {
				method: 'POST',
				credentials: 'include',
				headers: {'X-CSRF-Token': csrf.token},
			});

			if (!res.ok) {
				const obj = FailedHttpResponseDefinition.parse(await res.json());
				const err = new Error();
				err.name = obj.error.name;
				err.message = obj.error.message;
				throw err;
			}

			const blob = await res.blob();

			downloadFile(blob, `transactions-${Date.now()}.xlsx`);
		},
	});
}
