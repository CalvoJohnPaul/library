import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {type Member, UpdateMemberDataInputDefinition} from '@library/types';
import {isNil, omitBy} from 'es-toolkit';
import {isEmpty} from 'es-toolkit/compat';
import {TrashIcon} from 'lucide-react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {useNavigate} from 'react-router';
import {SelectField} from '@/components/forms/SelectField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {useDeleteMemberMutation} from '@/hooks/useDeleteMemberMutation';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useMemberQuery} from '@/hooks/useMemberQuery';
import {useUpdateMemberMutation} from '@/hooks/useUpdateMemberMutation';
import {client} from '@/utils/client';
import {getMemberCourseOptions, getMemberYearAndSectionOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useMemberContext} from './MemberContext';

export function Settings() {
	const member = useMemberContext();
	const form = useForm({
		resolver: zodResolver(UpdateMemberDataInputDefinition),
		defaultValues: member,
	});

	const course = useWatch({
		control: form.control,
		name: 'course',
		defaultValue: null,
	});

	const mutation = useUpdateMemberMutation({
		onSuccess: (data) => {
			form.reset(data);
			toaster.success({description: 'Changes have been saved.'});
			client.setQueryData<Member>(useMemberQuery.getQueryKey(member.id), data);
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
						(value, key) => isNil(value) || value === '' || member[key] === value,
					);
					if (isEmpty(data)) return form.reset(member);
					mutation.mutate({id: member.id, data});
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
									options={getMemberCourseOptions()}
									placeholder="Select course"
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
							<Field.Root invalid={!!fieldState.error}>
								<Field.Label>Year and section</Field.Label>
								<SelectField
									options={getMemberYearAndSectionOptions()}
									placeholder="Select year and section"
									value={field.value ?? ''}
									disabled={!course}
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
									form.reset(member);
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
						<DeleteMember />
					)}
				</div>
			</form>
		</div>
	);
}

export function DeleteMember() {
	const member = useMemberContext();
	const disclosure = useDisclosure();
	const navigate = useNavigate();
	const mutation = useDeleteMemberMutation({
		onSuccess: async () => {
			disclosure.setOpen(false);
			toaster.success({description: 'Member has been deleted.'});
			navigate('/members');
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
								<Dialog.Title>Delete member</Dialog.Title>
								<Dialog.Description>
									Are you sure you want to delete this member? This action cannot be undone.
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
								onClick={() => mutation.mutate(member.id)}
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
