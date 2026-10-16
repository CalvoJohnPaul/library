import {FailedHttpResponseDefinition} from '@library/types';
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
			const params = useMembersQuery.getSearchParams(input);

			const res = await fetch(`${API_BASE_URL}/members/export?${params.toString()}`, {
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

			downloadFile(blob, `members-${Date.now()}.xlsx`);
		},
	});
}
