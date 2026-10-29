import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {type Book, CreateBookInputDefinition} from '@library/types';
import {isFunction} from 'es-toolkit';
import {PlusIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {SelectField} from '@/components/forms/SelectField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {useCreateBookMutation} from '@/hooks/useCreateBookMutation';
import {type UseDisclosureReturn, useDisclosure} from '@/hooks/useDisclosure';
import {getBookGenreOptions, getBookYearPublishedOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';

export interface AddBookProps {
	trigger?: ReactNode | ((disclosure: UseDisclosureReturn) => ReactNode);
	onAdded?: (data: Book) => void;
}

export function AddBook({trigger, onAdded}: AddBookProps = {}) {
	const disclosure = useDisclosure();
	const form = useForm({
		resolver: zodResolver(CreateBookInputDefinition),
	});

	const mutation = useCreateBookMutation({
		onSuccess: (data) => {
			disclosure.setOpen(false);
			toaster.success({description: 'Book has been added.'});
			onAdded?.(data);
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
				form.reset({});
			}}
		>
			<Dialog.Trigger asChild>
				{isFunction(trigger)
					? trigger(disclosure)
					: (trigger ?? (
							<Button>
								<PlusIcon />
								Add book
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
									<Dialog.Title>Add book</Dialog.Title>
									<Dialog.Description>
										Fill out the form to add a new book to your&nbsp;collection.
									</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body>
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
													field.onChange(value);
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
													const n = Number.parseInt(value, 10);
													field.onChange(Number.isNaN(n) ? undefined : n);
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
