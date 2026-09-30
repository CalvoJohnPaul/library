import {Portal} from '@ark-ui/react';
import {PlusIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {SelectField} from '@/components/forms/SelectField';
import {Button} from '@/components/ui/Button';
import {Dialog} from '@/components/ui/Dialog';
import {FeaturedIcon} from '@/components/ui/FeaturedIcon';
import {Field} from '@/components/ui/Field';
import {type UseDisclosureReturn, useDisclosure} from '@/hooks/useDisclosure';
import {getBookGenreOptions} from '@/utils/book';

export interface AddBookProps {
	trigger?: ReactNode | ((disclosure: UseDisclosureReturn) => ReactNode);
}

export function AddBook({trigger}: AddBookProps) {
	const disclosure = useDisclosure();

	return (
		<Dialog.Root
			open={disclosure.open}
			onOpenChange={(details) => disclosure.setOpen(details.open)}
		>
			<Dialog.Trigger asChild>
				{typeof trigger === 'function'
					? trigger(disclosure)
					: (trigger ?? (
							<Button>
								<PlusIcon />
								Add book
							</Button>
						))}
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content asChild>
						<form>
							<Dialog.Header>
								<FeaturedIcon.Root>
									<FeaturedIcon.Icon>
										<PlusIcon />
									</FeaturedIcon.Icon>
								</FeaturedIcon.Root>
								<div>
									<Dialog.Title>Add book</Dialog.Title>
									<Dialog.Description>
										Fill out the form to add a new book to your&nbsp;collection.
									</Dialog.Description>
								</div>
								<Dialog.CloseTrigger />
							</Dialog.Header>
							<Dialog.Body className="space-y-3">
								<Field.Root>
									<Field.Label>Title</Field.Label>
									<Field.Input placeholder="Enter title" />
								</Field.Root>
								<Field.Root>
									<Field.Label>Author</Field.Label>
									<Field.Input placeholder="Enter author" />
								</Field.Root>
								<Field.Root>
									<Field.Label>Genre</Field.Label>
									<SelectField placeholder="Select genre" options={getBookGenreOptions()} />
								</Field.Root>
								<Field.Root>
									<Field.Label>Year Published</Field.Label>
									<SelectField placeholder="Select year published" options={yearOptions} />
								</Field.Root>
							</Dialog.Body>
							<Dialog.Footer>
								<Button variant="outline" accent="gray">
									Cancel
								</Button>
								<Button type="submit">Submit</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}

const startYear = 1960;
const endYear = new Date().getFullYear();
const yearOptions = Array.from({length: endYear - startYear + 1}, (_, i) => {
	const n = `${startYear + i}`;

	return {
		value: n,
		label: n,
	};
}).toReversed();
