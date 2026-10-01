import {createListCollection, Portal} from '@ark-ui/react';
import {differenceInDays, format} from 'date-fns';
import {AlertTriangleIcon} from 'lucide-react';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Tooltip} from '@/components/ui/Tooltip';
import {useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import {getTransactionTypeLabel, getTransactionTypeOptions} from '@/utils/common';
import {useBookContext} from './BookContext';

export function Transactions() {
	const book = useBookContext();
	const query = useTransactionsQuery({
		bookId: {
			eq: book.id.toString(),
		},
	});

	return (
		<DataTable
			id="book-transactions"
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
					id: 'isbn',
					heading: 'ISBN',
					cell(transaction) {
						return transaction.bookCopy.isbn;
					},
					filter: {
						type: 'TEXT',
						placeholder: 'Enter ISBN',
					},
				},
				{
					id: 'student',
					heading: 'Student',
					cell(transaction) {
						return (
							<Link
								to={`/students/${transaction.student.id}`}
								className="block max-w-48 truncate text-blue-500"
							>
								{`${transaction.student.firstName} ${transaction.student.lastName}`}
							</Link>
						);
					},
					filter: {
						type: 'ASYNC_COMBOBOX',
						options: async () => {
							return [];
						},
						multiple: true,
						placeholder: 'Search student',
					},
				},
				{
					id: 'remarks',
					heading: 'Remarks',
					cell(transaction) {
						return transaction.remarks;
					},
				},
				{
					id: 'dateTimeCreated',
					heading: 'Transaction date',
					cell: (transaction) => {
						const overdue =
							transaction.type === 'BORROW' &&
							transaction.status === 'PENDING' &&
							differenceInDays(new Date(), transaction.dateTimeCreated) >= 3;

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
													Overdue
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
				},
			]}
			paginationEnabled
			onReload={() => {}}
			onExport={() => {}}
			total={query.data?.total ?? 0}
			loading={query.isLoading}
		/>
	);
}
