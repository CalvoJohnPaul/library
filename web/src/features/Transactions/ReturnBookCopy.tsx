import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {ReturnBookCopyDataInputDefinition} from '@library/types';
import {CornerDownLeftIcon} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {Menu} from '@/components/ui/Menu';
import {useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {useBookQuery} from '@/hooks/useBookQuery';
import {useBooksQuery} from '@/hooks/useBooksQuery';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useReturnBookCopyMutation} from '@/hooks/useReturnBookCopyMutation';
import {useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';
import {useBookCopyContext} from './BookCopyContext';

export function ReturnBookCopy() {
	const copy = useBookCopyContext();
	const disclosure = useDisclosure();
	const form = useForm({
		resolver: zodResolver(ReturnBookCopyDataInputDefinition),
		defaultValues: {
			remarks: '',
		},
	});

	const mutation = useReturnBookCopyMutation({
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
				description: 'Book copy has been returned.',
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
				form.reset({remarks: ''});
			}}
		>
			<Dialog.Context>
				{(api) => (
					<Menu.Item value="return" onSelect={() => api.setOpen(true)}>
						<CornerDownLeftIcon />
						Return
					</Menu.Item>
				)}
			</Dialog.Context>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form
							onSubmit={form.handleSubmit((data) => {
								mutation.mutate({
									id: copy.id,
									data: {remarks: data.remarks || null},
								});
							})}
							noValidate
						>
							<Dialog.Header>
								<FeaturedIcon.Root accent="warning">
									<FeaturedIcon.Icon>
										<CornerDownLeftIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Return copy</Dialog.Title>
									<Dialog.Description>
										You are about to return the copy. This action can not be undone.
									</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body>
								<Field.Root invalid={!!form.formState.errors.remarks}>
									<Field.Label>Remarks</Field.Label>
									<Field.Textarea placeholder="Enter remarks" {...form.register('remarks')} />
									<Field.ErrorText>{form.formState.errors.remarks?.message}</Field.ErrorText>
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
								<Button type="submit" accent="warning" disabled={mutation.isPending}>
									{mutation.isPending ? <SpinnerIcon className="size-5" /> : 'Return'}
								</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
