import {createListCollection, Portal} from '@ark-ui/react';
import {addDays, differenceInDays, format} from 'date-fns';
import {AlertTriangleIcon, CornerDownLeftIcon, SettingsIcon} from 'lucide-react';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {useTransactionsQuery} from '@/hooks/useTransactionsQuery';
import {getTransactionTypeLabel, getTransactionTypeOptions} from '@/utils/common';
import {useStudentContext} from './StudentContext';

export function Transactions() {
	const student = useStudentContext();
	const query = useTransactionsQuery({
		studentId: {
			eq: student.id.toString(),
		},
	});

	return (
		<DataTable
			id="student-transactions"
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
						options: async () => [],
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
											<Menu.Item value="return">
												<CornerDownLeftIcon />
												Return
											</Menu.Item>
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
			onReload={() => {}}
			onExport={() => {}}
			total={query.data?.total ?? 0}
			loading={query.isLoading}
		/>
	);
}
