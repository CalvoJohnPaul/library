import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {UpdateMemberDataInputDefinition} from '@library/types';
import {isNil, omitBy} from 'es-toolkit';
import {isEmpty} from 'es-toolkit/compat';
import {PenSquareIcon} from 'lucide-react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {SelectField} from '@/components/forms/SelectField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {Menu} from '@/components/ui/Menu';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useMembersQuery} from '@/hooks/useMembersQuery';
import {useUpdateMemberMutation} from '@/hooks/useUpdateMemberMutation';
import {client} from '@/utils/client';
import {getMemberCourseOptions, getMemberYearAndSectionOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useMemberContext} from './MemberContext';

export function EditMember() {
	const member = useMemberContext();
	const form = useForm({
		resolver: zodResolver(UpdateMemberDataInputDefinition),
		defaultValues: {
			externalId: member.externalId,
			name: member.name,
			course: member.course,
			yearAndSection: member.yearAndSection,
		},
	});

	const course = useWatch({
		control: form.control,
		name: 'course',
		defaultValue: null,
	});

	const disclosure = useDisclosure();
	const mutation = useUpdateMemberMutation({
		onSuccess: () => {
			disclosure.setOpen(false);
			toaster.success({description: 'Changes have been saved.'});
			client.invalidateQueries({queryKey: useMembersQuery.getQueryKey()});
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
				form.reset(member);
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
									(value, key) => isNil(value) || value === '' || member[key] === value,
								);

								if (isEmpty(data)) {
									disclosure.setOpen(false);
									return;
								}

								mutation.mutate({
									id: member.id,
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
									<Dialog.Title>Edit member</Dialog.Title>
									<Dialog.Description>
										Fill out the form to edit the member in your&nbsp;collection.
									</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body>
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
												options={getMemberCourseOptions()}
												value={field.value ?? ''}
												onChange={(value) => {
													field.onChange(value || null);

													if (!value) {
														form.setValue('yearAndSection', null, {shouldValidate: true});
													}
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
												options={getMemberYearAndSectionOptions()}
												value={field.value ?? ''}
												disabled={!course}
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
