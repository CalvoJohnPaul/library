import {createListCollection, Portal} from '@ark-ui/react';
import {MemberSortByInputDefinition, SortOrderDefinition} from '@library/types';
import {format} from 'date-fns';
import {uniq} from 'es-toolkit/compat';
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
import {IconButton} from '@/components/ui/IconButton';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {useExportMembersMutation} from '@/hooks/useExportMembersMutation';
import {type MembersInput, useMembersQuery} from '@/hooks/useMembersQuery';
import {client} from '@/utils/client';
import {getMemberCourseOptions, getMemberYearAndSectionOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {AddMember} from './AddMember';
import {DeleteMember} from './DeleteMember';
import {EditMember} from './EditMember';
import {MemberProvider} from './MemberContext';

export function Members() {
	const [state, setState] = useQueryStates({
		page: parseAsInteger.withDefault(1),
		pageSize: parseAsInteger.withDefault(10),
		externalId: parseAsNativeArrayOf(parseAsString),
		name: parseAsNativeArrayOf(parseAsString),
		course: parseAsNativeArrayOf(parseAsString),
		yearAndSection: parseAsNativeArrayOf(parseAsString),
		dateTimeLastBorrowedBook__from: parseAsIsoDate,
		dateTimeLastBorrowedBook__to: parseAsIsoDate,
		dateTimeCreated__from: parseAsIsoDate,
		dateTimeCreated__to: parseAsIsoDate,
		dateTimeUpdated__from: parseAsIsoDate,
		dateTimeUpdated__to: parseAsIsoDate,
		sortBy: parseAsStringEnum(MemberSortByInputDefinition.options),
		sortOrder: parseAsStringEnum(SortOrderDefinition.options),
	});

	const id = uniq([...(state.name ?? []), ...(state.externalId ?? [])]);

	const filters = {
		page: state.page,
		pageSize: state.pageSize,
		...(id.length && {
			id: {
				in: id,
			},
		}),
		...(state.course && {
			course: {
				in: state.course,
			},
		}),
		...(state.yearAndSection && {
			yearAndSection: {
				in: state.yearAndSection,
			},
		}),
		...((state.dateTimeLastBorrowedBook__from != null ||
			state.dateTimeLastBorrowedBook__to != null) && {
			dateTimeLastBorrowedBook: {
				gte: state.dateTimeLastBorrowedBook__from ?? null,
				lte: state.dateTimeLastBorrowedBook__to ?? null,
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
	} satisfies MembersInput;

	const query = useMembersQuery(filters);

	const exportMutation = useExportMembersMutation({
		onError: (error) => {
			toaster.error({
				description: error.message,
			});
		},
	});

	return (
		<>
			<title>Members | USAT</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Members</h1>
					<p className="text-gray-600 text-sm dark:text-neutral-300">
						Manage member information below.
					</p>
				</div>

				<AddMember />
			</div>
			<DataTable
				id="members"
				collection={createListCollection({
					items: query.data?.rows ?? [],
					itemToString: (member) => member.name,
					itemToValue: (member) => member.id.toString(),
				})}
				columns={[
					{
						id: 'id',
						heading: 'ID',
						cell: (member) => (
							<Link to={`/members/${member.id}`} className="text-blue-500 dark:text-blue-400">
								{member.externalId}
							</Link>
						),
						filter: {
							type: 'ASYNC_COMBOBOX',
							multiple: true,
							placeholder: 'Enter ID',
							value: state.externalId ?? [],
							onChange: (externalId) => setState({externalId}),
							options: async (search, value) => {
								let input: MembersInput;

								if (search.trim() === '' && value.length > 0) {
									input = {
										id: {in: value},
										page: 1,
									};
								} else {
									input = {
										externalId: {contains: search},
										page: 1,
										pageSize: 25,
									};
								}

								try {
									const data = await client.query({
										queryKey: useMembersQuery.getQueryKey(input),
										queryFn: useMembersQuery.getQueryFn(input),
									});

									return (
										data.rows.map((member) => ({
											label: `${member.name} (${member.externalId})`,
											value: member.id.toString(),
										})) ?? []
									);
								} catch {
									return [];
								}
							},
						},
					},
					{
						id: 'name',
						heading: 'Name',
						cell: (member) => member.name,
						filter: {
							type: 'ASYNC_COMBOBOX',
							multiple: true,
							options: async (search, value) => {
								let input: MembersInput;

								if (search.trim() === '' && value.length > 0) {
									input = {
										id: {in: value},
										page: 1,
									};
								} else {
									input = {
										name: {contains: search},
										page: 1,
										pageSize: 25,
									};
								}

								try {
									const data = await client.query({
										queryKey: useMembersQuery.getQueryKey(input),
										queryFn: useMembersQuery.getQueryFn(input),
									});

									return (
										data.rows.map((member) => ({
											label: `${member.name} (${member.externalId})`,
											value: member.id.toString(),
										})) ?? []
									);
								} catch {
									return [];
								}
							},
							value: state.name ?? [],
							onChange: (name) => setState({name}),
							placeholder: 'Search name',
						},
					},
					{
						id: 'course',
						heading: 'Course',
						cell: (member) => member.course,
						filter: {
							type: 'SELECT',
							options: getMemberCourseOptions(),
							multiple: true,
							placeholder: 'Select course',
							value: state.course ?? [],
							onChange: (course) => setState({course}),
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'yearAndSection',
						heading: 'Year and section',
						cell: (member) => member.yearAndSection,
						filter: {
							type: 'SELECT',
							options: getMemberYearAndSectionOptions(),
							multiple: true,
							placeholder: 'Select year and section',
							value: state.yearAndSection ?? [],
							onChange: (yearAndSection) => setState({yearAndSection}),
						},
						hideable: true,
						orderable: true,
					},
					{
						id: 'dateTimeLastBorrowedBook',
						heading: 'Date last borrowed book',
						cell: (member) =>
							member.dateTimeLastBorrowedBook
								? format(member.dateTimeLastBorrowedBook, 'MMM dd, yyyy hh:mm a')
								: null,
						filter: {
							type: 'DATE_RANGE',
							placeholder: 'Select date',
							value: {
								from: state.dateTimeLastBorrowedBook__from ?? null,
								to: state.dateTimeLastBorrowedBook__to ?? null,
							},
							onChange: (dateTimeLastBorrowedBook) => {
								setState({
									dateTimeLastBorrowedBook__from: dateTimeLastBorrowedBook?.from ?? null,
									dateTimeLastBorrowedBook__to: dateTimeLastBorrowedBook?.to ?? null,
								});
							},
						},
						sortable: true,
						hideable: true,
						orderable: true,
					},
					{
						id: 'dateTimeCreated',
						heading: 'Date added',
						cell: (member) => format(member.dateTimeCreated, 'MMM dd, yyyy hh:mm a'),
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
						hideable: true,
						orderable: true,
					},
					{
						id: 'dateTimeUpdated',
						heading: 'Date updated',
						cell: (member) => format(member.dateTimeUpdated, 'MMM dd, yyyy hh:mm a'),
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
					},
					{
						id: 'actions',
						heading: <SettingsIcon className="size-5" />,
						cell: (member) => (
							<Menu.Root>
								<Menu.Trigger>
									<SettingsIcon className="size-5" />
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content>
											<MemberProvider value={member}>
												<EditMember />
												<DeleteMember />
											</MemberProvider>
										</Menu.Content>
									</Menu.Positioner>
								</Portal>
							</Menu.Root>
						),
						className: 'w-0 text-center',
					},
				]}
				paginationEnabled
				page={state.page}
				pageSize={state.pageSize}
				onPageChange={(page) => setState({page})}
				onPageSizeChange={(pageSize) => setState({pageSize})}
				total={query.data?.total ?? 0}
				loading={query.isLoading}
				onReload={() => {
					query.refetch();
				}}
				sortColumn={state.sortBy ?? null}
				onSortColumnChange={(value) =>
					setState({sortBy: MemberSortByInputDefinition.nullable().optional().parse(value)})
				}
				sortOrder={state.sortOrder ?? null}
				onSortOrderChange={(sortOrder) => setState({sortOrder})}
				exporting={exportMutation.isPending}
				onExport={() => {
					exportMutation.mutate(filters);
				}}
				cta={
					<AddMember
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
											Add member
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
