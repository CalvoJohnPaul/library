import {createListCollection, Portal} from '@ark-ui/react';
import {format} from 'date-fns';
import {PenSquareIcon, PlusIcon, SettingsIcon, TrashIcon} from 'lucide-react';
import {Link} from 'react-router';
import {DataTable} from '@/components/DataTable';
import {Button} from '@/components/ui/Button';
import {Menu} from '@/components/ui/Menu';
import {useStudentsQuery} from '@/hooks/useStudentsQuery';
import {StudentProvider} from './StudentContext';

export function Students() {
	const query = useStudentsQuery();

	return (
		<>
			<title>Students | read.</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Students</h1>
					<p className="text-gray-600 text-sm">Manage student information below.</p>
				</div>

				<Button>
					<PlusIcon />
					Add student
				</Button>
			</div>
			<DataTable
				id="students"
				collection={createListCollection({
					items: query.data?.rows ?? [],
					itemToString: (student) => `${student.firstName} ${student.lastName}`,
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
					},
					{
						id: 'name',
						heading: 'Name',
						cell: (student) => `${student.firstName} ${student.lastName}`,
					},
					{
						id: 'course',
						heading: 'Course',
						cell: (student) => student.course,
						filter: {
							type: 'SELECT',
							options: [],
							multiple: true,
							placeholder: 'Select course',
						},
					},
					{
						id: 'yearAndSection',
						heading: 'Year & Section',
						cell: (student) => student.yearAndSection,
						filter: {
							type: 'SELECT',
							options: [],
							multiple: true,
							placeholder: 'Select year & section',
						},
					},
					{
						id: 'dateTimeCreated',
						heading: 'Date added',
						cell: (student) => format(student.dateTimeCreated, 'MMM dd, yyyy hh:mm a'),
						filter: {
							type: 'DATE_RANGE',
							placeholder: 'Select date',
						},
						sortable: true,
					},
					{
						id: 'dateTimeUpdated',
						heading: 'Date updated',
						cell: (student) => format(student.dateTimeUpdated, 'MMM dd, yyyy hh:mm a'),
						filter: {
							type: 'DATE_RANGE',
							placeholder: 'Select date',
						},
						sortable: true,
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
												<Menu.Item value="edit">
													<PenSquareIcon />
													Edit
												</Menu.Item>
												<Menu.Item value="delete">
													<TrashIcon />
													Delete
												</Menu.Item>
											</StudentProvider>
										</Menu.Content>
									</Menu.Positioner>
								</Portal>
							</Menu.Root>
						),
						className: 'w-0 text-center',
					},
				]}
				searchEnabled
				paginationEnabled
				onReload={() => {}}
				onExport={() => {}}
			/>
		</>
	);
}
