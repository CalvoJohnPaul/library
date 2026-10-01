import {zodResolver} from '@hookform/resolvers/zod';
import {CreateSessionInputDefinition} from '@library/types';
import {useForm} from 'react-hook-form';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Field} from '@/components/ui/Field';
import {PasswordInput} from '@/components/ui/PasswordInput';
import {useCreateSessionMutation} from '@/hooks/useCreateSessionMutation';
import {useMeQuery} from '@/hooks/useMeQuery';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';

export function Login() {
	const form = useForm({
		resolver: zodResolver(CreateSessionInputDefinition),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const mutation = useCreateSessionMutation({
		onSuccess: async () => {
			await client.invalidateQueries({
				queryKey: useMeQuery.getQueryKey(),
				exact: true,
				type: 'all',
				refetchType: 'active',
			});
		},
		onError: (error) => {
			toaster.error({
				description: error.message,
			});
		},
	});

	return (
		<>
			<title>Log in | read.</title>
			<main className="px-12 py-32">
				<h1 className="text-center font-bold text-2xl">Log in</h1>

				<form
					onSubmit={form.handleSubmit((data) => {
						mutation.mutate(data);
					})}
					noValidate
					className="mx-auto mt-12 max-w-88"
				>
					<Field.Root invalid={!!form.formState.errors.email}>
						<Field.Label>Email</Field.Label>
						<Field.Input
							type="email"
							required
							placeholder="Enter your email"
							{...form.register('email')}
						/>
						<Field.ErrorText>{form.formState.errors.email?.message}</Field.ErrorText>
					</Field.Root>
					<Field.Root className="mt-4" invalid={!!form.formState.errors.password}>
						<Field.Label>Password</Field.Label>
						<PasswordInput.Root>
							<PasswordInput.Control>
								<PasswordInput.Input
									{...form.register('password')}
									required
									placeholder="Enter your password"
								/>
								<PasswordInput.VisibilityTrigger>
									<PasswordInput.Indicator />
								</PasswordInput.VisibilityTrigger>
							</PasswordInput.Control>
						</PasswordInput.Root>
						<Field.ErrorText>{form.formState.errors.password?.message}</Field.ErrorText>
					</Field.Root>

					<Button type="submit" disabled={mutation.isPending} className="mt-8 w-full">
						{mutation.isPending ? <SpinnerIcon className="size-5" /> : 'Log in'}
					</Button>
				</form>
			</main>
		</>
	);
}
