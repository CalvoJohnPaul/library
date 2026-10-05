import {createListCollection, Portal} from '@ark-ui/react';
import {format} from 'date-fns';
import {RepeatIcon, SettingsIcon} from 'lucide-react';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/Badge';
import {Menu} from '@/components/ui/Menu';
import {useBookCopiesQuery} from '@/hooks/useBookCopiesQuery';
import {
	type ExportBookCopiesInput,
	useExportBookCopiesMutation,
} from '@/hooks/useExportBookCopiesMutation';
import {getBookCopyStatusLabel, getBookCopyStatusOptions} from '@/utils/common';
import {toaster} from '@/utils/toaster';
import {useBookContext} from './BookContext';
import {CopyProvider} from './CopyContext';
import {DeleteCopy} from './DeleteCopy';
import {EditCopy} from './EditCopy';
import {ReturnCopy} from './ReturnCopy';

export function Copies() {
	const book = useBookContext();
	const filters: ExportBookCopiesInput = {
		bookId: {
			eq: book.id.toString(),
		},
	};
	const query = useBookCopiesQuery(filters);

	const exportMutation = useExportBookCopiesMutation({
		onError: (error) => {
			toaster.error({
				description: error.message,
			});
		},
	});

	return (
		<DataTable
			id="book-copies"
			collection={createListCollection({
				items: query.data?.rows ?? [],
				itemToValue: (copy) => copy.id.toString(),
				itemToString: (copy) => copy.isbn,
			})}
			columns={[
				{
					id: 'isbn',
					heading: 'ISBN',
					cell(copy) {
						return copy.isbn;
					},
				},
				{
					id: 'status',
					heading: 'Status',
					cell(copy) {
						return (
							<Badge.Root accent={copy.status === 'AVAILABLE' ? 'success' : 'danger'}>
								<Badge.Label>{getBookCopyStatusLabel(copy.status)}</Badge.Label>
							</Badge.Root>
						);
					},
					filter: {
						type: 'SELECT',
						multiple: true,
						placeholder: 'Select status',
						options: getBookCopyStatusOptions(),
					},
				},
				{
					id: 'dateTimeCreated',
					heading: 'Date added',
					cell(copy) {
						return format(copy.dateTimeCreated, 'MMM dd, yyyy hh:mm a');
					},
					filter: {
						type: 'DATE_RANGE',
						placeholder: 'Select date',
					},
					sortable: true,
				},
				{
					id: 'dateTimeUpdated',
					heading: 'Date updated',
					cell(copy) {
						return format(copy.dateTimeUpdated, 'MMM dd, yyyy hh:mm a');
					},
					filter: {
						type: 'DATE_RANGE',
						placeholder: 'Select date',
					},
					sortable: true,
				},
				{
					id: 'actions',
					heading: <SettingsIcon className="size-5" />,
					cell(copy) {
						return (
							<Menu.Root>
								<Menu.Trigger>
									<SettingsIcon className="size-5" />
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content>
											<CopyProvider value={copy}>
												<EditCopy />
												{copy.status === 'AVAILABLE' && (
													<Menu.Item value="borrow">
														<RepeatIcon />
														Borrow
													</Menu.Item>
												)}
												{copy.status === 'BORROWED' && <ReturnCopy />}
												<Menu.Separator />
												<DeleteCopy />
											</CopyProvider>
										</Menu.Content>
									</Menu.Positioner>
								</Portal>
							</Menu.Root>
						);
					},
					className: 'w-0 text-center',
				},
			]}
			paginationEnabled
			total={query.data?.total ?? 0}
			loading={query.isLoading}
			onReload={() => {}}
			exporting={exportMutation.isPending}
			onExport={() => {
				exportMutation.mutate(filters);
			}}
		/>
	);
}
