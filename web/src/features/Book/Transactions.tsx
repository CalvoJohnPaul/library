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
				itemToString: (item) => item.id.toString(),
				itemToValue: (item) => item.id.toString(),
			})}
			columns={[
				{
					id: 'type',
					heading: 'Type',
					cell(item) {
						return (
							<Badge.Root accent={item.type === 'BORROW' ? 'danger' : 'success'}>
								<Badge.Label>{item.type}</Badge.Label>
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
					cell(item) {
						return item.bookCopy.isbn;
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
					cell(item) {
						return (
							<span className="block max-w-48 truncate">{`${item.student.firstName} ${item.student.lastName}`}</span>
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
					cell(item) {
						return format(item.dateTimeCreated, 'MMM dd, yyyy hh:mm a');
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
