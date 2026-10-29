import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {CreateMemberInputDefinition} from '@library/types';
import {isFunction} from 'es-toolkit';
import {PlusIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {SelectField} from '@/components/forms/SelectField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {useCreateMemberMutation} from '@/hooks/useCreateMemberMutation';
import {type UseDisclosureReturn, useDisclosure} from '@/hooks/useDisclosure';
import {useMembersQuery} from '@/hooks/useMembersQuery';
import {client} from '@/utils/client';
import {getMemberCourseOptions, getMemberYearAndSectionOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';

export function AddMember({
	trigger,
}: {
	trigger?: ReactNode | ((disclosure: UseDisclosureReturn) => ReactNode);
}) {
	const disclosure = useDisclosure();
	const form = useForm({
		resolver: zodResolver(CreateMemberInputDefinition),
		defaultValues: {
			externalId: '',
			name: '',
			course: null,
			yearAndSection: null,
		},
	});

	const course = useWatch({
		control: form.control,
		name: 'course',
		defaultValue: null,
	});

	const mutation = useCreateMemberMutation({
		onSuccess: () => {
			disclosure.setOpen(false);
			toaster.success({description: 'Member has been added.'});
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
				form.reset({});
			}}
		>
			<Dialog.Trigger asChild>
				{isFunction(trigger)
					? trigger(disclosure)
					: (trigger ?? (
							<Button>
								<PlusIcon />
								Add member
							</Button>
						))}
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form
							onSubmit={form.handleSubmit((data) => {
								const copy = {...data};
								if (!copy.course) delete copy.course;
								if (!copy.yearAndSection) delete copy.yearAndSection;
								mutation.mutate(copy);
							})}
							noValidate
						>
							<Dialog.Header>
								<FeaturedIcon.Root>
									<FeaturedIcon.Icon>
										<PlusIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Add member</Dialog.Title>
									<Dialog.Description>
										Fill out the form to add a new member to your&nbsp;collection.
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
