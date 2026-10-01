import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {type Paginated, type Student, UpdateStudentDataInputDefinition} from '@library/types';
import {isNil, omitBy} from 'es-toolkit';
import {isEmpty} from 'es-toolkit/compat';
import {TrashIcon} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import {useNavigate} from 'react-router';
import {SelectField} from '@/components/forms/SelectField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {useDeleteStudentMutation} from '@/hooks/useDeleteStudentMutation';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useStudentQuery} from '@/hooks/useStudentQuery';
import {useStudentsQuery} from '@/hooks/useStudentsQuery';
import {useUpdateStudentMutation} from '@/hooks/useUpdateStudentMutation';
import {client} from '@/utils/client';
import {getStudentCourseOptions, getStudentYearAndSectionOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useStudentContext} from './StudentContext';

export function Settings() {
	const student = useStudentContext();
	const form = useForm({
		resolver: zodResolver(UpdateStudentDataInputDefinition),
		defaultValues: student,
	});

	const mutation = useUpdateStudentMutation({
		onSuccess: (next) => {
			form.reset(next);

			client.setQueryData<Student>(useStudentQuery.getQueryKey(next.id), next);
			client.setQueriesData<Paginated<Student>>(
				{
					queryKey: useStudentsQuery.getQueryKey(),
					exact: false,
					type: 'all',
				},
				(data) => {
					if (!data) return data;

					return {
						...data,
						rows: data.rows.map((prev) => (prev.id === next.id ? next : prev)),
					};
				},
			);

			toaster.success({
				description: 'Changes have been saved.',
			});
		},
		onError: (error) => {
			toaster.error({
				description: error.message,
			});
		},
	});

	return (
		<div>
			<form
				onSubmit={form.handleSubmit((data) => {
					data = omitBy(
						data,
						(value, key) => isNil(value) || value === '' || student[key] === value,
					);
					if (isEmpty(data)) return form.reset(student);
					mutation.mutate({id: student.id, data});
				})}
				noValidate
			>
				<div className="space-y-3">
					<Field.Root invalid={!!form.formState.errors.externalId}>
						<Field.Label>ID</Field.Label>
						<Field.Input placeholder="Enter ID" {...form.register('externalId')} />
						<Field.ErrorText>{form.formState.errors.externalId?.message}</Field.ErrorText>
					</Field.Root>
					<Field.Root invalid={!!form.formState.errors.name}>
						<Field.Label>Name</Field.Label>
						<Field.Input placeholder="Enter name" {...form.register('name')} />
						<Field.ErrorText>{form.formState.errors.name?.message}</Field.ErrorText>
					</Field.Root>
					<Controller
						control={form.control}
						name="course"
						render={({field, fieldState}) => (
							<Field.Root invalid={!!fieldState.error}>
								<Field.Label>Course</Field.Label>
								<SelectField
									options={getStudentCourseOptions()}
									placeholder="Select course"
									value={field.value ?? ''}
									onChange={(value) => field.onChange(value || null)}
								/>
								<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
							</Field.Root>
						)}
					/>
					<Controller
						control={form.control}
						name="yearAndSection"
						render={({field, fieldState}) => (
							<Field.Root invalid={!!fieldState.error}>
								<Field.Label>Year and section</Field.Label>
								<SelectField
									options={getStudentYearAndSectionOptions()}
									placeholder="Select year and section"
									value={field.value ?? ''}
									onChange={(value) => field.onChange(value || null)}
								/>
								<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
							</Field.Root>
						)}
					/>
				</div>

				<div className="mt-12 flex justify-end gap-3">
					{form.formState.isDirty ? (
						<>
							<Button
								className="w-32"
								variant="outline"
								accent="gray"
								onClick={() => {
									form.reset(student);
								}}
								disabled={mutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" className="w-32" disabled={mutation.isPending}>
								{mutation.isPending ? <SpinnerIcon className="animate-spin" /> : 'Save'}
							</Button>
						</>
					) : (
						<DeleteStudent />
					)}
				</div>
			</form>
		</div>
	);
}

export function DeleteStudent() {
	const student = useStudentContext();
	const disclosure = useDisclosure();
	const navigate = useNavigate();
	const mutation = useDeleteStudentMutation({
		onSuccess: async () => {
			await navigate('/students');
			await client.invalidateQueries({
				refetchType: 'active',
				queryKey: useStudentsQuery.getQueryKey(),
				exact: false,
				type: 'all',
			});

			disclosure.setOpen(false);
			toaster.success({
				description: 'Student has been deleted.',
			});
		},
		onError: (error) => {
			toaster.error({
				description: error.message,
			});
		},
	});

	return (
		<Dialog.Root
			open={disclosure.open}
			onOpenChange={(details) => disclosure.setOpen(details.open)}
		>
			<Dialog.Trigger asChild>
				<Button className="w-32" accent="danger">
					Delete
				</Button>
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<FeaturedIcon.Root accent="danger">
								<FeaturedIcon.Icon>
									<TrashIcon />
								</FeaturedIcon.Icon>
							</FeaturedIcon.Root>
							<div>
								<Dialog.Title>Delete student</Dialog.Title>
								<Dialog.Description>
									Are you sure you want to delete this student? This action cannot be undone.
								</Dialog.Description>
							</div>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Footer>
							<Dialog.Context>
								{(api) => (
									<Button
										variant="outline"
										accent="gray"
										onClick={() => api.setOpen(false)}
										disabled={mutation.isPending}
									>
										Cancel
									</Button>
								)}
							</Dialog.Context>
							<Button
								accent="danger"
								disabled={mutation.isPending}
								onClick={() => mutation.mutate(student.id)}
							>
								{mutation.isPending ? <SpinnerIcon className="size-5" /> : 'Confirm'}
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
