import {createListCollection} from '@ark-ui/react';
import {format} from 'date-fns';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {useTransactionsQuery} from '@/hooks/useTransactionsQuery';
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
							<Badge.Root accent={transaction.type === 'BORROW' ? 'danger' : 'success'}>
								<Badge.Label>{transaction.type}</Badge.Label>
							</Badge.Root>
						);
					},
					filter: {
						type: 'SELECT',
						options: [
							{label: 'Borrow', value: 'BORROW'},
							{label: 'Return', value: 'RETURN'},
						],
						multiple: true,
						placeholder: 'Select type',
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
					className: 'tabular-nums',
				},
				{
					id: 'student',
					heading: 'Student',
					cell(transaction) {
						return (
							<span className="block max-w-48 truncate">{`${transaction.student.firstName} ${transaction.student.lastName}`}</span>
						);
					},
					filter: {
						type: 'ASYNC_COMBOBOX',
						placeholder: 'Search student',
						options: async () => {
							return [];
						},
					},
				},
				{
					id: 'dateTimeCreated',
					heading: 'Transaction date',
					cell(transaction) {
						return format(transaction.dateTimeCreated, 'MMM dd, yyyy hh:mm a');
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
