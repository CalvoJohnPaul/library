import {Portal} from '@ark-ui/react';
import {isFunction} from 'es-toolkit';
import {LogOutIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {useNavigate} from 'react-router';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {useDestroySessionMutation} from '@/hooks/useDestroySessionMutation';
import {type UseDisclosureReturn, useDisclosure} from '@/hooks/useDisclosure';
import {useMeQuery} from '@/hooks/useMeQuery';
import {client} from '@/utils/client';

export function Logout({
	trigger,
}: {
	trigger: ReactNode | ((context: UseDisclosureReturn) => ReactNode);
}) {
	const disclosure = useDisclosure();
	const navigate = useNavigate();
	const mutation = useDestroySessionMutation({
		onSuccess() {
			client
				.invalidateQueries({queryKey: useMeQuery.getQueryKey()})
				.then(() => {
					navigate('/');
				})
				.catch(console.error);
		},
	});

	return (
		<Dialog.Root
			open={disclosure.open}
			onOpenChange={(details) => disclosure.setOpen(details.open)}
			closeOnEscape
		>
			{isFunction(trigger) ? (
				trigger(disclosure)
			) : (
				<Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
			)}
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<FeaturedIcon.Root accent="danger">
								<FeaturedIcon.Icon>
									<LogOutIcon />
								</FeaturedIcon.Icon>
							</FeaturedIcon.Root>
							<div>
								<Dialog.Title>Log out</Dialog.Title>
								<Dialog.Description>
									You are about to leave the app. Please confirm your action.
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
										Stay
									</Button>
								)}
							</Dialog.Context>
							<Button
								type="submit"
								accent="danger"
								disabled={mutation.isPending}
								onClick={() => mutation.mutate()}
							>
								{mutation.isPending ? <SpinnerIcon className="size-5" /> : 'Proceed'}
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
