import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {UpdateBookCopyDataInputDefinition} from '@library/types';
import {PenSquareIcon} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {Menu} from '@/components/ui/Menu';
import {useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import {useUpdateBookCopyMutation} from '@/hooks/useUpdateBookCopyMutation';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';
import {useCopyContext} from './CopyContext';

export function EditCopy() {
	const copy = useCopyContext();
	const form = useForm({
		resolver: zodResolver(UpdateBookCopyDataInputDefinition),
		defaultValues: {
			isbn: copy.isbn,
		},
	});

	const disclosure = useDisclosure();
	const mutation = useUpdateBookCopyMutation({
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
					queryKey: useTransactionsQuery.getQueryKey(),
					exact: false,
					type: 'all',
				}),
			]);

			disclosure.setOpen(false);
			toaster.success({
				description: 'Changes have been saved.',
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
			onExitComplete={() => {
				form.reset({isbn: copy.isbn});
			}}
		>
			<Dialog.Context>
				{(api) => (
					<Menu.Item value="edit" onSelect={() => api.setOpen(true)}>
						<PenSquareIcon />
						Edit
					</Menu.Item>
				)}
			</Dialog.Context>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form
							onSubmit={form.handleSubmit((data) => {
								if (data.isbn == null || data.isbn === '' || data.isbn === copy.isbn) {
									disclosure.setOpen(false);
									return;
								}

								mutation.mutate({
									id: copy.id,
									data: {isbn: data.isbn},
								});
							})}
							noValidate
						>
							<Dialog.Header>
								<FeaturedIcon.Root>
									<FeaturedIcon.Icon>
										<PenSquareIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Edit copy</Dialog.Title>
									<Dialog.Description>
										Fill out the form to edit the copy of&nbsp;
										<em className="italic">"{copy.book.title}"</em> in your&nbsp;collection.
									</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body className="space-y-3">
								<Field.Root invalid={!!form.formState.errors.isbn}>
									<Field.Label>ISBN</Field.Label>
									<Field.Input placeholder="Enter ISBN" {...form.register('isbn')} />
									<Field.ErrorText>{form.formState.errors.isbn?.message}</Field.ErrorText>
								</Field.Root>
							</Dialog.Body>
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
								<Button type="submit" disabled={mutation.isPending}>
									{mutation.isPending ? <SpinnerIcon className="size-5" /> : 'Submit'}
								</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
