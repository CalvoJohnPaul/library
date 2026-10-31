import {createListCollection, Portal} from '@ark-ui/react';
import {
	ReservationSortByInputDefinition,
	ReservationStatusDefinition,
	SortOrderDefinition,
} from '@library/types';
import {format} from 'date-fns';
import {PlusIcon, SettingsIcon} from 'lucide-react';
import {
	parseAsInteger,
	parseAsIsoDate,
	parseAsNativeArrayOf,
	parseAsString,
	parseAsStringEnum,
	useQueryStates,
} from 'nuqs';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {IconButton} from '@/components/ui/IconButton';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {type BooksInput, useBooksQuery} from '@/hooks/useBooksQuery';
import {useExportReservationsMutation} from '@/hooks/useExportReservationsMutation';
import {type MembersInput, useMembersQuery} from '@/hooks/useMembersQuery';
import {type ReservationsInput, useReservationsQuery} from '@/hooks/useReservationsQuery';
import {ClaimReservation} from '@/templates/ClaimReservation';
import {UnreserveReservation} from '@/templates/UnreserveReservation';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';
import {AddReservation} from './AddReservation';

export function Reservations() {
	const [state, setState] = useQueryStates({
		page: parseAsInteger.withDefault(1),
		pageSize: parseAsInteger.withDefault(10),
		ticket: parseAsString,
		status: parseAsNativeArrayOf(parseAsStringEnum(ReservationStatusDefinition.options)),
		member: parseAsNativeArrayOf(parseAsString),
		book: parseAsNativeArrayOf(parseAsString),
		isbn: parseAsString,
		dateTimeCreated__from: parseAsIsoDate,
		dateTimeCreated__to: parseAsIsoDate,
		dateTimeUpdated__from: parseAsIsoDate,
		dateTimeUpdated__to: parseAsIsoDate,
		sortBy: parseAsStringEnum(ReservationSortByInputDefinition.options),
		sortOrder: parseAsStringEnum(SortOrderDefinition.options),
	});

	const filters = {
		page: state.page,
		pageSize: state.pageSize,
		...(state.ticket && {ticket: {contains: state.ticket}}),
		...(state.status?.length && {status: {in: state.status}}),
		...(state.member?.length && {memberId: {in: state.member}}),
		...(state.book?.length && {bookId: {in: state.book}}),
		...(state.isbn && {isbn: {contains: state.isbn}}),
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
		...(state.sortBy && {sortBy: state.sortBy}),
		...(state.sortOrder && {sortOrder: state.sortOrder}),
	} satisfies ReservationsInput;
	const {page, pageSize, ...exportFilters} = filters;
	const query = useReservationsQuery(filters);
	const exportMutation = useExportReservationsMutation({
		onError: (error) => {
			toaster.error({description: error.message});
		},
	});

	return (
		<>
			<title>Reservations | USAT</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Reservations</h1>
					<p className="text-neutral-600 text-sm dark:text-neutral-300">
						Manage book reservations below.
					</p>
				</div>
				<AddReservation />
			</div>
			<DataTable
				id="reservations"
				collection={createListCollection({
					items: query.data?.rows ?? [],
					itemToString: (reservation) => reservation.ticket,
					itemToValue: (reservation) => reservation.id.toString(),
				})}
				columns={[
					{
						id: 'ticket',
						heading: 'Ticket',
						cell: (reservation) => reservation.ticket,
						filter: {
							type: 'TEXT',
							placeholder: 'Enter ticket',
							value: state.ticket ?? '',
							onChange: (ticket) => setState({ticket: ticket || null}),
						},
					},
					{
						id: 'status',
						heading: 'Status',
						cell: (reservation) => (
							<Badge.Root
								accent={
									reservation.status === 'PENDING'
										? 'warning'
										: reservation.status === 'CANCELLED'
											? 'danger'
											: 'success'
								}
							>
								<Badge.Label>
									{reservation.status === 'PENDING'
										? 'Pending'
										: reservation.status === 'CANCELLED'
											? 'Cancelled'
											: 'Completed'}
								</Badge.Label>
							</Badge.Root>
						),
						filter: {
							type: 'SELECT',
							options: ReservationStatusDefinition.options.map((value) => ({
								value,
								label: value.charAt(0) + value.slice(1).toLowerCase(),
							})),
							multiple: true,
							placeholder: 'Select status',
							value: state.status ?? [],
							onChange: (value) =>
								setState({
									status: value
										.map((v) => ReservationStatusDefinition.safeParse(v).data)
										.filter(Boolean),
								}),
						},
						orderable: true,
						hideable: true,
					},
					{
						id: 'member',
						heading: 'Member',
						cell: (reservation) => (
							<Link
								to={`/members/${reservation.member.id}`}
								className="text-blue-500 dark:text-blue-400"
							>
								{reservation.member.name}
							</Link>
						),
						filter: {
							type: 'ASYNC_COMBOBOX',
							multiple: true,
							placeholder: 'Search member',
							value: state.member ?? [],
							onChange: (member) => setState({member}),
							options: async (search, value) => {
								const input: MembersInput =
									search.trim() === '' && value.length > 0
										? {id: {in: value}, page: 1}
										: {name: {contains: search}, page: 1, pageSize: 25};
								try {
									const data = await client.query({
										queryKey: useMembersQuery.getQueryKey(input),
										queryFn: useMembersQuery.getQueryFn(input),
									});
									return data.rows.map((member) => ({
										value: member.id.toString(),
										label: `${member.name} (${member.externalId})`,
									}));
								} catch {
									return [];
								}
							},
						},
						orderable: true,
						hideable: true,
					},
					{
						id: 'book',
						heading: 'Book',
						cell: (reservation) => (
							<Link
								to={`/books/${reservation.book.id}`}
								className="text-blue-500 dark:text-blue-400"
							>
								{reservation.book.title}
							</Link>
						),
						filter: {
							type: 'ASYNC_COMBOBOX',
							multiple: true,
							placeholder: 'Search book',
							value: state.book ?? [],
							onChange: (book) => setState({book}),
							options: async (search, value) => {
								const input: BooksInput =
									search.trim() === '' && value.length > 0
										? {id: {in: value}, page: 1}
										: {title: {contains: search}, page: 1, pageSize: 25};
								try {
									const data = await client.query({
										queryKey: useBooksQuery.getQueryKey(input),
										queryFn: useBooksQuery.getQueryFn(input),
									});
									return data.rows.map((book) => ({
										value: book.id.toString(),
										label: `${book.title} (${book.author})`,
									}));
								} catch {
									return [];
								}
							},
						},
						orderable: true,
						hideable: true,
					},
					{
						id: 'isbn',
						heading: 'ISBN',
						cell: (reservation) => reservation.bookCopy?.isbn ?? null,
						filter: {
							type: 'TEXT',
							placeholder: 'Enter ISBN',
							value: state.isbn ?? '',
							onChange: (isbn) => setState({isbn: isbn || null}),
						},
						orderable: true,
						hideable: true,
					},
					{
						id: 'dateTimeCreated',
						heading: 'Date created',
						cell: (reservation) => format(reservation.dateTimeCreated, 'MMM dd, yyyy hh:mm a'),
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
						orderable: true,
						hideable: true,
					},
					{
						id: 'dateTimeUpdated',
						heading: 'Date updated',
						cell: (reservation) => format(reservation.dateTimeUpdated, 'MMM dd, yyyy hh:mm a'),
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
						hideable: true,
						orderable: true,
						defaultHidden: true,
					},
					{
						id: 'actions',
						heading: <SettingsIcon className="size-5" />,
						cell: (reservation) => (
							<Menu.Root>
								<Menu.Trigger
									disabled={reservation.status !== 'PENDING'}
									className="disabled:opacity-50"
								>
									<SettingsIcon className="size-5" />
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content>
											<ClaimReservation
												id={reservation.id}
												onClaimed={() => {
													client.invalidateQueries({queryKey: useReservationsQuery.getQueryKey()});
												}}
											/>

											<UnreserveReservation
												id={reservation.id}
												onUnreserved={() => {
													client.invalidateQueries({queryKey: useReservationsQuery.getQueryKey()});
												}}
											/>
										</Menu.Content>
									</Menu.Positioner>
								</Portal>
							</Menu.Root>
						),
						className: 'w-0 text-center',
					},
				]}
				paginationEnabled
				page={page}
				pageSize={pageSize}
				onPageChange={(page) => setState({page})}
				onPageSizeChange={(pageSize) => setState({pageSize})}
				total={query.data?.total ?? 0}
				loading={query.isLoading}
				onReload={() => {
					query.refetch();
				}}
				exporting={exportMutation.isPending}
				onExport={() => {
					exportMutation.mutate(exportFilters);
				}}
				sortColumn={state.sortBy ?? null}
				onSortColumnChange={(value) =>
					setState({sortBy: ReservationSortByInputDefinition.nullable().optional().parse(value)})
				}
				sortOrder={state.sortOrder ?? null}
				onSortOrderChange={(sortOrder) => setState({sortOrder})}
				cta={
					<AddReservation
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
											Add reservation
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
