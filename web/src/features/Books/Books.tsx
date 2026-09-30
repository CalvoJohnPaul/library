import {createListCollection, Portal} from '@ark-ui/react';
import {format} from 'date-fns';
import {PenSquareIcon, PlusIcon, SettingsIcon, TrashIcon} from 'lucide-react';
import {useReducer} from 'react';
import {DataTable} from '@/components/DataTable';
import {IconButton} from '@/components/ui/IconButton';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {useBooksQuery} from '@/hooks/useBooksQuery';
import {AddBook} from './AddBook';

interface State {
	page: number;
	pageSize: number;
}

export function Books() {
	const [state, setState] = useReducer(
		(prev: State, next: Partial<State>) => ({
			...prev,
			...next,
		}),
		{
			page: 1,
			pageSize: 10,
		},
	);

	const query = useBooksQuery({
		page: state.page,
		pageSize: state.pageSize,
	});

	return (
		<div>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Books</h1>
					<p className="text-gray-600 text-sm">Manage your book collection below.</p>
				</div>

				<IconButton variant="outline" accent="gray">
					<TrashIcon />
				</IconButton>
				<AddBook />
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
							type: 'ASYNC_COMBOBOX',
							placeholder: 'Search author',
							options: async () => {
								return [];
							},
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
						filter: {
							type: 'DATE_RANGE',
							placeholder: 'Pick a year',
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
						filter: {
							type: 'SELECT',
							options: [],
							multiple: true,
							placeholder: 'Select genre',
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
						cell() {
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
				loading={query.isLoading}
				onReload={() => {
					query.refetch();
				}}
				exporting={false}
				onExport={() => {}}
				checkEnabled
				searchEnabled
				paginationEnabled
				total={query.data?.total ?? 0}
				page={state.page}
				pageSize={state.pageSize}
				onPageChange={(page) => setState({page})}
				onPageSizeChange={(pageSize) => setState({pageSize})}
				cta={
					<AddBook
						trigger={({setOpen}) => (
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<IconButton variant="outline" accent="gray" onClick={() => setOpen(true)}>
										<PlusIcon className="size-5" />
									</IconButton>
								</Tooltip.Trigger>
								<Portal>
									<Tooltip.Positioner>
										<Tooltip.Content>
											<Tooltip.Arrow>
												<Tooltip.ArrowTip />
											</Tooltip.Arrow>
											Add book
										</Tooltip.Content>
									</Tooltip.Positioner>
								</Portal>
							</Tooltip.Root>
						)}
					/>
				}
			/>
		</div>
	);
}
