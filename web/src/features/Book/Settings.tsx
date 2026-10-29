import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {type Book, UpdateBookDataInputDefinition} from '@library/types';
import {isNil, omitBy} from 'es-toolkit';
import {isEmpty} from 'es-toolkit/compat';
import {TrashIcon} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import {useNavigate} from 'react-router';
import {SelectField} from '@/components/forms/SelectField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {useBookQuery} from '@/hooks/useBookQuery';
import {useDeleteBookMutation} from '@/hooks/useDeleteBookMutation';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useUpdateBookMutation} from '@/hooks/useUpdateBookMutation';
import {client} from '@/utils/client';
import {getBookGenreOptions, getBookYearPublishedOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useBookContext} from './BookContext';

export function Settings() {
	const book = useBookContext();
	const form = useForm({
		resolver: zodResolver(UpdateBookDataInputDefinition),
		defaultValues: book,
	});

	const mutation = useUpdateBookMutation({
		onSuccess: (data) => {
			form.reset(data);
			toaster.success({description: 'Changes have been saved.'});
			client.setQueryData<Book>(useBookQuery.getQueryKey(book.id), data);
		},
		onError: (error) => {
			toaster.error({
				description: error.message,
			});
		},
	});

	return (
		<div>
			<form
				onSubmit={form.handleSubmit((data) => {
					data = omitBy(data, (value, key) => isNil(value) || value === '' || value === book[key]);
					if (isEmpty(data)) return form.reset(book);
					mutation.mutate({id: book.id, data});
				})}
				noValidate
			>
				<div className="space-y-3">
					<Field.Root invalid={!!form.formState.errors.title}>
						<Field.Label>Title</Field.Label>
						<Field.Input placeholder="Enter title" {...form.register('title')} />
						<Field.ErrorText>{form.formState.errors.title?.message}</Field.ErrorText>
					</Field.Root>
					<Field.Root invalid={!!form.formState.errors.author}>
						<Field.Label>Author</Field.Label>
						<Field.Input placeholder="Enter author" {...form.register('author')} />
						<Field.ErrorText>{form.formState.errors.author?.message}</Field.ErrorText>
					</Field.Root>
					<Controller
						control={form.control}
						name="genre"
						render={({field, fieldState}) => (
							<Field.Root invalid={!!fieldState.error}>
								<Field.Label>Genre</Field.Label>
								<SelectField
									options={getBookGenreOptions()}
									placeholder="Select genre"
									value={field.value ?? ''}
									onChange={(value) => field.onChange(value || null)}
								/>
								<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
							</Field.Root>
						)}
					/>
					<Controller
						control={form.control}
						name="yearPublished"
						render={({field, fieldState}) => (
							<Field.Root invalid={!!fieldState.error}>
								<Field.Label>Year published</Field.Label>
								<SelectField
									options={getBookYearPublishedOptions()}
									placeholder="Select year published"
									value={field.value?.toString() ?? ''}
									onChange={(value) => {
										const n = value ? Number.parseInt(value, 10) : null;
										field.onChange(Number.isNaN(n) ? '' : n);
									}}
								/>
								<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
							</Field.Root>
						)}
					/>
				</div>

				<div className="mt-12 flex justify-end gap-3">
					{form.formState.isDirty ? (
						<>
							<Button
								className="w-32"
								variant="outline"
								accent="gray"
								onClick={() => {
									form.reset(book);
								}}
								disabled={mutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" className="w-32" disabled={mutation.isPending}>
								{mutation.isPending ? <SpinnerIcon className="animate-spin" /> : 'Save'}
							</Button>
						</>
					) : (
						<DeleteBook />
					)}
				</div>
			</form>
		</div>
	);
}

export function DeleteBook() {
	const book = useBookContext();
	const disclosure = useDisclosure();
	const navigate = useNavigate();
	const mutation = useDeleteBookMutation({
		onSuccess: () => {
			disclosure.setOpen(false);
			toaster.success({description: 'Book has been deleted.'});
			navigate('/books');
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
			<Dialog.Trigger asChild>
				<Button className="w-32" accent="danger">
					Delete
				</Button>
			</Dialog.Trigger>
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
								<Dialog.Title>Delete book</Dialog.Title>
								<Dialog.Description>
									Are you sure you want to delete this book? This action cannot be undone.
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
								onClick={() => mutation.mutate(book.id)}
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
