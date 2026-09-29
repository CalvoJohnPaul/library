import {createListCollection, Portal} from '@ark-ui/react';
import {clamp} from 'es-toolkit';
import {Pagination as ArkPagination} from '../ui/Pagination';
import {Select} from '../ui/Select';
import {useDataTableContext} from './DataTableContext';

const formatNumber = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 0,
	minimumFractionDigits: 0,
}).format;

export function Pagination() {
	const {paginationEnabled, page, setPage, pageSize, setPageSize, total} = useDataTableContext();
	const totalPages = Math.ceil(total / pageSize);

	const sizeCollection = createListCollection({
		items: [10, 25, 50],
		itemToValue: (item) => `${item}`,
		itemToString: (item) => `${item} rows`,
	});

	if (!paginationEnabled) return null;

	return (
		<div className="flex items-center gap-2 border-t p-3 pl-4 lg:gap-3 lg:p-4 lg:pl-6">
			<p className="grow text-neutral-400 text-sm">
				Page {formatNumber(clamp(page, totalPages))} of {formatNumber(totalPages)}
			</p>
			<Select.Root
				value={[pageSize.toString()]}
				onValueChange={(details) => {
					const s = details.value.at(0);
					const n = s ? Number.parseInt(s, 10) : null;
					const v = !n || Number.isNaN(n) ? 10 : n;

					setPage(1);
					setPageSize(v);
				}}
				collection={sizeCollection}
				className="w-18 lg:w-32"
			>
				<Select.Control>
					<Select.Trigger>
						<Select.ValueText />
						<Select.Indicator />
					</Select.Trigger>
				</Select.Control>
				<Portal>
					<Select.Positioner>
						<Select.Content>
							{sizeCollection.items.map((item) => (
								<Select.Item key={item} item={item}>
									<Select.ItemText>{sizeCollection.stringifyItem(item)}</Select.ItemText>
									<Select.ItemIndicator />
								</Select.Item>
							))}
						</Select.Content>
					</Select.Positioner>
				</Portal>
			</Select.Root>

			<ArkPagination.Root
				count={total}
				page={page}
				pageSize={pageSize}
				onPageChange={(details) => {
					setPage(details.page);
					setPageSize(details.pageSize);
				}}
				onPageSizeChange={(details) => {
					setPage(1);
					setPageSize(details.pageSize);
				}}
			>
				<ArkPagination.PrevTrigger />
				<div className="hidden lg:contents">
					<ArkPagination.Context>
						{(api) =>
							api.pages.map((page, idx) =>
								page.type === 'ellipsis' ? (
									<ArkPagination.Ellipsis key={idx} index={idx} />
								) : (
									<ArkPagination.Item key={idx} {...page}>
										{page.value}
									</ArkPagination.Item>
								),
							)
						}
					</ArkPagination.Context>
				</div>
				<ArkPagination.NextTrigger />
			</ArkPagination.Root>
		</div>
	);
}
