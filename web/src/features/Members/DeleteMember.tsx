import {Portal} from '@ark-ui/react';
import {TrashIcon} from 'lucide-react';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Menu} from '@/components/ui/Menu';
import {useDeleteMemberMutation} from '@/hooks/useDeleteMemberMutation';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useMembersQuery} from '@/hooks/useMembersQuery';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';
import {useMemberContext} from './MemberContext';

export function DeleteMember() {
	const member = useMemberContext();
	const disclosure = useDisclosure();
	const mutation = useDeleteMemberMutation({
		onSuccess: async () => {
			await client.invalidateQueries({
				refetchType: 'active',
				queryKey: useMembersQuery.getQueryKey(),
				exact: false,
				type: 'all',
			});

			disclosure.setOpen(false);
			toaster.success({
				description: 'Member has been deleted.',
			});
		},
		onError: (error) => {
			toaster.error({
				description: error.message,
			});
		},
	});

	return (
		<Dialog.Root
			open={disclosure.open}
			onOpenChange={(details) => disclosure.setOpen(details.open)}
		>
			<Dialog.Context>
				{(api) => (
					<Menu.Item value="delete" onSelect={() => api.setOpen(true)}>
						<TrashIcon />
						Delete
					</Menu.Item>
				)}
			</Dialog.Context>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<FeaturedIcon.Root accent="danger">
								<FeaturedIcon.Icon>
									<TrashIcon />
								</FeaturedIcon.Icon>
							</FeaturedIcon.Root>
							<div>
								<Dialog.Title>Delete member</Dialog.Title>
								<Dialog.Description>
									Are you sure you want to delete this member? This action cannot be undone.
								</Dialog.Description>
							</div>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Footer>
							<Dialog.Context>
								{(api) => (
									<Button
										variant="outline"
										accent="gray"
										onClick={() => api.setOpen(false)}
										disabled={mutation.isPending}
									>
										Cancel
									</Button>
								)}
							</Dialog.Context>
							<Button
								accent="danger"
								disabled={mutation.isPending}
								onClick={() => mutation.mutate(member.id)}
							>
								{mutation.isPending ? <SpinnerIcon className="size-5" /> : 'Confirm'}
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
