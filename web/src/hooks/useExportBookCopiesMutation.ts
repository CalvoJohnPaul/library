import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {downloadFile} from '@/utils/downloadFile';
import {type BookCopiesInput, useBookCopiesQuery} from './useBookCopiesQuery';

export type ExportBookCopiesInput = Omit<BookCopiesInput, 'page' | 'pageSize'>;

export function useExportBookCopiesMutation(
	options?: Pick<
		UseMutationOptions<void, Error, ExportBookCopiesInput>,
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
		mutationKey: ['ExportBookCopies'],
		mutationFn: async (input: ExportBookCopiesInput) => {
			const params = useBookCopiesQuery.getSearchParams(input);

			const res = await fetch(`${API_BASE_URL}/book-copies/export?${params.toString()}`, {
				method: 'POST',
				credentials: 'include',
			});

			await downloadFile(res, `book-copies-${Date.now()}.xlsx`);
		},
	});
}
