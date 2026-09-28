import {Field} from '@/components/ui/Field';

export function Books() {
	return (
		<div className="space-y-4 p-4">
			<Field.Root invalid>
				<Field.Label>Title</Field.Label>
				<Field.Input placeholder="Enter title" />
				<Field.ErrorText>Error message</Field.ErrorText>
			</Field.Root>

			<Field.Root>
				<Field.Label>Description</Field.Label>
				<Field.Textarea placeholder="Enter description" />
				<Field.ErrorText>Error message</Field.ErrorText>
			</Field.Root>
		</div>
	);
}
