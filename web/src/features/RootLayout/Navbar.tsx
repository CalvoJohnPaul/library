import {Portal} from '@ark-ui/react';
import {funEmoji} from '@dicebear/collection';
import {createAvatar} from '@dicebear/core';
import {zodResolver} from '@hookform/resolvers/zod';
import {isNil, omitBy} from 'es-toolkit';
import {isEmpty} from 'es-toolkit/compat';
import {LockKeyholeIcon, LogOutIcon, MenuIcon, SquarePenIcon} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import {Link} from 'react-router';
import * as z from 'zod';
import {useShallow} from 'zustand/shallow';
import {PasswordField} from '@/components/forms/PasswordField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Avatar} from '@/components/ui/Avatar';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {Menu} from '@/components/ui/Menu';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useGlobalStore} from '@/hooks/useGlobalStore';
import {useMeQuery} from '@/hooks/useMeQuery';
import {useUpdateMeMutation} from '@/hooks/useUpdateMeMutation';
import {Logout} from '@/templates/Logout';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';

export function Navbar() {
	const query = useMeQuery();
	const avatar = query.data
		? createAvatar(funEmoji, {seed: query.data.id.toString()}).toDataUri()
		: '';

	const [sidebarCollapsed, setSidebarCollapsed] = useGlobalStore(
		useShallow((o) => [o.sidebarCollapsed, o.setSidebarCollapsed]),
	);

	return (
		<header className="sticky top-0 z-sticky flex h-16 items-center border-gray-200 border-b bg-white pr-12 pl-7">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => {
						setSidebarCollapsed((prev) => !prev);
					}}
					className="text-gray-700"
					data-state={sidebarCollapsed ? 'closed' : 'open'}
				>
					<MenuIcon className="size-5" />
				</button>
				<Link to="/" className="block">
					<h2 className="logo-shine block font-bold font-heading text-xl tracking-wider">USAT</h2>
				</Link>
			</div>
			<div className="grow"></div>
			<div className="flex gap-1">
				<Menu.Root ids={{trigger: 'settings-trigger'}}>
					<Menu.Trigger disabled={query.isLoading}>
						<Avatar.Root size="sm">
							<Avatar.Image src={avatar} />
							<Avatar.Fallback />
						</Avatar.Root>
					</Menu.Trigger>

					<Menu.Positioner>
						<Menu.Content>
							<div className="flex items-center gap-2 py-2 pr-4 pl-2">
								<Avatar.Root>
									<Avatar.Image src={avatar} />
									<Avatar.Fallback />
								</Avatar.Root>
								<div>
									<p className="font-semibold leading-tight">{query.data?.name}</p>
									<p className="text-gray-600 text-sm leading-tight">{query.data?.email}</p>
								</div>
							</div>
							<Menu.Separator />
							<EditAccount />
							<ChangePassword />
							<Menu.Separator />
							<Logout
								trigger={({setOpen}) => (
									<Menu.Item
										value="logout"
										onSelect={() => {
											setOpen(true);
										}}
									>
										<LogOutIcon />
										Log out
									</Menu.Item>
								)}
							/>
						</Menu.Content>
					</Menu.Positioner>
				</Menu.Root>
			</div>
		</header>
	);
}

const EditAccountInputDefinition = z.object({
	name: z.string(),
	email: z.string(),
});

function EditAccount() {
	const query = useMeQuery();
	const form = useForm({
		resolver: zodResolver(EditAccountInputDefinition),
		defaultValues: {
			name: query.data?.name ?? '',
			email: query.data?.email ?? '',
		},
	});

	const disclosure = useDisclosure();
	const mutation = useUpdateMeMutation({
		onSuccess: (data) => {
			client.setQueryData(useMeQuery.getQueryKey(), data);
			disclosure.setOpen(false);
			form.reset(data);
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
		>
			<Dialog.Context>
				{(api) => (
					<Menu.Item
						value="edit-account"
						onSelect={() => {
							api.setOpen(true);
						}}
					>
						<SquarePenIcon />
						Edit account
					</Menu.Item>
				)}
			</Dialog.Context>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form
							onSubmit={form.handleSubmit((values) => {
								const data = omitBy(
									values,
									(value, key) => isNil(value) || value === '' || query.data?.[key] === value,
								);

								if (isEmpty(data)) {
									disclosure.setOpen(false);
									return;
								}

								mutation.mutate(data);
							})}
							noValidate
						>
							<Dialog.Header>
								<FeaturedIcon.Root>
									<FeaturedIcon.Icon>
										<SquarePenIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Edit account</Dialog.Title>
									<Dialog.Description>Update your account information.</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body>
								<Field.Root invalid={!!form.formState.errors.name}>
									<Field.Label>Name</Field.Label>
									<Field.Input placeholder="Enter name" {...form.register('name')} />
									<Field.ErrorText>{form.formState.errors.name?.message}</Field.ErrorText>
								</Field.Root>
								<Field.Root invalid={!!form.formState.errors.email}>
									<Field.Label>Email</Field.Label>
									<Field.Input type="email" placeholder="Enter email" {...form.register('email')} />
									<Field.ErrorText>{form.formState.errors.email?.message}</Field.ErrorText>
								</Field.Root>
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

function ChangePassword() {
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
