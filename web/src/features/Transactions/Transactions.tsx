import {createListCollection, Portal} from '@ark-ui/react';
import {
	SortOrderDefinition,
	TransactionSortByInputDefinition,
	TransactionStatusDefinition,
	TransactionTypeDefinition,
} from '@library/types';
import {addDays, differenceInDays, format} from 'date-fns';
import {clamp} from 'es-toolkit';
import {AlertTriangleIcon, SettingsIcon} from 'lucide-react';
import {
	parseAsInteger,
	parseAsIsoDate,
	parseAsNativeArrayOf,
	parseAsString,
	parseAsStringEnum,
	useQueryStates,
} from 'nuqs';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {SettingsOffIcon} from '@/components/icons/SettingsOffIcon';
import {Badge} from '@/components/ui/Badge';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {type BooksInput, useBooksQuery} from '@/hooks/useBooksQuery';
import {useExportTransactionsMutation} from '@/hooks/useExportTransactionsMutation';
import {type MembersInput, useMembersQuery} from '@/hooks/useMembersQuery';
import {type TransactionsInput, useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import {ClaimReservation} from '@/templates/ClaimReservation';
import {ReturnBookCopy} from '@/templates/ReturnBookCopy';
import {UnreserveReservation} from '@/templates/UnreserveReservation';
import {client} from '@/utils/client';
import {
	getTransactionStatusLabel,
	getTransactionStatusOptions,
	getTransactionTypeLabel,
	getTransactionTypeOptions,
} from '@/utils/common';
import {toaster} from '@/utils/toaster';

export function Transactions() {
	const [state, setState] = useQueryStates({
		page: parseAsInteger.withDefault(1),
		pageSize: parseAsInteger.withDefault(10),
		ticket: parseAsString,
		type: parseAsNativeArrayOf(parseAsStringEnum(TransactionTypeDefinition.options)),
		status: parseAsNativeArrayOf(parseAsStringEnum(TransactionStatusDefinition.options)),
		book: parseAsNativeArrayOf(parseAsString),
		isbn: parseAsString,
		member: parseAsNativeArrayOf(parseAsString),
		dateTimeCreated__from: parseAsIsoDate,
		dateTimeCreated__to: parseAsIsoDate,
		sortBy: parseAsStringEnum(TransactionSortByInputDefinition.options),
		sortOrder: parseAsStringEnum(SortOrderDefinition.options),
	});

	const filters = {
		page: state.page,
		pageSize: state.pageSize,
		...(state.ticket && {
			ticket: {
				contains: state.ticket,
			},
		}),
		...(state.type?.length && {
			type: {
				in: state.type,
			},
		}),
		...(state.status?.length && {
			status: {
				in: state.status,
			},
		}),
		...(state.book?.length && {
			bookId: {
				in: state.book,
			},
		}),
		...(state.isbn && {
			isbn: {
				contains: state.isbn,
			},
		}),
		...(state.member?.length && {
			memberId: {
				in: state.member,
			},
		}),
		...((state.dateTimeCreated__from != null || state.dateTimeCreated__to != null) && {
			dateTimeCreated: {
				gte: state.dateTimeCreated__from ?? null,
				lte: state.dateTimeCreated__to ?? null,
			},
		}),
		...(state.sortBy && {
			sortBy: state.sortBy,
		}),
		...(state.sortOrder && {
			sortOrder: state.sortOrder,
		}),
	} satisfies TransactionsInput;

	const query = useTransactionsQuery(filters);

	const exportMutation = useExportTransactionsMutation({
		onError: (error) => {
			toaster.error({
				description: error.message,
			});
		},
	});

	return (
		<>
			<title>Transactions | USAT</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Transactions</h1>
					<p className="text-neutral-600 text-sm dark:text-neutral-300">
						View transaction history below.
					</p>
				</div>
			</div>
			<DataTable
				id="transactions"
				collection={createListCollection({
					items: query.data?.rows ?? [],
					itemToString: (transaction) => transaction.id.toString(),
					itemToValue: (transaction) => transaction.id.toString(),
				})}
				columns={[
					{
						id: 'type',
						heading: 'Type',
						cell: (transaction) => {
							return (
								<Badge.Root
									accent={
										transaction.type === 'BORROW'
											? 'warning'
											: transaction.type === 'RESERVE'
												? 'purple'
												: transaction.type === 'UNRESERVE'
													? 'indigo'
													: 'success'
									}
								>
									<Badge.Label>{getTransactionTypeLabel(transaction.type)}</Badge.Label>
								</Badge.Root>
							);
						},
						filter: {
							type: 'SELECT',
							options: getTransactionTypeOptions(),
							multiple: true,
							placeholder: 'Select type',
							value: state.type ?? [],
							onChange: (value) =>
								setState({
									type: value
										.map((v) => TransactionTypeDefinition.safeParse(v).data)
										.filter(Boolean),
								}),
						},
					},
					{
						id: 'ticket',
						heading: 'Ticket',
						cell: (transaction) => transaction.ticket,
						filter: {
							type: 'TEXT',
							placeholder: 'Enter ticket',
							value: state.ticket ?? '',
							onChange: (value) => setState({ticket: value || null}),
						},
					},
					{
						id: 'status',
						heading: 'Status',
						cell: (transaction) => {
							return (
								<Badge.Root accent={transaction.status === 'PENDING' ? 'warning' : 'success'}>
									<Badge.Label>{getTransactionStatusLabel(transaction.status)}</Badge.Label>
								</Badge.Root>
							);
						},
						filter: {
							type: 'SELECT',
							options: getTransactionStatusOptions(),
							multiple: true,
							placeholder: 'Select status',
							value: state.status ?? [],
							onChange: (value) =>
								setState({
									status: value
										.map((v) => TransactionStatusDefinition.safeParse(v).data)
										.filter(Boolean),
								}),
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'book',
						heading: 'Book',
						cell: (transaction) => {
							const book = transaction.book ?? transaction.bookCopy?.book;
							return book ? (
								<Link
									to={`/books/${book.id}`}
									className="block max-w-64 truncate text-blue-500 dark:text-blue-400"
								>
									{book.title}
								</Link>
							) : null;
						},
						filter: {
							type: 'ASYNC_COMBOBOX',
							multiple: true,
							options: async (search, value) => {
								let input: BooksInput;

								if (search.trim() === '' && value.length > 0) {
									input = {
										id: {in: value},
										page: 1,
									};
								} else {
									input = {
										title: {contains: search},
										page: 1,
										pageSize: 25,
									};
								}

								try {
									const data = await client.query({
										queryFn: useBooksQuery.getQueryFn(input),
										queryKey: useBooksQuery.getQueryKey(input),
									});

									return data.rows.map((book) => ({
										value: book.id.toString(),
										label: `${book.title} (${book.author})`,
									}));
								} catch {
									return [];
								}
							},
							value: state.book ?? [],
							onChange: (book) => setState({book}),
							placeholder: 'Search book',
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'isbn',
						heading: 'ISBN',
						cell: (transaction) => transaction.bookCopy?.isbn ?? null,
						filter: {
							type: 'TEXT',
							placeholder: 'Enter ISBN',
							value: state.isbn ?? '',
							onChange: (value) => setState({isbn: value || null}),
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'member',
						heading: 'Member',
						cell: (transaction) => (
							<Link
								to={`/members/${transaction.member.id}`}
								className="block max-w-48 truncate text-blue-500 dark:text-blue-400"
							>
								{transaction.member.name}
							</Link>
						),
						filter: {
							type: 'ASYNC_COMBOBOX',
							options: async (search, value) => {
								let input: MembersInput;

								if (search.trim() === '' && value.length > 0) {
									input = {
										id: {in: value},
										page: 1,
									};
								} else {
									input = {
										name: {contains: search},
										page: 1,
										pageSize: 25,
									};
								}

								const data = await client.query({
									queryFn: useMembersQuery.getQueryFn(input),
									queryKey: useMembersQuery.getQueryKey(input),
								});

								return data.rows.map((member) => ({
									value: member.id.toString(),
									label: `${member.name} (${member.externalId})`,
								}));
							},
							value: state.member ?? [],
							onChange: (member) => setState({member}),
							multiple: true,
							placeholder: 'Search member',
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'remarks',
						heading: 'Remarks',
						cell(transaction) {
							return transaction.remarks;
						},
						hideable: true,
						orderable: true,
						defaultHidden: true,
					},
					{
						id: 'dateTimeCreated',
						heading: 'Transaction date',
						cell: (transaction) => {
							const overdue =
								transaction.type === 'BORROW' &&
								transaction.status === 'PENDING' &&
								differenceInDays(new Date(), transaction.dateTimeCreated) >= 3;
							const overdueDaysCount =
								transaction.type === 'BORROW' && transaction.status === 'PENDING'
									? clamp(
											differenceInDays(new Date(), addDays(transaction.dateTimeCreated, 3)),
											1,
											Infinity,
										)
									: 0;

							return (
								<div className="flex items-center gap-1">
									{format(transaction.dateTimeCreated, 'MMM dd, yyyy hh:mm a')}
									{overdue && (
										<Tooltip.Root>
											<Tooltip.Trigger>
												<AlertTriangleIcon className="size-4 text-rose-500 dark:text-rose-400" />
											</Tooltip.Trigger>
											<Portal>
												<Tooltip.Positioner>
													<Tooltip.Content>
														<Tooltip.Arrow>
															<Tooltip.ArrowTip />
														</Tooltip.Arrow>
														{overdueDaysCount}
														{overdueDaysCount > 1 ? ' days overdue' : ' day overdue'}
													</Tooltip.Content>
												</Tooltip.Positioner>
											</Portal>
										</Tooltip.Root>
									)}
								</div>
							);
						},
						filter: {
							type: 'DATE_RANGE',
							placeholder: 'Select date',
							value: {
								from: state.dateTimeCreated__from ?? null,
								to: state.dateTimeCreated__to ?? null,
							},
							onChange: (dateTimeCreated) => {
								setState({
									dateTimeCreated__from: dateTimeCreated?.from ?? null,
									dateTimeCreated__to: dateTimeCreated?.to ?? null,
								});
							},
						},
						sortable: true,
						hideable: true,
						orderable: true,
					},
					{
						id: 'actions',
						heading: <SettingsIcon className="size-5" />,
						cell(transaction) {
							const canReturn =
								transaction.type === 'BORROW' &&
								transaction.status === 'PENDING' &&
								transaction.bookCopy != null;
							const reservation = transaction.type === 'RESERVE' ? transaction.reservation : null;
							const canManageReservation = reservation?.status === 'PENDING';

							return (
								<Menu.Root>
									<Menu.Trigger
										disabled={!canReturn && !canManageReservation}
										className="disabled:opacity-75"
									>
										{canReturn || canManageReservation ? (
											<SettingsIcon className="size-5" />
										) : (
											<SettingsOffIcon className="size-5" />
										)}
									</Menu.Trigger>
									<Portal>
										<Menu.Positioner>
											<Menu.Content>
												{canReturn && transaction.bookCopy && (
													<ReturnBookCopy
														id={transaction.bookCopy.id}
														onReturned={() => {
															client.invalidateQueries({
																queryKey: useTransactionsQuery.getQueryKey(),
															});
														}}
													/>
												)}
												{canManageReservation && reservation && (
													<>
														<ClaimReservation
															id={reservation.id}
															disabled={reservation.bookCopy?.status !== 'RESERVED'}
															onClaimed={() => {
																client.invalidateQueries({
																	queryKey: useTransactionsQuery.getQueryKey(),
																});
															}}
														/>
														<UnreserveReservation
															id={reservation.id}
															onUnreserved={() => {
																client.invalidateQueries({
																	queryKey: useTransactionsQuery.getQueryKey(),
																});
															}}
														/>
													</>
												)}
											</Menu.Content>
										</Menu.Positioner>
									</Portal>
								</Menu.Root>
							);
						},
						className: 'w-0 text-center',
					},
				]}
				paginationEnabled
				page={state.page}
				pageSize={state.pageSize}
				onPageChange={(page) => setState({page})}
				onPageSizeChange={(pageSize) => setState({pageSize})}
				total={query.data?.total ?? 0}
				loading={query.isLoading}
				onReload={() => {
					query.refetch();
				}}
				exporting={exportMutation.isPending}
				onExport={() => {
					exportMutation.mutate(filters);
				}}
				sortColumn={state.sortBy ?? null}
				onSortColumnChange={(value) =>
					setState({
						sortBy: TransactionSortByInputDefinition.nullable().optional().parse(value),
					})
				}
				sortOrder={state.sortOrder ?? null}
				onSortOrderChange={(sortOrder) => setState({sortOrder})}
			/>
		</>
	);
}
