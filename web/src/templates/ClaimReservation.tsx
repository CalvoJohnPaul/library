import {Portal} from '@ark-ui/react';
import type {Reservation} from '@library/types';
import {CheckCircle2Icon} from 'lucide-react';
import {useState} from 'react';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {Menu} from '@/components/ui/Menu';
import {useClaimReservationMutation} from '@/hooks/useClaimReservationMutation';
import {useDisclosure} from '@/hooks/useDisclosure';
import {toaster} from '@/utils/toaster';

export interface ClaimReservationProps {
	/**
	 * @description the reservation id
	 */
	id: number;
	disabled?: boolean;
	onClaimed?: (data: Reservation) => void;
}

export function ClaimReservation(props: ClaimReservationProps) {
	const {id, disabled, onClaimed} = props;

	const disclosure = useDisclosure();
	const [remarks, setRemarks] = useState('');
	const mutation = useClaimReservationMutation({
		onSuccess: (data) => {
			disclosure.setOpen(false);
			toaster.success({description: 'Reservation has been claimed.'});
			onClaimed?.(data);
		},
		onError: (error) => {
			toaster.error({description: error.message});
		},
	});

	return (
		<Dialog.Root
			open={disclosure.open}
			onOpenChange={(details) => {
				if (!mutation.isPending) disclosure.setOpen(details.open);
			}}
			onExitComplete={() => setRemarks('')}
		>
			<Dialog.Context>
				{(api) => (
					<Menu.Item value="claim" disabled={disabled} onSelect={() => api.setOpen(true)}>
						<CheckCircle2Icon />
						Claim
					</Menu.Item>
				)}
			</Dialog.Context>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<FeaturedIcon.Root accent="primary">
								<FeaturedIcon.Icon>
									<CheckCircle2Icon />
								</FeaturedIcon.Icon>
							</FeaturedIcon.Root>
							<div>
								<Dialog.Title>Claim reservation</Dialog.Title>
								<Dialog.Description>
									You are about to claim your reserved book. This action is irreversible.
								</Dialog.Description>
							</div>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Field.Root>
								<Field.Label>Remarks</Field.Label>
								<Field.Textarea
									placeholder="Enter remarks"
									value={remarks}
									onChange={(event) => setRemarks(event.target.value)}
								/>
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
							<Button
								accent="primary"
								disabled={mutation.isPending}
								onClick={() =>
									mutation.mutate({
										id,
										remarks: remarks.trim() || null,
									})
								}
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
