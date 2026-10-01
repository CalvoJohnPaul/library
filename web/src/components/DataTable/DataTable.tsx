import type {CSSProperties} from 'react';
import {cx} from 'tailwind-variants';
import {useDisclosure} from '@/hooks/useDisclosure';
import {ColumnsControl, ColumnsControlTrigger} from './ColumnsControl';
import {ColumnsControlProvider, DataTableProvider, FiltersProvider} from './DataTableContext';
import {Empty} from './Empty';
import {ExportTrigger} from './ExportTrigger';
import {Filters, FiltersTrigger} from './Filters';
import {Pagination} from './Pagination';
import {ReloadTrigger} from './ReloadTrigger';
import {Table} from './Table';
import {type UseDataTableProps, useDataTable} from './useDataTable';

// biome-ignore lint/suspicious/noExplicitAny: ""
export interface DataTableProps<Data = any> extends UseDataTableProps<Data> {
	style?: CSSProperties;
	className?: string;
}

// biome-ignore lint/suspicious/noExplicitAny: ""
export function DataTable<Data = any>(props: DataTableProps<Data>) {
	const [useDataTableProps, localProps] = useDataTable.splitProps(props);

	const dataTable = useDataTable(useDataTableProps);
	const filters = useDisclosure();
	const columnsControl = useDisclosure();
	const empty = dataTable.collection.size < 1 && !dataTable.loading;

	return (
		<div
			id={dataTable.id}
			{...localProps}
			className={cx('relative overflow-hidden', props.className)}
		>
			<DataTableProvider value={dataTable}>
				<FiltersProvider value={filters}>
					<ColumnsControlProvider value={columnsControl}>
						<div className="flex items-start gap-3">
							<Filters />
							<div className="grow overflow-hidden rounded-lg border border-gray-200">
								<div className="grow">
									{(dataTable.filtersEnabled ||
										dataTable.columnsControlEnabled ||
										dataTable.onReload != null ||
										dataTable.onExport != null) && (
										<div className="flex items-center gap-3 border-gray-200 border-b p-4">
											<FiltersTrigger />
											<div className="grow" />
											<ExportTrigger />
											<ColumnsControlTrigger />
											<ReloadTrigger />
										</div>
									)}
									{empty === true && <Empty />}
									{empty === false && (
										<>
											<Table />
											<Pagination />
										</>
									)}
								</div>
							</div>
							<ColumnsControl />
						</div>
					</ColumnsControlProvider>
				</FiltersProvider>
			</DataTableProvider>
		</div>
	);
}
