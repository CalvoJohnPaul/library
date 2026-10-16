import {FailedHttpResponseDefinition} from '@library/types';
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

			if (!res.ok) {
				const obj = FailedHttpResponseDefinition.parse(await res.json());
				const err = new Error();
				err.name = obj.error.name;
				err.message = obj.error.message;
				throw err;
			}

			const blob = await res.blob();

			downloadFile(blob, `book-copies-${Date.now()}.xlsx`);
		},
	});
}
