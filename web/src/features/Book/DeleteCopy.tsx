import {Portal} from '@ark-ui/react';
import {TrashIcon} from 'lucide-react';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Menu} from '@/components/ui/Menu';
import {useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {useBookQuery} from '@/hooks/useBookQuery';
import {useBooksQuery} from '@/hooks/useBooksQuery';
import {useDeleteBookCopyMutation} from '@/hooks/useDeleteBookCopyMutation';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';
import {useCopyContext} from './CopyContext';

export function DeleteCopy() {
	const copy = useCopyContext();
	const disclosure = useDisclosure();
	const mutation = useDeleteBookCopyMutation({
		onSuccess: async () => {
			await Promise.all([
				client.invalidateQueries({
					refetchType: 'active',
					queryKey: useBookCopiesQuery.getQueryKey(),
					exact: false,
					type: 'all',
				}),
				client.invalidateQueries({
					refetchType: 'active',
					queryKey: useBookQuery.getQueryKey(),
					exact: false,
					type: 'all',
				}),
				client.invalidateQueries({
					refetchType: 'active',
					queryKey: useBooksQuery.getQueryKey(),
					exact: false,
					type: 'all',
				}),
				client.invalidateQueries({
					refetchType: 'active',
					queryKey: useTransactionsQuery.getQueryKey(),
					exact: false,
					type: 'all',
				}),
			]);

			disclosure.setOpen(false);
			toaster.success({
				description: 'Book copy has been deleted.',
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
								<Dialog.Title>Delete copy</Dialog.Title>
								<Dialog.Description>
									Are you sure you want to delete this copy? This action cannot be undone.
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
								onClick={() => mutation.mutate(copy.id)}
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
