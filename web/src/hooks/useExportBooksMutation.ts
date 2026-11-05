import {FailedHttpResponseDefinition} from '@library/types';
import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {downloadFile} from '@/utils/downloadFile';
import {type BooksInput, useBooksQuery} from './useBooksQuery';
import {useCsrfQuery} from './useCsrfQuery';

export type ExportBooksInput = Omit<BooksInput, 'page' | 'pageSize'>;

export function useExportBooksMutation(
	options?: Pick<
		UseMutationOptions<void, Error, ExportBooksInput>,
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
		mutationKey: ['ExportBooks'],
		mutationFn: async (input: ExportBooksInput) => {
			const csrf = await useCsrfQuery.getQueryFn()();
			const params = useBooksQuery.getSearchParams(input);
			const res = await fetch(`${API_BASE_URL}/books/export?${params.toString()}`, {
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

			downloadFile(blob, `books-${Date.now()}.xlsx`);
		},
	});
}
