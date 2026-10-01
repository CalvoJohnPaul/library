import {createListCollection, Portal} from '@ark-ui/react';
import {format} from 'date-fns';
import {PenSquareIcon, RepeatIcon, SettingsIcon, TrashIcon} from 'lucide-react';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Menu} from '@/components/ui/Menu';
import {useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {getBookCopyStatusLabel, getBookCopyStatusOptions} from '@/utils/common';
import {useBookContext} from './BookContext';
import {CopyProvider} from './CopyContext';

export function Copies() {
	const book = useBookContext();
	const query = useBookCopiesQuery({bookId: {eq: book.id.toString()}});

	return (
		<DataTable
			id="book-copies"
			collection={createListCollection({
				items: query.data?.rows ?? [],
				itemToValue: (copy) => copy.id.toString(),
				itemToString: (copy) => copy.isbn,
			})}
			columns={[
				{
					id: 'isbn',
					heading: 'ISBN',
					cell(copy) {
						return copy.isbn;
					},
				},
				{
					id: 'status',
					heading: 'Status',
					cell(copy) {
						return (
							<Badge.Root accent={copy.status === 'AVAILABLE' ? 'success' : 'danger'}>
								<Badge.Label>{getBookCopyStatusLabel(copy.status)}</Badge.Label>
							</Badge.Root>
						);
					},
					filter: {
						type: 'SELECT',
						multiple: true,
						placeholder: 'Select status',
						options: getBookCopyStatusOptions(),
					},
				},
				{
					id: 'dateTimeCreated',
					heading: 'Date added',
					cell(copy) {
						return format(copy.dateTimeCreated, 'MMM dd, yyyy hh:mm a');
					},
					filter: {
						type: 'DATE_RANGE',
						placeholder: 'Select date',
					},
					sortable: true,
				},
				{
					id: 'dateTimeUpdated',
					heading: 'Date updated',
					cell(copy) {
						return format(copy.dateTimeUpdated, 'MMM dd, yyyy hh:mm a');
					},
					filter: {
						type: 'DATE_RANGE',
						placeholder: 'Select date',
					},
					sortable: true,
				},
				{
					id: 'actions',
					heading: <SettingsIcon className="size-5" />,
					cell(copy) {
						return (
							<Menu.Root>
								<Menu.Trigger>
									<SettingsIcon className="size-5" />
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content>
											<CopyProvider value={copy}>
												<Menu.Item value="edit">
													<PenSquareIcon />
													Edit
												</Menu.Item>
												{copy.status === 'AVAILABLE' && (
													<Menu.Item value="borrow">
														<RepeatIcon />
														Borrow
													</Menu.Item>
												)}
												{copy.status === 'BORROWED' && (
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
											</CopyProvider>
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
			total={query.data?.total ?? 0}
			loading={query.isLoading}
			onReload={() => {}}
			onExport={() => {}}
		/>
	);
}
