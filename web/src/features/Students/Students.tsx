import {createListCollection, Portal} from '@ark-ui/react';
import {
	type SortOrder,
	type StudentSortByInput,
	StudentSortByInputDefinition,
} from '@library/types';
import {format} from 'date-fns';
import {uniq} from 'es-toolkit/compat';
import {PlusIcon, SettingsIcon} from 'lucide-react';
import {useReducer} from 'react';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {IconButton} from '@/components/ui/IconButton';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {type StudentsInput, useStudentsQuery} from '@/hooks/useStudentsQuery';
import type {DateRange} from '@/types/index';
import {client} from '@/utils/client';
import {getStudentCourseOptions, getStudentYearAndSectionOptions} from '@/utils/common';
import {AddStudent} from './AddStudent';
import {DeleteStudent} from './DeleteStudent';
import {EditStudent} from './EditStudent';
import {StudentProvider} from './StudentContext';

interface State {
	page: number;
	pageSize: number;
	externalId?: string[] | null;
	name?: string[] | null;
	course?: string[] | null;
	yearAndSection?: string[] | null;
	dateTimeLastBorrowedBook?: DateRange | null;
	dateTimeCreated?: DateRange | null;
	dateTimeUpdated?: DateRange | null;
	sortBy?: StudentSortByInput | null;
	sortOrder?: SortOrder | null;
}

export function Students() {
	const [state, setState] = useReducer(
		(prev: State, next: Partial<State>) => ({...prev, ...next}),
		{
			page: 1,
			pageSize: 10,
		},
	);

	const id = uniq([...(state.name ?? []), ...(state.externalId ?? [])]);

	const query = useStudentsQuery({
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
		...((state.dateTimeLastBorrowedBook?.from || state.dateTimeLastBorrowedBook?.to) && {
			dateTimeLastBorrowedBook: {
				gte: state.dateTimeLastBorrowedBook?.from,
				lte: state.dateTimeLastBorrowedBook?.to,
			},
		}),
		...((state.dateTimeCreated?.from || state.dateTimeCreated?.to) && {
			dateTimeCreated: {
				gte: state.dateTimeCreated?.from,
				lte: state.dateTimeCreated?.to,
			},
		}),
		...((state.dateTimeUpdated?.from || state.dateTimeUpdated?.to) && {
			dateTimeUpdated: {
				gte: state.dateTimeUpdated?.from,
				lte: state.dateTimeUpdated?.to,
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
			<title>Students | read.</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Students</h1>
					<p className="text-gray-600 text-sm">Manage student information below.</p>
				</div>

				<AddStudent />
			</div>
			<DataTable
				id="students"
				collection={createListCollection({
					items: query.data?.rows ?? [],
					itemToString: (student) => student.name,
					itemToValue: (student) => student.id.toString(),
				})}
				columns={[
					{
						id: 'id',
						heading: 'ID',
						cell: (student) => (
							<Link to={`/students/${student.id}`} className="text-blue-500">
								{student.externalId}
							</Link>
						),
						filter: {
							type: 'ASYNC_COMBOBOX',
							multiple: true,
							placeholder: 'Enter ID',
							value: state.externalId ?? [],
							onChange: (externalId) => setState({externalId}),
							options: async (search) => {
								try {
									const input: StudentsInput = {externalId: {contains: search}};
									const data = await client.query({
										queryKey: useStudentsQuery.getQueryKey(input),
										queryFn: useStudentsQuery.getQueryFn(input),
									});

									return (
										data.rows.map((student) => ({
											label: student.name,
											value: student.id.toString(),
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
						cell: (student) => student.name,
						filter: {
							type: 'ASYNC_COMBOBOX',
							multiple: true,
							options: async (search) => {
								try {
									const input: StudentsInput = {name: {contains: search}};
									const data = await client.query({
										queryKey: useStudentsQuery.getQueryKey(input),
										queryFn: useStudentsQuery.getQueryFn(input),
									});

									return (
										data.rows.map((student) => ({
											label: student.name,
											value: student.id.toString(),
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
						cell: (student) => student.course,
						filter: {
							type: 'SELECT',
							options: getStudentCourseOptions(),
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
						cell: (student) => student.yearAndSection,
						filter: {
							type: 'SELECT',
							options: getStudentYearAndSectionOptions(),
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
						cell: (student) =>
							student.dateTimeLastBorrowedBook
								? format(student.dateTimeLastBorrowedBook, 'MMM dd, yyyy hh:mm a')
								: null,
						filter: {
							type: 'DATE_RANGE',
							placeholder: 'Select date',
							value: state.dateTimeLastBorrowedBook ?? null,
							onChange: (dateTimeLastBorrowedBook) => setState({dateTimeLastBorrowedBook}),
						},
						sortable: true,
						hideable: true,
						orderable: true,
					},
					{
						id: 'dateTimeCreated',
						heading: 'Date added',
						cell: (student) => format(student.dateTimeCreated, 'MMM dd, yyyy hh:mm a'),
						filter: {
							type: 'DATE_RANGE',
							placeholder: 'Select date',
							value: state.dateTimeCreated ?? null,
							onChange: (dateTimeCreated) => setState({dateTimeCreated}),
						},
						sortable: true,
						hideable: true,
						orderable: true,
					},
					{
						id: 'dateTimeUpdated',
						heading: 'Date updated',
						cell: (student) => format(student.dateTimeUpdated, 'MMM dd, yyyy hh:mm a'),
						filter: {
							type: 'DATE_RANGE',
							placeholder: 'Select date',
							value: state.dateTimeUpdated ?? null,
							onChange: (dateTimeUpdated) => setState({dateTimeUpdated}),
						},
						sortable: true,
						hideable: true,
						orderable: true,
					},
					{
						id: 'actions',
						heading: <SettingsIcon className="size-5" />,
						cell: (student) => (
							<Menu.Root>
								<Menu.Trigger>
									<SettingsIcon className="size-5" />
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content>
											<StudentProvider value={student}>
												<EditStudent />
												<DeleteStudent />
											</StudentProvider>
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
					setState({sortBy: StudentSortByInputDefinition.nullable().optional().parse(value)})
				}
				sortOrder={state.sortOrder ?? null}
				onSortOrderChange={(sortOrder) => setState({sortOrder})}
				onExport={() => {}}
				cta={
					<AddStudent
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
											Add student
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
