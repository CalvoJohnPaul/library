import type {ListCollection} from '@ark-ui/react';
import type {SortOrder} from '@library/types';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {uniq} from 'es-toolkit';
import type {Dispatch, ReactNode, SetStateAction} from 'react';
import type {Merge} from 'type-fest';
import {useLocalStorage} from 'usehooks-ts';
import * as z from 'zod';
import {splitProps} from '@/utils/splitProps';
import type {
	AsyncComboboxField__multiProps,
	AsyncComboboxField__singleProps,
} from '../forms/AsyncComboboxField';
import type {ComboboxFieldProps} from '../forms/ComboboxField';
import type {DateRangeFieldProps} from '../forms/DateRangeField';
import type {NumberRangeFieldProps} from '../forms/NumberRangeField';
import type {SelectFieldProps} from '../forms/SelectField';
import type {TextFieldProps} from '../forms/TextField';
import type {ToggleFieldProps} from '../forms/ToggleField';

export type DataTableFilter =
	| Merge<TextFieldProps, {type: 'TEXT'}>
	| Merge<ToggleFieldProps, {type: 'TOGGLE'}>
	| Merge<Extract<SelectFieldProps, {multiple: true}>, {type: 'SELECT'}>
	| Merge<Extract<SelectFieldProps, {multiple?: false}>, {type: 'SELECT'}>
	| Merge<Extract<ComboboxFieldProps, {multiple: true}>, {type: 'COMBOBOX'}>
	| Merge<Extract<ComboboxFieldProps, {multiple?: false}>, {type: 'COMBOBOX'}>
	| Merge<Extract<AsyncComboboxField__multiProps, {multiple: true}>, {type: 'ASYNC_COMBOBOX'}>
	| Merge<Extract<AsyncComboboxField__singleProps, {multiple?: false}>, {type: 'ASYNC_COMBOBOX'}>
	| Merge<NumberRangeFieldProps, {type: 'NUMBER_RANGE'}>
	| Merge<DateRangeFieldProps, {type: 'DATE_RANGE'}>;

// biome-ignore lint/suspicious/noExplicitAny: ""
export interface DataTableColumn<Data = any> {
	id: string;
	cell: (data: Data, index: number) => ReactNode;
	enabled?: boolean;
	heading?: ReactNode;
	summary?: ReactNode | (() => ReactNode);
	sortable?: boolean;
	orderable?: boolean;
	hideable?: boolean;
	numeric?: boolean;
	filter?: DataTableFilter | null;
	className?:
		| string
		| null
		| {
				heading?: string;
				cell?: string;
				summary?: string;
		  };
}

// biome-ignore lint/suspicious/noExplicitAny: ""
export interface UseDataTableProps<Data = any> {
	id: string;
	collection: ListCollection<Data>;
	columns: DataTableColumn<Data>[];
	/* page */
	paginationEnabled?: boolean;
	page?: number;
	defaultPage?: number;
	onPageChange?: (value: number) => void;
	pageSize?: number;
	defaultPageSize?: number;
	onPageSizeChange?: (value: number) => void;
	total?: number;
	/* sort */
	sortColumn?: string | null;
	defaultSortColumn?: string | null;
	onSortColumnChange?: (value: string | null) => void;
	sortOrder?: SortOrder | null;
	defaultSortOrder?: SortOrder | null;
	onSortOrderChange?: (value: SortOrder | null) => void;
	/* check */
	checkEnabled?: boolean;
	checked?: string[];
	defaultChecked?: string[];
	onCheckedChange?: (value: string[]) => void;
	/* search */
	searchEnabled?: boolean;
	search?: string;
	defaultSearch?: string;
	onSearchChange?: (value: string) => void;

	loading?: boolean;
	onReload?: (() => void | Promise<void>) | null;
	cta?: ReactNode;
}

// biome-ignore lint/suspicious/noExplicitAny: ""
export interface UseDataTableReturn<Data = any> {
	id: string;
	collection: ListCollection<Data>;
	columns: Omit<{[K in keyof DataTableColumn<Data>]-?: DataTableColumn<Data>[K]}, 'enabled'>[];
	hiddenColumns: string[];
	setHiddenColumns: Dispatch<SetStateAction<string[]>>;
	columnsOrder: string[];
	setColumnsOrder: Dispatch<SetStateAction<string[]>>;
	/* page */
	page: number;
	setPage: Dispatch<SetStateAction<number>>;
	pageSize: number;
	setPageSize: Dispatch<SetStateAction<number>>;
	total: number;
	/* sort */
	sortColumn: string | null;
	setSortColumn: Dispatch<SetStateAction<string | null>>;
	sortOrder: SortOrder | null;
	setSortOrder: Dispatch<SetStateAction<SortOrder | null>>;
	/* check */
	checked: string[];
	setChecked: Dispatch<SetStateAction<string[]>>;
	/* search */
	search: string;
	setSearch: Dispatch<SetStateAction<string>>;

	checkEnabled: boolean;
	searchEnabled: boolean;
	columnsControlEnabled: boolean;
	paginationEnabled: boolean;
	filtersEnabled: boolean;

	loading: boolean;
	onReload: (() => void | Promise<void>) | null;
	cta: ReactNode;
}

// biome-ignore lint/suspicious/noExplicitAny: ""
export function useDataTable<Data = any>({
	id,
	collection,
	...props
}: UseDataTableProps<Data>): UseDataTableReturn<Data> {
	const checkEnabled = props.checkEnabled ?? false;
	const searchEnabled = props.searchEnabled ?? false;

	const paginationEnabled = props.paginationEnabled ?? false;
	const columnsControlEnabled = props.columns.some((col) => col.orderable || col.hideable);
	const filtersEnabled = props.columns.some((col) => col.filter != null);

	const [page, setPage] = useControllableState({
		prop: props.page,
		defaultProp: props.defaultPage ?? 1,
		onChange: props.onPageChange,
	});

	const [pageSize, setPageSize] = useControllableState({
		prop: props.pageSize,
		defaultProp: props.defaultPageSize ?? 10,
		onChange: props.onPageSizeChange,
	});

	const [sortColumn, setSortColumn] = useControllableState({
		prop: props?.sortColumn,
		defaultProp: props?.defaultSortColumn ?? null,
		onChange: props?.onSortColumnChange,
	});

	const [sortOrder, setSortOrder] = useControllableState({
		prop: props.sortOrder,
		defaultProp: props.defaultSortOrder ?? null,
		onChange: props.onSortOrderChange,
	});

	const [checked, setChecked] = useControllableState({
		prop: props.checked,
		defaultProp: props.defaultChecked ?? [],
		onChange: props.onCheckedChange,
	});

	const [search, setSearch] = useControllableState({
		prop: props.search,
		defaultProp: props.defaultSearch ?? '',
		onChange: props.onSearchChange,
	});

	const [columnsOrder, setColumnsOrder] = useLocalStorage<string[]>(
		'expense-tracker/data-table/columns-order',
		props.columns.map((col) => col.id),
		{
			serializer(value) {
				return JSON.stringify(value);
			},
			deserializer(value) {
				try {
					return z.array(z.string()).parse(JSON.parse(value)).filter(Boolean);
				} catch {
					return [];
				}
			},
		},
	);

	const [hiddenColumns, setHiddenColumns] = useLocalStorage<string[]>(
		'expense-tracker/data-table/hidden-columns',
		[],
		{
			serializer(value) {
				return JSON.stringify(uniq(value));
			},
			deserializer(value) {
				try {
					return z.array(z.string()).parse(JSON.parse(value)).filter(Boolean);
				} catch {
					return [];
				}
			},
		},
	);

	const columns = props.columns
		.map((column) => {
			return {
				id: column.id,
				cell: column.cell,
				enabled: column.enabled ?? true,
				heading: column.heading ?? null,
				summary: column.summary ?? null,
				hideable: column.hideable ?? false,
				sortable: column.sortable ?? false,
				orderable: column.orderable ?? false,
				numeric: column.numeric ?? false,
				className: column.className ?? null,
				filter: !column.filter
					? null
					: {
							...column.filter,
							/* reset the page to 1 whenever the a filter is changed */
							onChange: !column.filter?.onChange
								? undefined
								: (...args: unknown[]) => {
										setPage(1);
										return call(column.filter?.onChange, args);
									},
						},
			} satisfies DataTableColumn<Data>;
		})
		.filter((col) => col.enabled);

	const total = props.total ?? 0;
	const loading = props.loading ?? false;
	const onReload = props.onReload ?? null;
	const cta = props.cta ?? null;

	return {
		id,
		collection,
		columns,
		columnsOrder,
		setColumnsOrder,
		hiddenColumns,
		setHiddenColumns,
		page,
		setPage,
		pageSize,
		setPageSize,
		total,
		sortColumn,
		setSortColumn,
		sortOrder,
		setSortOrder,
		checked,
		setChecked,
		search,
		setSearch,

		checkEnabled,
		searchEnabled,
		paginationEnabled,
		columnsControlEnabled,
		filtersEnabled,

		loading,
		onReload,
		cta,
	};
}

// biome-ignore lint/complexity/noBannedTypes: ""
const call = (fn: Function | undefined | null, args: unknown[]) => fn?.(...args);

useDataTable.splitProps = <T extends UseDataTableProps>(props: T) => {
	const keys = [
		'checkEnabled',
		'checked',
		'collection',
		'columns',
		'cta',
		'defaultChecked',
		'defaultPage',
		'defaultPageSize',
		'defaultSortColumn',
		'defaultSortOrder',
		'id',
		'loading',
		'onCheckedChange',
		'onPageChange',
		'onPageSizeChange',
		'onReload',
		'onSearchChange',
		'onSortColumnChange',
		'onSortOrderChange',
		'page',
		'pageSize',
		'paginationEnabled',
		'search',
		'searchEnabled',
		'sortColumn',
		'sortOrder',
		'total',
	] as const satisfies (keyof UseDataTableProps)[];

	return splitProps(props, ...keys);
};
