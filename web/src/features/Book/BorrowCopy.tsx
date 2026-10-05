import {Portal} from '@ark-ui/react';
import {RepeatIcon, SearchIcon} from 'lucide-react';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {IconButton} from '@/components/ui/IconButton';
import {Menu} from '@/components/ui/Menu';
import {useDisclosure} from '@/hooks/useDisclosure';
import {useCopyContext} from './CopyContext';

export function BorrowCopy() {
	const copy = useCopyContext();
	const disclosure = useDisclosure();

	console.log(copy);

	return (
		<Dialog.Root
			open={disclosure.open}
			onOpenChange={(details) => disclosure.setOpen(details.open)}
		>
			<Dialog.Context>
				{(api) => (
					<Menu.Item value="borrow" onSelect={() => api.setOpen(true)}>
						<RepeatIcon />
						Borrow
					</Menu.Item>
				)}
			</Dialog.Context>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form>
							<Dialog.Header>
								<FeaturedIcon.Root>
									<FeaturedIcon.Icon>
										<RepeatIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Borrow Copy</Dialog.Title>
									<Dialog.Description>Enter the details to borrow this copy.</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body>
								<Field.Root>
									<Field.Label>User ID</Field.Label>
									<div className="flex items-center gap-2">
										<Field.Input placeholder="Enter user ID" />
										<IconButton variant="outline" accent="gray" className="shrink-0">
											<SearchIcon />
										</IconButton>
									</div>
								</Field.Root>
							</Dialog.Body>
							<Dialog.Footer>
								<Dialog.Context>
									{(api) => (
										<Button variant="outline" accent="gray" onClick={() => api.setOpen(false)}>
											Cancel
										</Button>
									)}
								</Dialog.Context>
								<Button>Submit</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
