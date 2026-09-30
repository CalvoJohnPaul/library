import {CreateSessionInputDefinition} from '@library/types';
import {useForm} from '@tanstack/react-form';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Field} from '@/components/ui/Field';
import {PasswordInput} from '@/components/ui/PasswordInput';
import {useCreateSessionMutation} from '@/hooks/useCreateSessionMutation';
import {useMeQuery} from '@/hooks/useMeQuery';
import {client} from '@/utils/client';
import {toaster} from '@/utils/toaster';

export function Login() {
	const mutation = useCreateSessionMutation();
	const form = useForm({
		validators: {
			onSubmit: CreateSessionInputDefinition,
		},
		defaultValues: {
			email: '',
			password: '',
		},
		onSubmit: async ({value}) => {
			try {
				await mutation.mutateAsync(value);
				await client.invalidateQueries({
					queryKey: useMeQuery.getQueryKey(),
					exact: true,
				});
			} catch (error) {
				toaster.error({
					title: 'Login Failed',
					description:
						error instanceof Error ? error.message : 'Something went wrong. Please try again.',
				});
			}
		},
	});

	return (
		<main className="px-12 py-32">
			<h1 className="text-center font-bold text-2xl">Log in</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				noValidate
				className="mx-auto mt-12 max-w-88"
			>
				<form.Field
					name="email"
					validators={{
						onChange: CreateSessionInputDefinition.shape.email,
					}}
				>
					{(field) => (
						<Field.Root invalid={field.state.meta.errors.length > 0}>
							<Field.Label>Email</Field.Label>
							<Field.Input
								type="email"
								value={field.state.value}
								onChange={(e) => {
									field.handleChange(e.target.value);
								}}
								required
								placeholder="Enter your email"
							/>
							<Field.ErrorText>{field.state.meta.errors.at(0)?.message}</Field.ErrorText>
						</Field.Root>
					)}
				</form.Field>
				<form.Field
					name="password"
					validators={{
						onChange: CreateSessionInputDefinition.shape.password,
					}}
				>
					{(field) => (
						<Field.Root className="mt-4" invalid={field.state.meta.errors.length > 0}>
							<Field.Label>Password</Field.Label>
							<PasswordInput.Root>
								<PasswordInput.Control>
									<PasswordInput.Input
										value={field.state.value}
										onChange={(e) => {
											field.handleChange(e.target.value);
										}}
										required
										placeholder="Enter your password"
									/>
									<PasswordInput.VisibilityTrigger>
										<PasswordInput.Indicator />
									</PasswordInput.VisibilityTrigger>
								</PasswordInput.Control>
							</PasswordInput.Root>
							<Field.ErrorText>{field.state.meta.errors.at(0)?.message}</Field.ErrorText>
						</Field.Root>
					)}
				</form.Field>

				<form.Subscribe>
					{({canSubmit, isSubmitting}) => (
						<Button type="submit" disabled={!canSubmit} className="mt-8 w-full">
							{isSubmitting ? <SpinnerIcon className="size-5" /> : 'Log in'}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</main>
	);
}
