import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {downloadFile} from '@/utils/downloadFile';
import {type StudentsInput, useStudentsQuery} from './useStudentsQuery';

export type ExportStudentsInput = Omit<StudentsInput, 'page' | 'pageSize'>;

export function useExportStudentsMutation(
	options?: Pick<
		UseMutationOptions<void, Error, ExportStudentsInput>,
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
		mutationKey: ['ExportStudents'],
		mutationFn: async (input: ExportStudentsInput) => {
			const params = useStudentsQuery.getQueryParams(input);

			const res = await fetch(`${API_BASE_URL}/students/export?${params.toString()}`, {
				method: 'POST',
				credentials: 'include',
			});

			await downloadFile(res, `students-${Date.now()}.xlsx`);
		},
	});
}
