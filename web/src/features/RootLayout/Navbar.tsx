import {ark, Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {isNil, omitBy} from 'es-toolkit';
import {isEmpty} from 'es-toolkit/compat';
import {
	BookOpenIcon,
	LockKeyholeIcon,
	LogOutIcon,
	RotateCcwClockIcon,
	SettingsIcon,
	SquarePenIcon,
	UsersIcon,
} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import {NavLink, useNavigate} from 'react-router';
import {cx} from 'tailwind-variants';
import * as z from 'zod';
import {PasswordField} from '@/components/forms/PasswordField';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Avatar} from '@/components/ui/Avatar';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {useDestroySessionMutation} from '@/hooks/useDestroySessionMutation';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useMeQuery} from '@/hooks/useMeQuery';
import {useUpdateMeMutation} from '@/hooks/useUpdateMeMutation';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';

export function Navbar() {
	const query = useMeQuery();
	const links = [
		{
			icon: <BookOpenIcon />,
			label: 'Books',
			href: '/books',
		},
		{
			icon: <RotateCcwClockIcon />,
			label: 'Transactions',
			href: '/transactions',
		},
		{
			icon: <UsersIcon />,
			label: 'Members',
			href: '/members',
		},
	];

	return (
		<header className="flex h-16 items-center border-gray-200 border-b px-12">
			<h2 className="logo-shine block font-extrabold text-xl tracking-wider">read.</h2>
			<div className="grow"></div>
			<nav className="flex gap-1">
				<ul className="contents">
					{links.map((link) => (
						<li key={link.href} className="contents">
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<NavLink
										to={link.href}
										className="block px-2 py-2 text-gray-600 aria-page:font-medium aria-page:text-blue-500"
									>
										<ark.svg asChild className="size-5.5">
											{link.icon}
										</ark.svg>
									</NavLink>
								</Tooltip.Trigger>
								<Portal>
									<Tooltip.Positioner>
										<Tooltip.Content>
											<Tooltip.Arrow>
												<Tooltip.ArrowTip />
											</Tooltip.Arrow>
											{link.label}
										</Tooltip.Content>
									</Tooltip.Positioner>
								</Portal>
							</Tooltip.Root>
						</li>
					))}

					<li className="contents">
						<Menu.Root ids={{trigger: 'settings-trigger'}}>
							<Menu.Context>
								{(api) => (
									<Tooltip.Root ids={{trigger: 'settings-trigger'}} disabled={api.open}>
										<Tooltip.Trigger
											onClick={() => {
												api.setOpen(!api.open);
											}}
											disabled={query.isPending}
											className={cx(
												'block px-2 py-2 text-gray-600 aria-page:font-medium',
												api.open && 'text-blue-500',
											)}
										>
											<SettingsIcon className="size-5.5" />
										</Tooltip.Trigger>

										<Portal>
											<Tooltip.Positioner>
												<Tooltip.Content>
													<Tooltip.Arrow>
														<Tooltip.ArrowTip />
													</Tooltip.Arrow>
													Settings
												</Tooltip.Content>
											</Tooltip.Positioner>
										</Portal>
									</Tooltip.Root>
								)}
							</Menu.Context>

							<Portal>
								<Menu.Positioner>
									<Menu.Content>
										<div className="flex items-center gap-2 py-2 pr-4 pl-2">
											<Avatar.Root>
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
										<Logout />
									</Menu.Content>
								</Menu.Positioner>
							</Portal>
						</Menu.Root>
					</li>
				</ul>
			</nav>
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
		onSuccess: (next) => {
			client.setQueryData(useMeQuery.getQueryKey(), next);
			disclosure.setOpen(false);
			form.reset(next);
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
		onSuccess: (next) => {
			client.setQueryData(useMeQuery.getQueryKey(), next);
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

function Logout() {
	const navigate = useNavigate();
	const mutation = useDestroySessionMutation({
		onSuccess() {
			client
				.invalidateQueries({
					queryKey: useMeQuery.getQueryKey(),
					exact: false,
					type: 'all',
				})
				.then(() => {
					navigate('/');
				})
				.catch(console.error);
		},
	});

	return (
		<Menu.Item
			value="logout"
			disabled={mutation.isPending}
			onSelect={() => {
				mutation.mutate();
			}}
		>
			<LogOutIcon />
			Log out
		</Menu.Item>
	);
}
