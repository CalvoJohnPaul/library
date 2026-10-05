import {createListCollection, Portal} from '@ark-ui/react';
import {type TransactionType, TransactionTypeDefinition} from '@library/types';
import {addDays, differenceInDays, format} from 'date-fns';
import {AlertTriangleIcon, SettingsIcon} from 'lucide-react';
import {useReducer} from 'react';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {type BooksInput, useBooksQuery} from '@/hooks/useBooksQuery';
import {useExportTransactionsMutation} from '@/hooks/useExportTransactionsMutation';
import {type TransactionsInput, useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import type {DateRange} from '@/types/index';
import {client} from '@/utils/client';
import {getTransactionTypeLabel, getTransactionTypeOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {BookCopyProvider} from './BookCopyContext';
import {useMemberContext} from './MemberContext';
import {ReturnBookCopy} from './ReturnBookCopy';

interface State {
	page: number;
	pageSize: number;
	ticket?: string | null;
	type?: TransactionType[] | null;
	book?: string[] | null;
	dateTimeCreated?: DateRange | null;
}

export function Transactions() {
	const member = useMemberContext();
	const [state, setState] = useReducer(
		(prev: State, next: Partial<State>) => ({...prev, ...next}),
		{
			page: 1,
			pageSize: 10,
		},
	);

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
		...(state.book?.length && {
			bookId: {
				in: state.book,
			},
		}),
		...((state.dateTimeCreated?.from || state.dateTimeCreated?.to) && {
			dateTimeCreated: {
				gte: state.dateTimeCreated?.from,
				lte: state.dateTimeCreated?.to,
			},
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
							<Badge.Root accent={transaction.type === 'BORROW' ? 'warning' : 'success'}>
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
						onChange: (value) => setState({ticket: value}),
					},
				},
				{
					id: 'book',
					heading: 'Book',
					cell(transaction) {
						return (
							<Link
								to={`/books/${transaction.bookCopy.book.id}`}
								className="block max-w-64 truncate text-blue-500"
							>
								{transaction.bookCopy.book.title}
							</Link>
						);
					},
					filter: {
						type: 'ASYNC_COMBOBOX',
						options: async (search) => {
							if (search.trim() === '') return [];

							try {
								const input: BooksInput = {
									title: {contains: search},
									page: 1,
									pageSize: 25,
								};

								const data = await client.query({
									queryFn: useBooksQuery.getQueryFn(input),
									queryKey: useBooksQuery.getQueryKey(input),
								});

								return data.rows.map((book) => ({
									value: book.id.toString(),
									label: book.title,
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
						return transaction.bookCopy.isbn;
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
								? differenceInDays(new Date(), addDays(transaction.dateTimeCreated, 3))
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
						value: state.dateTimeCreated ?? null,
						onChange: (dateTimeCreated) => setState({dateTimeCreated}),
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
									disabled={transaction.status !== 'PENDING' || transaction.type !== 'BORROW'}
									className="disabled:opacity-50"
								>
									<SettingsIcon className="size-5" />
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content>
											<BookCopyProvider value={transaction.bookCopy}>
												<ReturnBookCopy />
											</BookCopyProvider>
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
		/>
	);
}
