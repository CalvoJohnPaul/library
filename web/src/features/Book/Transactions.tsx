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
					hideable: true,
					orderable: true,
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
								{transaction.student.name}
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
					defaultHidden: true,
					orderable: true,
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
