import {createListCollection, Portal} from '@ark-ui/react';
import {format} from 'date-fns';
import {PenSquareIcon, RepeatIcon, SettingsIcon, TrashIcon} from 'lucide-react';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Menu} from '@/components/ui/Menu';
import {useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {useBookContext} from './BookContext';

export function Copies() {
	const book = useBookContext();
	const query = useBookCopiesQuery({bookId: {eq: book.id.toString()}});

	return (
		<DataTable
			id="book-copies"
			collection={createListCollection({
				items: query.data?.rows ?? [],
				itemToValue: (item) => item.id.toString(),
				itemToString: (item) => item.isbn,
			})}
			columns={[
				{
					id: 'isbn',
					heading: 'ISBN',
					cell(item) {
						return item.isbn;
					},
					filter: {
						type: 'TEXT',
						placeholder: 'Enter ISBN',
					},
				},
				{
					id: 'status',
					heading: 'Status',
					cell(item) {
						return (
							<Badge.Root accent={item.status === 'AVAILABLE' ? 'success' : 'danger'}>
								<Badge.Label>{item.status}</Badge.Label>
							</Badge.Root>
						);
					},
					filter: {
						type: 'SELECT',
						multiple: true,
						placeholder: 'Select status',
						options: [
							{label: 'Available', value: 'AVAILABLE'},
							{label: 'Borrowed', value: 'BORROWED'},
						],
					},
				},
				{
					id: 'dateTimeCreated',
					heading: 'Date added',
					cell(data) {
						return format(data.dateTimeCreated, 'MMM dd, yyyy hh:mm a');
					},
					filter: {
						type: 'DATE_RANGE',
						placeholder: 'Pick a date',
					},
					sortable: true,
					hideable: true,
					orderable: true,
				},
				{
					id: 'dateTimeUpdated',
					heading: 'Date updated',
					cell(data) {
						return format(data.dateTimeUpdated, 'MMM dd, yyyy hh:mm a');
					},
					filter: {
						type: 'DATE_RANGE',
						placeholder: 'Pick a date',
					},
					sortable: true,
					hideable: true,
					orderable: true,
				},
				{
					id: 'actions',
					heading: <SettingsIcon className="size-5" />,
					cell(item) {
						return (
							<Menu.Root>
								<Menu.Trigger>
									<SettingsIcon className="size-5" />
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content>
											<Menu.Item value="edit">
												<PenSquareIcon />
												Edit
											</Menu.Item>
											{item.status === 'AVAILABLE' && (
												<Menu.Item value="borrow">
													<RepeatIcon />
													Borrow
												</Menu.Item>
											)}
											{item.status === 'BORROWED' && (
												<Menu.Item value="return">
													<RepeatIcon />
													Return
												</Menu.Item>
											)}
											<Menu.Separator />
											<Menu.Item value="delete">
												<TrashIcon />
												Delete
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
			checkEnabled
			paginationEnabled
			onReload={() => {}}
			onExport={() => {}}
		/>
	);
}
