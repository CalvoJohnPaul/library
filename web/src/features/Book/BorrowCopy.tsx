import {Portal} from '@ark-ui/react';
import {ArrowRightIcon, RepeatIcon} from 'lucide-react';
import {useBoolean} from 'usehooks-ts';
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
	const loaded = useBoolean();

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
										<IconButton
											variant="outline"
											accent="gray"
											className="shrink-0"
											onClick={() => loaded.setTrue()}
										>
											<ArrowRightIcon />
										</IconButton>
									</div>
								</Field.Root>

								{loaded.value && (
									<>
										<Field.Root>
											<Field.Label>Name</Field.Label>
											<Field.Input placeholder="Enter name" />
										</Field.Root>

										<Field.Root>
											<Field.Label>Course</Field.Label>
											<Field.Input placeholder="Select course" />
										</Field.Root>

										<Field.Root>
											<Field.Label>Year and section</Field.Label>
											<Field.Input placeholder="Select year and section" />
										</Field.Root>
									</>
								)}
							</Dialog.Body>

							{loaded.value && (
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
							)}
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
