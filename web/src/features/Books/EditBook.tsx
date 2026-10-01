import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {type Book, type Paginated, UpdateBookDataInputDefinition} from '@library/types';
import {isNil, omitBy} from 'es-toolkit';
import {isEmpty} from 'es-toolkit/compat';
import {PenSquareIcon} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import {SelectField} from '@/components/forms/SelectField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {Menu} from '@/components/ui/Menu';
import {useBooksQuery} from '@/hooks/useBooksQuery';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useUpdateBookMutation} from '@/hooks/useUpdateBookMutation';
import {client} from '@/utils/client';
import {getBookGenreOptions, getBookYearPublishedOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useBookContext} from './BookContext';

export function EditBook() {
	const book = useBookContext();
	const form = useForm({
		resolver: zodResolver(UpdateBookDataInputDefinition),
		defaultValues: book,
	});

	const disclosure = useDisclosure();
	const mutation = useUpdateBookMutation({
		onSuccess: async (next) => {
			client.setQueriesData<Paginated<Book>>(
				{
					queryKey: useBooksQuery.getQueryKey(),
					exact: false,
					type: 'all',
				},
				(data) => {
					if (!data) return data;
					return {
						...data,
						rows: data.rows.map((prev) => (prev.id === next.id ? next : prev)),
					};
				},
			);

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
				form.reset(book);
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
								data = omitBy(
									data,
									(value, key) => isNil(value) || value === '' || book[key] === value,
								);

								if (isEmpty(data)) {
									disclosure.setOpen(false);
									return;
								}

								mutation.mutate({
									id: book.id,
									data,
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
									<Dialog.Title>Edit book</Dialog.Title>
									<Dialog.Description>
										Fill out the form to edit the book in your&nbsp;collection.
									</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body className="space-y-3">
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
										<Field.Root invalid={fieldState.invalid}>
											<Field.Label>Genre</Field.Label>
											<SelectField
												placeholder="Select genre"
												options={getBookGenreOptions()}
												value={field.value ?? ''}
												onChange={(value) => {
													field.onChange(value || null);
												}}
											/>
											<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
										</Field.Root>
									)}
								/>
								<Controller
									control={form.control}
									name="yearPublished"
									render={({field, fieldState}) => (
										<Field.Root invalid={fieldState.invalid}>
											<Field.Label>Year Published</Field.Label>
											<SelectField
												placeholder="Select year published"
												options={getBookYearPublishedOptions()}
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
