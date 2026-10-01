import {createListCollection, Portal} from '@ark-ui/react';
import {addDays, differenceInDays, format} from 'date-fns';
import {AlertTriangleIcon} from 'lucide-react';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Tooltip} from '@/components/ui/Tooltip';
import {useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import {getTransactionTypeLabel, getTransactionTypeOptions} from '@/utils/common';

export function Transactions() {
	const query = useTransactionsQuery();

	return (
		<>
			<title>Transactions | read.</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Transactions</h1>
					<p className="text-gray-600 text-sm">View transaction history below.</p>
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
						},
					},
					{
						id: 'ticket',
						heading: 'Ticket',
						cell: (transaction) => transaction.ticket,
						filter: {
							type: 'TEXT',
							placeholder: 'Enter ticket',
						},
					},
					{
						id: 'book',
						heading: 'Book',
						cell: (transaction) => (
							<Link
								to={`/books/${transaction.bookCopy.book.id}`}
								className="block max-w-64 truncate text-blue-500"
							>
								{transaction.bookCopy.book.title}
							</Link>
						),
						filter: {
							type: 'ASYNC_COMBOBOX',
							multiple: true,
							options: async () => {
								return [];
							},
							placeholder: 'Search book',
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'isbn',
						heading: 'ISBN',
						cell: (transaction) => transaction.bookCopy.isbn,
						filter: {
							type: 'TEXT',
							placeholder: 'Enter ISBN',
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'student',
						heading: 'Student',
						cell: (transaction) => (
							<Link
								to={`/students/${transaction.student.id}`}
								className="block max-w-48 truncate text-blue-500"
							>
								{`${transaction.student.firstName} ${transaction.student.lastName}`}
							</Link>
						),
						filter: {
							type: 'ASYNC_COMBOBOX',
							options: async () => {
								return [];
							},
							multiple: true,
							placeholder: 'Search student',
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
						},
						sortable: true,
						hideable: true,
						orderable: true,
					},
				]}
				paginationEnabled
				total={query.data?.total ?? 0}
				loading={query.isLoading}
				onReload={() => {}}
				onExport={() => {}}
			/>
		</>
	);
}
