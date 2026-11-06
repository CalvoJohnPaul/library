import {Portal} from '@ark-ui/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {isNil, omitBy} from 'es-toolkit';
import {isEmpty} from 'es-toolkit/compat';
import {SquarePenIcon} from 'lucide-react';
import {useForm} from 'react-hook-form';
import * as z from 'zod';
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

const EditAccountInputDefinition = z.object({
	name: z.string(),
	email: z.string(),
});

export function EditAccount() {
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
