import {createListCollection, Portal} from '@ark-ui/react';
import {
	type BookCopySortByInput,
	BookCopySortByInputDefinition,
	type BookCopyStatus,
	BookCopyStatusDefinition,
	type SortOrder,
} from '@library/types';
import {format} from 'date-fns';
import {SettingsIcon} from 'lucide-react';
import {useReducer} from 'react';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Menu} from '@/components/ui/Menu';
import {type BookCopiesInput, useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {useExportBookCopiesMutation} from '@/hooks/useExportBookCopiesMutation';
import type {DateRange} from '@/types/index';
import {getBookCopyStatusLabel, getBookCopyStatusOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useBookContext} from './BookContext';
import {BorrowCopy} from './BorrowCopy';
import {CopyProvider} from './CopyContext';
import {DeleteCopy} from './DeleteCopy';
import {EditCopy} from './EditCopy';
import {ReturnCopy} from './ReturnCopy';

interface State {
	page: number;
	pageSize: number;
	isbn?: string | null;
	status?: BookCopyStatus[] | null;
	sortBy?: BookCopySortByInput | null;
	dateTimeCreated?: DateRange | null;
	dateTimeUpdated?: DateRange | null;
	sortOrder?: SortOrder | null;
}

export function Copies() {
	const book = useBookContext();

	const [state, setState] = useReducer(
		(prev: State, next: Partial<State>) => ({...prev, ...next}),
		{
			page: 1,
			pageSize: 10,
		},
	);

	const filters = {
		page: state.page,
		pageSize: state.pageSize,
		bookId: {
			eq: book.id.toString(),
		},
		...(state.isbn && {
			isbn: {
				contains: state.isbn,
			},
		}),
		...(state.status?.length && {
			status: {
				in: state.status,
			},
		}),
		...((state.dateTimeCreated?.from || state.dateTimeCreated?.to) && {
			dateTimeCreated: {
				gte: state.dateTimeCreated.from,
				lte: state.dateTimeCreated.to,
			},
		}),
		...((state.dateTimeUpdated?.from || state.dateTimeUpdated?.to) && {
			dateTimeUpdated: {
				gte: state.dateTimeUpdated.from,
				lte: state.dateTimeUpdated.to,
			},
		}),
		...(state.sortBy && {
			sortBy: state.sortBy,
		}),
		...(state.sortOrder && {
			sortOrder: state.sortOrder,
		}),
	} satisfies BookCopiesInput;

	const query = useBookCopiesQuery(filters);

	const exportMutation = useExportBookCopiesMutation({
		onError: (error) => {
			toaster.error({
				description: error.message,
			});
		},
	});

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
					filter: {
						type: 'TEXT',
						placeholder: 'Enter ISBN',
						value: state.isbn ?? '',
						onChange: (value) => setState({isbn: value}),
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
						value: state.status ?? [],
						onChange: (value) =>
							setState({
								status: value
									.map((v) => BookCopyStatusDefinition.safeParse(v).data)
									.filter(Boolean),
							}),
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
						value: state.dateTimeCreated ?? null,
						onChange: (dateTimeCreated) => setState({dateTimeCreated}),
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
						value: state.dateTimeUpdated ?? null,
						onChange: (dateTimeUpdated) => setState({dateTimeUpdated}),
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
												<EditCopy />
												{copy.status === 'AVAILABLE' && <BorrowCopy />}
												{copy.status === 'BORROWED' && <ReturnCopy />}
												<Menu.Separator />
												<DeleteCopy />
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
			exporting={exportMutation.isPending}
			onExport={() => {
				exportMutation.mutate(filters);
			}}
			sortColumn={state.sortBy ?? null}
			onSortColumnChange={(value) =>
				setState({
					sortBy: BookCopySortByInputDefinition.nullable().optional().parse(value),
				})
			}
			sortOrder={state.sortOrder ?? null}
			onSortOrderChange={(sortOrder) => setState({sortOrder})}
		/>
	);
}
