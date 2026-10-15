import {createListCollection, Portal} from '@ark-ui/react';
import {useDebouncer} from '@tanstack/react-pacer';
import {clamp} from 'es-toolkit';
import {useEffect, useState} from 'react';
import {Pagination as ArkPagination} from '../ui/Pagination';
import {Select} from '../ui/Select';
import {useDataTableContext} from './DataTableContext';

const formatNumber = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 0,
	minimumFractionDigits: 0,
}).format;

const PAGE_COMMIT_DEBOUNCE = 250;

export function Pagination() {
	const {paginationEnabled, page, setPage, pageSize, setPageSize, total} = useDataTableContext();
	const totalPages = Math.ceil(total / pageSize);

	const [optimisticPage, setOptimisticPage] = useState(page);
	const commitPage = useDebouncer(setPage, {wait: PAGE_COMMIT_DEBOUNCE});

	useEffect(() => {
		setOptimisticPage(page);
		commitPage.cancel();
	}, [page, commitPage]);

	const sizeCollection = createListCollection({
		items: [10, 25, 50],
		itemToValue: (item) => `${item}`,
		itemToString: (item) => `${item} rows`,
	});

	if (!paginationEnabled) return null;

	return (
		<div className="@container flex items-center gap-3 border-gray-200 border-t p-4 pl-6">
			<p className="grow text-gray-500 text-sm">
				Page {formatNumber(clamp(optimisticPage, totalPages))} of {formatNumber(totalPages)}
			</p>
			<Select.Root
				value={[pageSize.toString()]}
				onValueChange={(details) => {
					const s = details.value.at(0);
					const n = s ? Number.parseInt(s, 10) : null;
					const v = !n || Number.isNaN(n) ? 10 : n;

					commitPage.cancel();
					setOptimisticPage(1);
					setPage(1);
					setPageSize(v);
				}}
				collection={sizeCollection}
				className="w-32"
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
				page={optimisticPage}
				pageSize={pageSize}
				onPageChange={(details) => {
					setOptimisticPage(details.page);
					commitPage.maybeExecute(details.page);
					setPageSize(details.pageSize);
				}}
				onPageSizeChange={(details) => {
					commitPage.cancel();
					setOptimisticPage(1);
					setPage(1);
					setPageSize(details.pageSize);
				}}
				siblingCount={0}
			>
				<ArkPagination.PrevTrigger />
				<div className="@xl:contents hidden">
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
