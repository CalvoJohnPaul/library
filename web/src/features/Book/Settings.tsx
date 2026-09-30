import {useBoolean} from 'usehooks-ts';
import {SelectField} from '@/components/forms/SelectField';
import {Button} from '@/components/ui/Button';
import {Field} from '@/components/ui/Field';
import {getBookGenreOptions, getBookYearPublishedOptions} from '@/utils/common';
import {useBookContext} from './BookContext';

export function Settings() {
	const book = useBookContext();
	const editing = useBoolean();

	return (
		<div>
			<form>
				<div className="space-y-3">
					<Field.Root>
						<Field.Label>Title</Field.Label>
						<Field.Input readOnly={!editing.value} placeholder="Enter title" value={book.title} />
					</Field.Root>
					<Field.Root>
						<Field.Label>Author</Field.Label>
						<Field.Input readOnly={!editing.value} placeholder="Enter author" value={book.author} />
					</Field.Root>
					<Field.Root>
						<Field.Label>Genre</Field.Label>
						<SelectField
							value={book.genre}
							options={getBookGenreOptions()}
							placeholder="Select genre"
							readOnly={!editing.value}
						/>
					</Field.Root>
					<Field.Root>
						<Field.Label>Year published</Field.Label>
						<SelectField
							value={book.yearPublished.toString()}
							options={getBookYearPublishedOptions()}
							placeholder="Select year published"
							readOnly={!editing.value}
						/>
					</Field.Root>
				</div>

				<div className="mt-8 flex justify-end gap-3">
					{editing.value && (
						<>
							<Button
								className="w-32"
								variant="outline"
								accent="gray"
								onClick={() => {
									editing.setFalse();
								}}
							>
								Cancel
							</Button>
							<Button type="submit" className="w-32" disabled>
								Save
							</Button>
						</>
					)}

					{!editing.value && (
						<>
							<Button
								className="w-32"
								variant="outline"
								accent="gray"
								onClick={() => {
									editing.setTrue();
								}}
							>
								Edit
							</Button>
							<Button className="w-32" accent="danger">
								Delete
							</Button>
						</>
					)}
				</div>
			</form>
		</div>
	);
}
