import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {
	type CreateReservationInput,
	CreateReservationInputDefinition,
	type Reservation,
} from '@library/types';
import {isFunction} from 'es-toolkit';
import {PlusIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {AsyncComboboxField} from '@/components/forms/AsyncComboboxField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {type BooksInput, useBooksQuery} from '@/hooks/useBooksQuery';
import {useCreateReservationMutation} from '@/hooks/useCreateReservationMutation';
import {type UseDisclosureReturn, useDisclosure} from '@/hooks/useDisclosure';
import {type MembersInput, useMembersQuery} from '@/hooks/useMembersQuery';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';

export interface AddReservationProps {
	bookId?: number;
	memberId?: number;
	trigger?: ReactNode | ((disclosure: UseDisclosureReturn) => ReactNode);
	disabled?: boolean;
	onAdded?: (data: Reservation) => void;
}

export function AddReservation(props: AddReservationProps) {
	const {bookId, memberId, trigger, disabled, onAdded} = props;

	const form = useForm<CreateReservationInput>({
		resolver: zodResolver(CreateReservationInputDefinition),
		defaultValues: {
			bookId,
			memberId,
			remarks: '',
		},
	});

	const disclosure = useDisclosure();
	const mutation = useCreateReservationMutation({
		onSuccess: (data) => {
			disclosure.setOpen(false);
			toaster.success({description: 'Reservation has been created.'});
			onAdded?.(data);
		},
		onError: (error) => toaster.error({description: error.message}),
	});

	return (
		<Dialog.Root
			open={disclosure.open}
			onOpenChange={(details) => {
				if (!mutation.isPending) disclosure.setOpen(details.open);
			}}
			onExitComplete={() =>
				form.reset({
					bookId,
					memberId,
					remarks: '',
				})
			}
		>
			<Dialog.Trigger asChild disabled={disabled}>
				{isFunction(trigger)
					? trigger(disclosure)
					: (trigger ?? (
							<Button>
								<PlusIcon />
								Add reservation
							</Button>
						))}
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form
							onSubmit={form.handleSubmit((data) =>
								mutation.mutate({...data, remarks: data.remarks?.trim() || null}),
							)}
							noValidate
						>
							<Dialog.Header>
								<FeaturedIcon.Root>
									<FeaturedIcon.Icon>
										<PlusIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Create reservation</Dialog.Title>
									<Dialog.Description>Select a book and member to reserve.</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body>
								{!bookId && (
									<Controller
										control={form.control}
										name="bookId"
										render={({field, fieldState}) => (
											<Field.Root invalid={fieldState.invalid} disabled={!!bookId}>
												<Field.Label>Book</Field.Label>
												<AsyncComboboxField
													placeholder="Search book"
													value={field.value?.toString() ?? ''}
													onChange={(value) => field.onChange(value ? Number(value) : undefined)}
													options={async (search, value) => {
														const input: BooksInput =
															search.trim() === '' && value
																? {id: {in: [value]}, page: 1}
																: {title: {contains: search}, page: 1, pageSize: 25};

														try {
															const data = await client.query({
																queryKey: useBooksQuery.getQueryKey(input),
																queryFn: useBooksQuery.getQueryFn(input),
															});

															return data.rows.map((book) => ({
																value: book.id.toString(),
																label: `${book.title} (${book.author})`,
															}));
														} catch {
															return [];
														}
													}}
												/>
												<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
											</Field.Root>
										)}
									/>
								)}

								{!memberId && (
									<Controller
										control={form.control}
										name="memberId"
										render={({field, fieldState}) => (
											<Field.Root invalid={fieldState.invalid} disabled={!!memberId}>
												<Field.Label>Member</Field.Label>
												<AsyncComboboxField
													placeholder="Search member"
													value={field.value?.toString() ?? ''}
													onChange={(value) => field.onChange(value ? Number(value) : undefined)}
													options={async (search, value) => {
														const input: MembersInput =
															search.trim() === '' && value
																? {id: {in: [value]}, page: 1}
																: {name: {contains: search}, page: 1, pageSize: 25};

														try {
															const data = await client.query({
																queryKey: useMembersQuery.getQueryKey(input),
																queryFn: useMembersQuery.getQueryFn(input),
															});

															return data.rows.map((member) => ({
																value: member.id.toString(),
																label: `${member.name} (${member.externalId})`,
															}));
														} catch {
															return [];
														}
													}}
												/>
												<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
											</Field.Root>
										)}
									/>
								)}

								<Field.Root invalid={!!form.formState.errors.remarks}>
									<Field.Label>Remarks</Field.Label>
									<Field.Textarea placeholder="Enter remarks" {...form.register('remarks')} />
									<Field.ErrorText>{form.formState.errors.remarks?.message}</Field.ErrorText>
								</Field.Root>
							</Dialog.Body>
							<Dialog.Footer>
								<Button
									type="button"
									variant="outline"
									accent="gray"
									onClick={() => disclosure.setOpen(false)}
									disabled={mutation.isPending}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={mutation.isPending}>
									{mutation.isPending ? <SpinnerIcon className="size-5" /> : 'Create reservation'}
								</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
