import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {CreateBookCopyInputDefinition} from '@library/types';
import {isFunction} from 'es-toolkit';
import {PlusIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {useForm} from 'react-hook-form';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {useBookQuery} from '@/hooks/useBookQuery';
import {useBooksQuery} from '@/hooks/useBooksQuery';
import {useCreateBookCopyMutation} from '@/hooks/useCreateBookCopyMutation';
import {type UseDisclosureReturn, useDisclosure} from '@/hooks/useDisclosure';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';
import {useBookContext} from './BookContext';

export interface AddBookCopyProps {
	trigger?: ReactNode | ((disclosure: UseDisclosureReturn) => ReactNode);
}

export function AddBookCopy({trigger}: AddBookCopyProps) {
	const book = useBookContext();
	const disclosure = useDisclosure();
	const form = useForm({
		resolver: zodResolver(CreateBookCopyInputDefinition),
		defaultValues: {
			bookId: book.id,
		},
	});

	const mutation = useCreateBookCopyMutation({
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
			]);

			disclosure.setOpen(false);
			toaster.success({
				description: 'Book copy has been added.',
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
				form.reset({bookId: book.id});
			}}
		>
			<Dialog.Trigger asChild>
				{isFunction(trigger)
					? trigger(disclosure)
					: (trigger ?? (
							<Button>
								<PlusIcon />
								Add copy
							</Button>
						))}
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form
							onSubmit={form.handleSubmit((data) => {
								mutation.mutate(data);
							})}
							noValidate
						>
							<Dialog.Header>
								<FeaturedIcon.Root>
									<FeaturedIcon.Icon>
										<PlusIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Add copy</Dialog.Title>
									<Dialog.Description>
										Fill out the form to add a new copy of&nbsp;
										<em className="italic">"{book.title}"</em> to your&nbsp;collection.
									</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body>
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
