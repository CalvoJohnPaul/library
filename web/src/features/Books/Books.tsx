import {createListCollection} from '@ark-ui/react';
import {format} from 'date-fns';
import {PlusIcon, SettingsIcon} from 'lucide-react';
import {DataTable} from '@/components/DataTable';
import {Button} from '@/components/ui/Button';
import {useBooksQuery} from '@/hooks/useBooksQuery';

export function Books() {
	const query = useBooksQuery();

	return (
		<div>
			<div className="mb-6 flex items-center">
				<div className="grow">
					<h1 className="font-bold text-lg">Books</h1>
					<p className="text-gray-600 text-sm">Manage your book collection below.</p>
				</div>
				<Button>
					<PlusIcon className="size-5" />
					Add Book
				</Button>
			</div>
			<DataTable
				id="books"
				collection={createListCollection({
					items: query.data?.rows ?? [],
					itemToValue: (item) => item.id.toString(),
					itemToString: (item) => item.title,
				})}
				columns={[
					{
						id: 'title',
						heading: 'Title',
						cell(data) {
							return data.title;
						},
					},
					{
						id: 'author',
						heading: 'Author',
						cell(data) {
							return data.author;
						},
						filter: {
							type: 'TEXT',
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'yearPublished',
						heading: 'Year published',
						cell(data) {
							return data.yearPublished;
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'genre',
						heading: 'Genre',
						cell(data) {
							return data.genre;
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'dateTimeCreated',
						heading: 'Date added',
						cell(data) {
							return format(data.dateTimeCreated, 'MMM dd, yyyy hh:mm a');
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
						sortable: true,
						hideable: true,
						orderable: true,
					},
					{
						id: 'actions',
						heading: <SettingsIcon className="size-5" />,
						cell() {
							return <SettingsIcon className="size-5" />;
						},
						className: 'w-0 text-center',
					},
				]}
				onReload={() => {}}
				checkEnabled
				searchEnabled
				paginationEnabled
				total={query.data?.total ?? 0}
			/>
		</div>
	);
}
