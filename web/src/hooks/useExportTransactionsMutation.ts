import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {downloadFile} from '@/utils/downloadFile';
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
			const params = useTransactionsQuery.getSearchParams(input);

			const res = await fetch(`${API_BASE_URL}/transactions/export?${params.toString()}`, {
				method: 'POST',
				credentials: 'include',
			});

			await downloadFile(res, `transactions-${Date.now()}.xlsx`);
		},
	});
}
