import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {CreateMemberInputDefinition, type Member, type Transaction} from '@library/types';
import {useMutation} from '@tanstack/react-query';
import {format} from 'date-fns';
import {ArrowRightIcon, CircleCheckIcon, PenSquareIcon, RepeatIcon} from 'lucide-react';
import {useState} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {SelectField} from '@/components/forms/SelectField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {IconButton} from '@/components/ui/IconButton';
import {Menu} from '@/components/ui/Menu';
import {useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {useBookQuery} from '@/hooks/useBookQuery';
import {useBooksQuery} from '@/hooks/useBooksQuery';
import {useBorrowBookCopyMutation} from '@/hooks/useBorrowBookCopyMutation';
import {useCreateMemberMutation} from '@/hooks/useCreateMemberMutation';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useMemberQuery} from '@/hooks/useMemberQuery';
import {type MembersInput, useMembersQuery} from '@/hooks/useMembersQuery';
import {useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import {client} from '@/utils/client';
import {getMemberCourseOptions, getMemberYearAndSectionOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useCopyContext} from './CopyContext';

type Step = 'SEARCH' | 'CONFIRM' | 'CREATE' | 'SUCCESS';

export function BorrowBookCopy() {
	const copy = useCopyContext();
	const disclosure = useDisclosure();

	const [step, setStep] = useState<Step>('SEARCH');
	const [member, setMember] = useState<Member | null>(null);
	const [transaction, setTransaction] = useState<Transaction | null>(null);
	const [searchValue, setSearchValue] = useState('');
	const [searchError, setSearchError] = useState('');

	const form = useForm({
		resolver: zodResolver(CreateMemberInputDefinition),
		defaultValues: {
			externalId: '',
			name: '',
			course: null,
			yearAndSection: null,
		},
	});

	const course = useWatch({
		control: form.control,
		name: 'course',
		defaultValue: null,
	});

	const lookupMemberMutation = useMutation({
		mutationKey: ['LookupMember'],
		async mutationFn(externalId: string) {
			const input: MembersInput = {
				page: 1,
				pageSize: 10,
				externalId: {
					eq: externalId,
				},
			};

			return await client.query({
				queryKey: useMembersQuery.getQueryKey(input),
				queryFn: useMembersQuery.getQueryFn(input),
			});
		},
	});

	const createMemberMutation = useCreateMemberMutation();
	const borrowMutation = useBorrowBookCopyMutation({
		async onSuccess(result) {
			setTransaction(result.transaction);
			setStep('SUCCESS');

			Promise.all([
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
					queryKey: useMemberQuery.getQueryKey(result.transaction.member.id),
					exact: false,
					type: 'all',
				}),
				client.invalidateQueries({
					refetchType: 'active',
					queryKey: useMembersQuery.getQueryKey(),
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

			toaster.success({
				description: 'Book copy has been borrowed.',
			});
		},
		onError(error) {
			toaster.error({
				description: error.message,
			});
		},
	});

	const reset = () => {
		setStep('SEARCH');
		setSearchValue('');
		setSearchError('');
		setMember(null);
		setTransaction(null);
		form.reset({
			externalId: '',
			name: '',
			course: null,
			yearAndSection: null,
		});
	};

	const handleSearch = () => {
		const externalId = searchValue.trim();

		if (externalId === '') {
			setSearchError('Member ID is required.');
			return;
		}

		setSearchError('');

		lookupMemberMutation.mutate(externalId, {
			onSuccess(data) {
				const found = data.rows.at(0) ?? null;

				setMember(found);

				if (found) {
					setStep('CONFIRM');
				} else {
					setStep('CREATE');
					form.reset({
						externalId,
						name: '',
						course: null,
						yearAndSection: null,
					});
				}
			},
			onError(error) {
				toaster.error({
					description: error.message,
				});
			},
		});
	};

	const handleBorrow = (memberId: number) => {
		borrowMutation.mutate({
			id: copy.id,
			data: {
				memberId,
				remarks: null,
			},
		});
	};

	const handleSubmit = form.handleSubmit((data) => {
		if (member?.externalId === data.externalId) {
			handleBorrow(member.id);
			return;
		}

		const copy = {...data};
		if (!copy.course) delete copy.course;
		if (!copy.yearAndSection) delete copy.yearAndSection;

		createMemberMutation.mutate(copy, {
			onSuccess(created) {
				setMember(created);
				handleBorrow(created.id);
			},
			onError(error) {
				toaster.error({
					description: error.message,
				});
			},
		});
	});

	const pending =
		lookupMemberMutation.isPending || createMemberMutation.isPending || borrowMutation.isPending;

	return (
		<Dialog.Root
			open={disclosure.open}
			onOpenChange={(details) => disclosure.setOpen(details.open)}
			onExitComplete={reset}
		>
			<Dialog.Context>
				{(api) => (
					<Menu.Item value="borrow" onSelect={() => api.setOpen(true)}>
						<RepeatIcon />
						Borrow
					</Menu.Item>
				)}
			</Dialog.Context>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form
							onSubmit={(e) => {
								if (step === 'CREATE') {
									handleSubmit(e);
								} else {
									e.preventDefault();
								}
							}}
							noValidate
						>
							<Dialog.Header>
								<FeaturedIcon.Root accent={step === 'SUCCESS' ? 'info' : undefined}>
									<FeaturedIcon.Icon>
										{step === 'SUCCESS' ? <CircleCheckIcon /> : <RepeatIcon />}
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Borrow copy</Dialog.Title>
									<Dialog.Description>Fill out the form below to proceed</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>

							{step === 'SEARCH' && (
								<Dialog.Body>
									<Field.Root invalid={searchError !== ''}>
										<Field.Label>ID</Field.Label>
										<div className="flex items-center gap-2">
											<Field.Input
												placeholder="Enter ID"
												value={searchValue}
												onChange={(e) => setSearchValue(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														handleSearch();
													}
												}}
											/>
											<IconButton
												variant="outline"
												accent="gray"
												className="shrink-0"
												disabled={lookupMemberMutation.isPending}
												onClick={handleSearch}
											>
												{lookupMemberMutation.isPending ? (
													<SpinnerIcon className="size-5" />
												) : (
													<ArrowRightIcon />
												)}
											</IconButton>
										</div>
										<Field.ErrorText>{searchError}</Field.ErrorText>
									</Field.Root>
								</Dialog.Body>
							)}

							{step === 'CONFIRM' && member && (
								<Dialog.Body>
									<p className="font-semibold text-gray-600 text-sm">Details</p>
									<dl className="mt-3 space-y-2 rounded-md border border-gray-200 bg-white p-4 text-sm">
										<div className="flex justify-between gap-4">
											<dt className="font-semibold text-gray-600">ID</dt>
											<dd>{member.externalId}</dd>
										</div>
										<div className="flex justify-between gap-4">
											<dt className="font-semibold text-gray-600">Name</dt>
											<dd>{member.name}</dd>
										</div>
										<div className="flex justify-between gap-4">
											<dt className="font-semibold text-gray-600">Course</dt>
											<dd>{member.course ?? '—'}</dd>
										</div>
										<div className="flex justify-between gap-4">
											<dt className="font-semibold text-gray-600">Year and section</dt>
											<dd>{member.yearAndSection ?? '—'}</dd>
										</div>
									</dl>
								</Dialog.Body>
							)}

							{step === 'CREATE' && (
								<Dialog.Body>
									<Field.Root invalid={!!form.formState.errors.externalId}>
										<Field.Label>ID</Field.Label>
										<div className="flex items-center gap-2">
											<Field.Input
												placeholder="Enter ID"
												disabled
												{...form.register('externalId')}
											/>
											<IconButton
												variant="outline"
												accent="gray"
												className="shrink-0"
												onClick={reset}
											>
												<PenSquareIcon />
											</IconButton>
										</div>
										<Field.ErrorText>{form.formState.errors.externalId?.message}</Field.ErrorText>
									</Field.Root>
									<Field.Root invalid={!!form.formState.errors.name}>
										<Field.Label>Name</Field.Label>
										<Field.Input placeholder="Enter name" {...form.register('name')} />
										<Field.ErrorText>{form.formState.errors.name?.message}</Field.ErrorText>
									</Field.Root>
									<Controller
										control={form.control}
										name="course"
										render={({field, fieldState}) => (
											<Field.Root invalid={fieldState.invalid}>
												<Field.Label>Course</Field.Label>
												<SelectField
													placeholder="Select course"
													options={getMemberCourseOptions()}
													value={field.value ?? ''}
													onChange={(value) => {
														field.onChange(value || null);

														if (!value) {
															form.setValue('yearAndSection', null, {
																shouldValidate: true,
															});
														}
													}}
												/>
												<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
											</Field.Root>
										)}
									/>
									<Controller
										control={form.control}
										name="yearAndSection"
										render={({field, fieldState}) => (
											<Field.Root invalid={fieldState.invalid}>
												<Field.Label>Year and Section</Field.Label>
												<SelectField
													placeholder="Select year and section"
													options={getMemberYearAndSectionOptions()}
													value={field.value ?? ''}
													disabled={!course}
													onChange={(value) => {
														field.onChange(value || null);
													}}
												/>
												<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
											</Field.Root>
										)}
									/>
								</Dialog.Body>
							)}

							{step === 'SUCCESS' && transaction && (
								<Dialog.Body>
									<dl className="space-y-2 rounded-md border border-gray-200 bg-white p-4 text-sm">
										<div className="flex justify-between gap-4">
											<dt className="font-semibold text-gray-600">Reference</dt>
											<dd>{transaction.ticket}</dd>
										</div>
										<div className="flex justify-between gap-4">
											<dt className="font-semibold text-gray-600">Borrower</dt>
											<dd>{transaction.member.name}</dd>
										</div>
										<div className="flex justify-between gap-4">
											<dt className="font-semibold text-gray-600">Book</dt>
											<dd>
												{transaction.book?.title ??
													transaction.bookCopy?.book.title ??
													copy.book.title}
											</dd>
										</div>
										<div className="flex justify-between gap-4">
											<dt className="font-semibold text-gray-600">ISBN</dt>
											<dd>{transaction.bookCopy?.isbn ?? copy.isbn}</dd>
										</div>
										<div className="flex justify-between gap-4">
											<dt className="font-semibold text-gray-600">Date borrowed</dt>
											<dd>{format(transaction.dateTimeCreated, 'MMM dd, yyyy hh:mm a')}</dd>
										</div>
									</dl>
								</Dialog.Body>
							)}

							{step === 'SEARCH' && (
								<Dialog.Footer>
									<Dialog.Context>
										{(api) => (
											<Button variant="outline" accent="gray" onClick={() => api.setOpen(false)}>
												Cancel
											</Button>
										)}
									</Dialog.Context>
								</Dialog.Footer>
							)}

							{step === 'CONFIRM' && member && (
								<Dialog.Footer>
									<Dialog.Context>
										{(api) => (
											<Button
												variant="outline"
												accent="gray"
												onClick={() => api.setOpen(false)}
												disabled={pending}
											>
												Cancel
											</Button>
										)}
									</Dialog.Context>
									<Button onClick={() => handleBorrow(member.id)} disabled={pending}>
										{borrowMutation.isPending ? <SpinnerIcon className="size-5" /> : 'Confirm'}
									</Button>
								</Dialog.Footer>
							)}

							{step === 'CREATE' && (
								<Dialog.Footer>
									<Dialog.Context>
										{(api) => (
											<Button
												variant="outline"
												accent="gray"
												onClick={() => api.setOpen(false)}
												disabled={pending}
											>
												Cancel
											</Button>
										)}
									</Dialog.Context>
									<Button type="submit" disabled={pending}>
										{pending ? <SpinnerIcon className="size-5" /> : 'Borrow'}
									</Button>
								</Dialog.Footer>
							)}

							{step === 'SUCCESS' && (
								<Dialog.Footer>
									<Dialog.Context>
										{(api) => <Button onClick={() => api.setOpen(false)}>Done</Button>}
									</Dialog.Context>
								</Dialog.Footer>
							)}
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
