import {type UseMutationOptions, useMutation} from '@tanstack/react-query';
import {API_BASE_URL} from '@/config/env';
import {downloadFile} from '@/utils/downloadFile';
import {type MembersInput, useMembersQuery} from './useMembersQuery';

export type ExportMembersInput = Omit<MembersInput, 'page' | 'pageSize'>;

export function useExportMembersMutation(
	options?: Pick<
		UseMutationOptions<void, Error, ExportMembersInput>,
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
		mutationKey: ['ExportMembers'],
		mutationFn: async (input: ExportMembersInput) => {
			const params = useMembersQuery.getQueryParams(input);

			const res = await fetch(`${API_BASE_URL}/members/export?${params.toString()}`, {
				method: 'POST',
				credentials: 'include',
			});

			await downloadFile(res, `members-${Date.now()}.xlsx`);
		},
	});
}
