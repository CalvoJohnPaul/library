import {createListCollection, Portal} from '@ark-ui/react';
import {
	type BookGenre,
	BookGenreDefinition,
	type BookSortByInput,
	BookSortByInputDefinition,
	type SortOrder,
} from '@library/types';
import {format} from 'date-fns';
import {uniq} from 'es-toolkit';
import {CheckIcon, PlusIcon, SettingsIcon, XIcon} from 'lucide-react';
import {useReducer} from 'react';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {IconButton} from '@/components/ui/IconButton';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {type BooksInput, useBooksQuery} from '@/hooks/useBooksQuery';
import type {DateRange} from '@/types/index';
import {client} from '@/utils/client';
import {getBookGenreLabel, getBookGenreOptions, getBookYearPublishedOptions} from '@/utils/common';
import {AddBook} from './AddBook';
import {BookProvider} from './BookContext';
import {DeleteBook} from './DeleteBook';
import {EditBook} from './EditBook';

interface State {
	page: number;
	pageSize: number;
	title?: string[] | null;
	author?: string | null;
	genre?: BookGenre[] | null;
	yearPublished?: number[] | null;
	available?: boolean | null;
	dateTimeCreated?: DateRange | null;
	dateTimeUpdated?: DateRange | null;
	sortBy?: BookSortByInput | null;
	sortOrder?: SortOrder | null;
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

	const id = uniq([...(state.title ?? []) /* merge ids here */]);
	const query = useBooksQuery({
		page: state.page,
		pageSize: state.pageSize,
		...(id.length && {
			id: {
				in: id,
			},
		}),
		...(state.author && {
			author: {
				contains: state.author,
			},
		}),
		...(state.yearPublished?.length && {
			yearPublished: {
				in: state.yearPublished,
			},
		}),
		...(state.genre?.length && {
			genre: {
				in: state.genre,
			},
		}),
		...(state.available != null && {
			available: {
				eq: state.available,
			},
		}),
		...((state.dateTimeCreated?.from != null || state.dateTimeCreated?.to != null) && {
			dateTimeCreated: {
				gte: state.dateTimeCreated?.from ?? null,
				lte: state.dateTimeCreated?.to ?? null,
			},
		}),
		...((state.dateTimeUpdated?.from != null || state.dateTimeUpdated?.to != null) && {
			dateTimeUpdated: {
				gte: state.dateTimeUpdated?.from ?? null,
				lte: state.dateTimeUpdated?.to ?? null,
			},
		}),
		...(state.sortBy && {
			sortBy: state.sortBy,
		}),
		...(state.sortOrder && {
			sortOrder: state.sortOrder,
		}),
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
						filter: {
							type: 'ASYNC_COMBOBOX',
							placeholder: 'Search title',
							multiple: true,
							value: state.title ?? [],
							onChange(title) {
								setState({title});
							},
							options: async (search) => {
								try {
									const input: BooksInput = {title: {contains: search}};
									const data = await client.query({
										queryKey: useBooksQuery.getQueryKey(input),
										queryFn: useBooksQuery.getQueryFn(input),
									});

									return data.rows.map((book) => ({
										label: book.title,
										value: book.id.toString(),
									}));
								} catch {
									return [];
								}
							},
						},
					},
					{
						id: 'author',
						heading: 'Author',
						cell(book) {
							return <span className="block max-w-48 truncate">{book.author}</span>;
						},
						filter: {
							type: 'TEXT',
							placeholder: 'Enter author',
							value: state.author ?? '',
							onChange(author) {
								setState({author});
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
							value: state.yearPublished?.map(String) ?? [],
							onChange(value) {
								setState({
									yearPublished: value.map(Number) ?? null,
								});
							},
						},
						hideable: true,
						orderable: true,
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
							value: state.genre ?? [],
							onChange(value) {
								setState({
									genre:
										value.map((v) => BookGenreDefinition.safeParse(v).data).filter(Boolean) ?? null,
								});
							},
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
							multiple: false,
							value: state.available == null ? '' : state.available ? 'YES' : 'NO',
							onChange: (value) => {
								setState({
									available: value === 'YES' ? true : value === 'NO' ? false : null,
								});
							},
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
							value: state.dateTimeCreated ?? null,
							onChange: (dateTimeCreated) => {
								setState({dateTimeCreated});
							},
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
							value: state.dateTimeUpdated ?? null,
							onChange: (dateTimeUpdated) => {
								setState({dateTimeUpdated});
							},
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
													<EditBook />
													<DeleteBook />
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
				paginationEnabled
				total={query.data?.total ?? 0}
				page={state.page}
				pageSize={state.pageSize}
				onPageChange={(page) => setState({page})}
				onPageSizeChange={(pageSize) => setState({pageSize})}
				sortColumn={state.sortBy ?? null}
				onSortColumnChange={(value) =>
					setState({
						sortBy: BookSortByInputDefinition.nullable().optional().parse(value),
					})
				}
				sortOrder={state.sortOrder ?? null}
				onSortOrderChange={(sortOrder) => setState({sortOrder})}
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
