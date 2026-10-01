import {createListCollection, Portal} from '@ark-ui/react';
import {format} from 'date-fns';
import {CheckIcon, PenSquareIcon, PlusIcon, SettingsIcon, TrashIcon, XIcon} from 'lucide-react';
import {useReducer} from 'react';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {IconButton} from '@/components/ui/IconButton';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {useBooksQuery} from '@/hooks/useBooksQuery';
import {getBookGenreLabel, getBookGenreOptions, getBookYearPublishedOptions} from '@/utils/common';
import {AddBook} from './AddBook';
import {BookProvider} from './BookContext';

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
		<>
			<title>Books | read.</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Books</h1>
					<p className="text-gray-600 text-sm">Manage your book collection below.</p>
				</div>
				<AddBook />
			</div>
			<DataTable
				id="books"
				collection={createListCollection({
					items: query.data?.rows ?? [],
					itemToValue: (book) => book.id.toString(),
					itemToString: (book) => book.title,
				})}
				columns={[
					{
						id: 'title',
						heading: 'Title',
						cell(book) {
							return (
								<Link to={`/books/${book.id}`} className="block max-w-64 truncate text-blue-500">
									{book.title}
								</Link>
							);
						},
					},
					{
						id: 'author',
						heading: 'Author',
						cell(book) {
							return <span className="block max-w-48 truncate">{book.author}</span>;
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
						cell(book) {
							return book.yearPublished;
						},
						filter: {
							type: 'SELECT',
							options: getBookYearPublishedOptions(),
							multiple: true,
							placeholder: 'Select year',
						},
						hideable: true,
						orderable: true,
						className: 'tabular-nums',
					},
					{
						id: 'genre',
						heading: 'Genre',
						cell(book) {
							return getBookGenreLabel(book.genre);
						},
						filter: {
							type: 'SELECT',
							options: getBookGenreOptions(),
							multiple: true,
							placeholder: 'Select genre',
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'totalCopies',
						heading: 'No. of copies',
						cell(book) {
							return book.totalCopies.toLocaleString('en-US', {
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							});
						},
						numeric: true,
						hideable: true,
						orderable: true,
					},
					{
						id: 'available',
						heading: 'Status',
						cell(book) {
							return (
								<Badge.Root accent={book.available ? 'success' : 'danger'}>
									<Badge.Icon>{book.available ? <CheckIcon /> : <XIcon />}</Badge.Icon>
									<Badge.Label>{book.available ? 'Available' : 'Unavailable'}</Badge.Label>
								</Badge.Root>
							);
						},
						hideable: true,
						orderable: true,
						filter: {
							type: 'SELECT',
							options: [
								{label: 'Available', value: 'YES'},
								{label: 'Unavailable', value: 'NO'},
							],
						},
					},
					{
						id: 'dateTimeCreated',
						heading: 'Date added',
						cell(book) {
							return format(book.dateTimeCreated, 'MMM dd, yyyy hh:mm a');
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
						cell(book) {
							return format(book.dateTimeUpdated, 'MMM dd, yyyy hh:mm a');
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
						cell(book) {
							return (
								<Menu.Root>
									<Menu.Trigger>
										<SettingsIcon className="size-5" />
									</Menu.Trigger>
									<Portal>
										<Menu.Positioner>
											<Menu.Content>
												<BookProvider value={book}>
													<Menu.Item value="edit">
														<PenSquareIcon />
														Edit
													</Menu.Item>
													<Menu.Item value="delete">
														<TrashIcon />
														Delete
													</Menu.Item>
												</BookProvider>
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
		</>
	);
}
