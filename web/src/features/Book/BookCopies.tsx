import {createListCollection, Portal} from '@ark-ui/react';
import {
	BookCopySortByInputDefinition,
	BookCopyStatusDefinition,
	SortOrderDefinition,
} from '@library/types';
import {format} from 'date-fns';
import {SettingsIcon} from 'lucide-react';
import {
	parseAsInteger,
	parseAsIsoDate,
	parseAsNativeArrayOf,
	parseAsString,
	parseAsStringEnum,
	useQueryStates,
} from 'nuqs';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Menu} from '@/components/ui/Menu';
import {type BookCopiesInput, useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {useExportBookCopiesMutation} from '@/hooks/useExportBookCopiesMutation';
import {ReturnBookCopy} from '@/templates/ReturnBookCopy';
import {getBookCopyStatusLabel, getBookCopyStatusOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useBookContext} from './BookContext';
import {BorrowBookCopy} from './BorrowBookCopy';
import {CopyProvider} from './CopyContext';
import {DeleteCopy} from './DeleteCopy';
import {EditBookCopy} from './EditBookCopy';

export function Copies() {
	const book = useBookContext();

	const [state, setState] = useQueryStates({
		page: parseAsInteger.withDefault(1),
		pageSize: parseAsInteger.withDefault(10),
		isbn: parseAsString,
		status: parseAsNativeArrayOf(parseAsStringEnum(BookCopyStatusDefinition.options)),
		sortBy: parseAsStringEnum(BookCopySortByInputDefinition.options),
		dateTimeCreated__from: parseAsIsoDate,
		dateTimeCreated__to: parseAsIsoDate,
		dateTimeUpdated__from: parseAsIsoDate,
		dateTimeUpdated__to: parseAsIsoDate,
		sortOrder: parseAsStringEnum(SortOrderDefinition.options),
	});

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
		...((state.dateTimeCreated__from != null || state.dateTimeCreated__to != null) && {
			dateTimeCreated: {
				gte: state.dateTimeCreated__from ?? null,
				lte: state.dateTimeCreated__to ?? null,
			},
		}),
		...((state.dateTimeUpdated__from != null || state.dateTimeUpdated__to != null) && {
			dateTimeUpdated: {
				gte: state.dateTimeUpdated__from ?? null,
				lte: state.dateTimeUpdated__to ?? null,
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
						onChange: (value) => setState({isbn: value || null}),
					},
				},
				{
					id: 'status',
					heading: 'Status',
					cell(copy) {
						return (
							<Badge.Root
								accent={
									copy.status === 'AVAILABLE'
										? 'success'
										: copy.status === 'RESERVED'
											? 'purple'
											: 'danger'
								}
							>
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
						value: {
							from: state.dateTimeCreated__from ?? null,
							to: state.dateTimeCreated__to ?? null,
						},
						onChange: (dateTimeCreated) => {
							setState({
								dateTimeCreated__from: dateTimeCreated?.from ?? null,
								dateTimeCreated__to: dateTimeCreated?.to ?? null,
							});
						},
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
						value: {
							from: state.dateTimeUpdated__from ?? null,
							to: state.dateTimeUpdated__to ?? null,
						},
						onChange: (dateTimeUpdated) => {
							setState({
								dateTimeUpdated__from: dateTimeUpdated?.from ?? null,
								dateTimeUpdated__to: dateTimeUpdated?.to ?? null,
							});
						},
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
												<EditBookCopy />
												{copy.status === 'AVAILABLE' && <BorrowBookCopy />}
												{copy.status === 'BORROWED' && <ReturnBookCopy id={copy.id} />}
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
