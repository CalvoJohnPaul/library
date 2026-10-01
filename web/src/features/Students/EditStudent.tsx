import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {type Paginated, type Student, UpdateStudentDataInputDefinition} from '@library/types';
import {isNil, omitBy} from 'es-toolkit';
import {isEmpty} from 'es-toolkit/compat';
import {PenSquareIcon} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import {SelectField} from '@/components/forms/SelectField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {Menu} from '@/components/ui/Menu';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useStudentsQuery} from '@/hooks/useStudentsQuery';
import {useUpdateStudentMutation} from '@/hooks/useUpdateStudentMutation';
import {client} from '@/utils/client';
import {getStudentCourseOptions, getStudentYearAndSectionOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useStudentContext} from './StudentContext';

export function EditStudent() {
	const student = useStudentContext();
	const form = useForm({
		resolver: zodResolver(UpdateStudentDataInputDefinition),
		defaultValues: student,
	});

	const disclosure = useDisclosure();
	const mutation = useUpdateStudentMutation({
		onSuccess: async (next) => {
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

			disclosure.setOpen(false);
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
		<Dialog.Root
			open={disclosure.open}
			onOpenChange={(details) => disclosure.setOpen(details.open)}
			onExitComplete={() => {
				form.reset(student);
			}}
		>
			<Dialog.Context>
				{(api) => (
					<Menu.Item value="edit" onSelect={() => api.setOpen(true)}>
						<PenSquareIcon />
						Edit
					</Menu.Item>
				)}
			</Dialog.Context>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form
							onSubmit={form.handleSubmit((data) => {
								data = omitBy(
									data,
									(value, key) => isNil(value) || value === '' || student[key] === value,
								);

								if (isEmpty(data)) {
									disclosure.setOpen(false);
									return;
								}

								mutation.mutate({
									id: student.id,
									data,
								});
							})}
							noValidate
						>
							<Dialog.Header>
								<FeaturedIcon.Root>
									<FeaturedIcon.Icon>
										<PenSquareIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Edit student</Dialog.Title>
									<Dialog.Description>
										Fill out the form to edit the student in your&nbsp;collection.
									</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body className="space-y-3">
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
										<Field.Root invalid={fieldState.invalid}>
											<Field.Label>Course</Field.Label>
											<SelectField
												placeholder="Select course"
												options={getStudentCourseOptions()}
												value={field.value ?? ''}
												onChange={(value) => {
													field.onChange(value || null);
												}}
											/>
											<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
										</Field.Root>
									)}
								/>
								<Controller
									control={form.control}
									name="yearAndSection"
									render={({field, fieldState}) => (
										<Field.Root invalid={fieldState.invalid}>
											<Field.Label>Year and Section</Field.Label>
											<SelectField
												placeholder="Select year and section"
												options={getStudentYearAndSectionOptions()}
												value={field.value ?? ''}
												onChange={(value) => {
													field.onChange(value || null);
												}}
											/>
											<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
										</Field.Root>
									)}
								/>
							</Dialog.Body>
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
								<Button type="submit" disabled={mutation.isPending}>
									{mutation.isPending ? <SpinnerIcon className="size-5" /> : 'Submit'}
								</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
