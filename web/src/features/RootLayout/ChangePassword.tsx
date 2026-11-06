import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {LockKeyholeIcon} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import * as z from 'zod';
import {PasswordField} from '@/components/forms/PasswordField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {Menu} from '@/components/ui/Menu';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useMeQuery} from '@/hooks/useMeQuery';
import {useUpdateMeMutation} from '@/hooks/useUpdateMeMutation';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';

const ChangePasswordInputDefinition = z
	.object({
		oldPassword: z.string().min(1, 'Current password is required'),
		newPassword: z.string().min(1, 'New password is required'),
		confirmPassword: z.string().min(1, 'Confirm password is required'),
	})
	.superRefine((data, ctx) => {
		if (data.newPassword !== data.confirmPassword) {
			ctx.addIssue({
				code: 'custom',
				path: ['confirmPassword'],
				message: 'Passwords do not match',
			});
		}
	});

export function ChangePassword() {
	const form = useForm({
		resolver: zodResolver(ChangePasswordInputDefinition),
		defaultValues: {
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	const disclosure = useDisclosure();
	const mutation = useUpdateMeMutation({
		onSuccess: (data) => {
			client.setQueryData(useMeQuery.getQueryKey(), data);
			disclosure.setOpen(false);
			toaster.success({
				description: 'Password has been changed.',
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
				form.reset();
			}}
		>
			<Dialog.Context>
				{(api) => (
					<Menu.Item value="change-password" onSelect={() => api.setOpen(true)}>
						<LockKeyholeIcon />
						Change password
					</Menu.Item>
				)}
			</Dialog.Context>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form
							onSubmit={form.handleSubmit((data) => {
								mutation.mutate({
									oldPassword: data.oldPassword,
									newPassword: data.newPassword,
								});
							})}
							noValidate
						>
							<Dialog.Header>
								<FeaturedIcon.Root>
									<FeaturedIcon.Icon>
										<LockKeyholeIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Change password</Dialog.Title>
									<Dialog.Description>Update your password information.</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body>
								<Controller
									control={form.control}
									name="oldPassword"
									render={({field, fieldState}) => (
										<Field.Root invalid={fieldState.invalid}>
											<Field.Label>Current Password</Field.Label>
											<PasswordField
												placeholder="Enter current password"
												value={field.value}
												onChange={field.onChange}
												disabled={mutation.isPending}
											/>
											<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
										</Field.Root>
									)}
								/>
								<Controller
									control={form.control}
									name="newPassword"
									render={({field, fieldState}) => (
										<Field.Root invalid={fieldState.invalid}>
											<Field.Label>New Password</Field.Label>
											<PasswordField
												placeholder="Enter new password"
												value={field.value}
												onChange={field.onChange}
												disabled={mutation.isPending}
											/>
											<Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
										</Field.Root>
									)}
								/>
								<Controller
									control={form.control}
									name="confirmPassword"
									render={({field, fieldState}) => (
										<Field.Root invalid={fieldState.invalid}>
											<Field.Label>Confirm New Password</Field.Label>
											<PasswordField
												placeholder="Confirm new password"
												value={field.value}
												onChange={field.onChange}
												disabled={mutation.isPending}
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
									{mutation.isPending ? <SpinnerIcon className="size-5" /> : 'Save'}
								</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
