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
import {Badge} from '@/components/ui/Badge';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {type BooksInput, useBooksQuery} from '@/hooks/useBooksQuery';
import {useExportTransactionsMutation} from '@/hooks/useExportTransactionsMutation';
import {type TransactionsInput, useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import {ReturnBookCopy} from '@/templates/ReturnBookCopy';
import {client} from '@/utils/client';
import {
	getTransactionStatusLabel,
	getTransactionStatusOptions,
	getTransactionTypeLabel,
	getTransactionTypeOptions,
} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useMemberContext} from './MemberContext';

export function Transactions() {
	const member = useMemberContext();
	const [state, setState] = useQueryStates({
		page: parseAsInteger.withDefault(1),
		pageSize: parseAsInteger.withDefault(10),
		ticket: parseAsString,
		type: parseAsNativeArrayOf(parseAsStringEnum(TransactionTypeDefinition.options)),
		status: parseAsNativeArrayOf(parseAsStringEnum(TransactionStatusDefinition.options)),
		book: parseAsNativeArrayOf(parseAsString),
		dateTimeCreated__from: parseAsIsoDate,
		dateTimeCreated__to: parseAsIsoDate,
		sortBy: parseAsStringEnum(TransactionSortByInputDefinition.options),
		sortOrder: parseAsStringEnum(SortOrderDefinition.options),
	});

	const filters = {
		page: state.page,
		pageSize: state.pageSize,
		memberId: {
			eq: member.id.toString(),
		},
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
		<DataTable
			id="member-transactions"
			collection={createListCollection({
				items: query.data?.rows ?? [],
				itemToString: (transaction) => transaction.id.toString(),
				itemToValue: (transaction) => transaction.id.toString(),
			})}
			columns={[
				{
					id: 'type',
					heading: 'Type',
					cell(transaction) {
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
								type: value.map((v) => TransactionTypeDefinition.safeParse(v).data).filter(Boolean),
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
					defaultHidden: true,
				},
				{
					id: 'book',
					heading: 'Book',
					cell(transaction) {
						const book = transaction.book ?? transaction.bookCopy?.book;
						return book ? (
							<Link to={`/books/${book.id}`} className="block max-w-64 truncate text-blue-500">
								{book.title}
							</Link>
						) : null;
					},
					filter: {
						type: 'ASYNC_COMBOBOX',
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
						multiple: true,
						placeholder: 'Search book',
					},
					hideable: true,
					orderable: true,
				},
				{
					id: 'isbn',
					heading: 'ISBN',
					cell(transaction) {
						return transaction.bookCopy?.isbn ?? null;
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
											<AlertTriangleIcon className="size-4 text-red-500" />
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
						return (
							<Menu.Root>
								<Menu.Trigger
									disabled={
										transaction.status !== 'PENDING' ||
										transaction.type !== 'BORROW' ||
										!transaction.bookCopy
									}
									className="disabled:opacity-50"
								>
									<SettingsIcon className="size-5" />
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content>
											{transaction.bookCopy && <ReturnBookCopy id={transaction.bookCopy.id} />}
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
			onReload={() => {
				query.refetch();
			}}
			exporting={exportMutation.isPending}
			onExport={() => {
				exportMutation.mutate(filters);
			}}
			total={query.data?.total ?? 0}
			loading={query.isLoading}
			sortColumn={state.sortBy ?? null}
			onSortColumnChange={(value) =>
				setState({
					sortBy: TransactionSortByInputDefinition.nullable().optional().parse(value),
				})
			}
			sortOrder={state.sortOrder ?? null}
			onSortOrderChange={(sortOrder) => setState({sortOrder})}
		/>
	);
}
