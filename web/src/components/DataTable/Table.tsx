import {isFunction, isNil, isString} from 'es-toolkit';
import {ArrowDownIcon} from 'lucide-react';
import {type ReactNode, type RefObject, useCallback, useEffect, useRef, useState} from 'react';
import {twMerge} from 'tailwind-merge';
import {CheckField} from '../forms/CheckField';
import {useDataTableContext} from './DataTableContext';

export function Table() {
	const {
		collection,
		columnsOrder,
		hiddenColumns,
		checkEnabled,
		checked,
		setChecked,
		sortColumn,
		setSortColumn,
		sortOrder,
		setSortOrder,
		loading,
		pageSize,
		cta,
		...rest
	} = useDataTableContext();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [clippedColumns, setClippedColumns] = useState<string[]>([]);
	const [stickyWidth, setStickyWidth] = useState(0);
	const [stickyLeftWidth, setStickyLeftWidth] = useState(0);
	const onStickyWidthChange = useCallback((side: 'left' | 'right', width: number) => {
		if (side === 'left') setStickyLeftWidth(width);
		else setStickyWidth(width);
	}, []);
	const onColumnVisibilityChange = useCallback((id: string, visible: boolean) => {
		setClippedColumns((previous) => {
			if (visible)
				return previous.includes(id) ? previous.filter((value) => value !== id) : previous;
			return previous.includes(id) ? previous : [...previous, id];
		});
	}, []);

	const columns = (() => {
		const copy = rest.columns.filter((col) => !hiddenColumns.includes(col.id));
		copy.sort((i, j) => columnsOrder.indexOf(i.id) - columnsOrder.indexOf(j.id));
		return copy;
	})();
	const hasStickyActions = columns.length > 1 && columns.at(-1)?.id === 'actions';
	const getStickyClassName = (index: number) =>
		twMerge(
			index === 0 && 'datatable-sticky-cell-left',
			hasStickyActions && index === columns.length - 1 && 'datatable-sticky-cell-right',
			(index === 0 || (hasStickyActions && index === columns.length - 2)) && 'not-last:border-r-0',
		);

	return (
		<div
			ref={scrollRef}
			className={twMerge(
				'relative',
				'block',
				'max-w-full',
				'overflow-x-auto',
				'overflow-y-hidden',
				'whitespace-nowrap',
				'scrollbar:h-2',
				'scrollbar-thumb:bg-neutral-300 dark:scrollbar-thumb:bg-neutral-600',
				'scrollbar-thumb:rounded-full',
				'scrollbar-track:bg-neutral-100 dark:scrollbar-track:bg-neutral-800',
			)}
		>
			<table className="w-full border-separate border-spacing-0">
				<thead>
					<tr>
						{columns.map((col, idx) => (
							<ColumnHeading
								key={col.id}
								id={col.id}
								stickySide={
									idx === 0
										? 'left'
										: hasStickyActions && idx === columns.length - 1
											? 'right'
											: undefined
								}
								rootRef={scrollRef}
								stickyWidth={stickyWidth}
								stickyLeftWidth={stickyLeftWidth}
								onStickyWidthChange={onStickyWidthChange}
								onVisibilityChange={onColumnVisibilityChange}
								clipped={clippedColumns.includes(col.id)}
								className={twMerge(
									'border-neutral-200 not-last:border-r border-b px-4 py-3 text-left font-medium text-neutral-500 text-sm dark:border-neutral-800 dark:text-neutral-400 [&>span]:transition-opacity [&>span]:duration-50 data-[clipped=true]:[&>span]:opacity-75',
									normalizeClassName(col.className).heading,
									getStickyClassName(idx),
								)}
							>
								{checkEnabled && idx === 0 && (
									<CheckField
										value={collection.size > 0 && checked.length >= collection.size}
										onChange={(value) => {
											if (value) {
												setChecked(collection.getValues());
											} else {
												setChecked([]);
											}
										}}
										disabled={collection.size < 1}
										className="mr-2"
									/>
								)}
								{col.heading}
								{col.sortable && (
									<button
										type="button"
										className={twMerge(
											'flex',
											'rounded-md',
											'p-0.5',
											'text-neutral-400 dark:text-neutral-500',
											'transition-all',
											'duration-300',
											'hover:text-neutral-600 dark:hover:text-neutral-300',
											sortColumn === col.id
												? 'text-blue-500 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-400'
												: '',
											sortColumn === col.id && sortOrder === 'ASC' ? 'rotate-180' : '',
											sortColumn === col.id && sortOrder === 'DESC' ? 'rotate-0' : '',
										)}
										onClick={() => {
											if (sortColumn === col.id) {
												switch (sortOrder) {
													case 'DESC':
														setSortOrder('ASC');
														break;
													case 'ASC':
														setSortColumn(null);
														setSortOrder(null);
														break;
													default:
														setSortOrder('DESC');
														break;
												}
											} else {
												setSortColumn(col.id);
												setSortOrder('DESC');
											}
										}}
									>
										<ArrowDownIcon className="size-4" />
									</button>
								)}
							</ColumnHeading>
						))}
					</tr>
				</thead>
				<tbody>
					{!loading &&
						collection.items.map((item) => {
							const value = collection.getItemValue(item);

							return (
								<tr key={collection.stringifyItem(item)} className="not-last:[&_td]:border-b">
									{columns.map((col, idx) => (
										<td
											key={col.id}
											data-clipped={clippedColumns.includes(col.id)}
											className={twMerge(
												'border-neutral-200 not-last:border-r px-4 py-2.5 text-neutral-700 dark:border-neutral-800 dark:text-neutral-200 [&>span]:transition-opacity [&>span]:duration-50 data-[clipped=true]:[&>span]:opacity-75',
												normalizeClassName(col.className).cell,
												getStickyClassName(idx),
											)}
											data-numeric={col.numeric}
										>
											<span
												className={twMerge(
													'flex items-center gap-1',
													col.numeric && 'justify-end font-mono',
												)}
											>
												{checkEnabled && idx === 0 && (
													<CheckField
														value={value != null && checked.includes(value)}
														onChange={(checked) => {
															if (!value) return;
															if (checked) {
																setChecked((prev) => [...prev, value]);
															} else {
																setChecked((prev) => prev.filter((v) => v !== value));
															}
														}}
														className="mr-2"
													/>
												)}
												{col.cell(item, idx)}
											</span>
										</td>
									))}
								</tr>
							);
						})}

					{loading &&
						Array.from({length: pageSize}, () => null).map((_, idx) => (
							<tr key={idx} className="not-last:[&_td]:border-b">
								{columns.map((col, index) => (
									<td
										key={col.id}
										data-clipped={clippedColumns.includes(col.id)}
										className={twMerge(
											'border-neutral-200 not-last:border-r px-4 py-2.5 text-neutral-700 dark:border-neutral-800 dark:text-neutral-200 [&>div]:transition-opacity [&>div]:duration-50 data-[clipped=true]:[&>div]:opacity-50',
											normalizeClassName(col.className).cell,
											getStickyClassName(index),
										)}
									>
										<div className="animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700">
											<div className="invisible" aria-hidden>
												0
											</div>
										</div>
									</td>
								))}
							</tr>
						))}
				</tbody>

				{columns.some((col) => col.summary != null) && (
					<tfoot>
						<tr className="border-neutral-200 border-t dark:border-neutral-800">
							{columns.map((col, index) => (
								<td
									key={col.id}
									className={twMerge(
										'bg-neutral-100 px-4 py-2.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
										col.numeric && 'text-right font-mono',
										normalizeClassName(col.className).summary,
										getStickyClassName(index),
									)}
								>
									{isFunction(col.summary) ? col.summary() : col.summary}
								</td>
							))}
						</tr>
					</tfoot>
				)}
			</table>
		</div>
	);
}

function ColumnHeading({
	id,
	stickySide,
	rootRef,
	stickyWidth,
	stickyLeftWidth,
	onStickyWidthChange,
	onVisibilityChange,
	clipped,
	className,
	children,
}: {
	id: string;
	stickySide?: 'left' | 'right';
	rootRef: RefObject<HTMLDivElement | null>;
	stickyWidth: number;
	stickyLeftWidth: number;
	onStickyWidthChange: (side: 'left' | 'right', width: number) => void;
	onVisibilityChange: (id: string, visible: boolean) => void;
	clipped: boolean;
	className: string;
	children: ReactNode;
}) {
	const ref = useRef<HTMLTableCellElement>(null);
	const contentRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const heading = ref.current;
		if (!heading || !stickySide) return;

		const measure = () => onStickyWidthChange(stickySide, heading.getBoundingClientRect().width);
		const observer = new ResizeObserver(measure);
		observer.observe(heading);
		measure();
		return () => {
			observer.disconnect();
			onStickyWidthChange(stickySide, 0);
		};
	}, [stickySide, onStickyWidthChange]);

	useEffect(() => {
		const heading = ref.current;
		const root = rootRef.current;
		const content = contentRef.current;
		if (!heading || !root || !content) return;
		if (stickySide) {
			onVisibilityChange(id, true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry) onVisibilityChange(id, entry.intersectionRatio >= 1);
			},
			{
				root,
				// Allow for subpixel rounding where adjacent table cells meet.
				rootMargin: `1px ${1 - stickyWidth}px 1px ${1 - stickyLeftWidth}px`,
				threshold: 1,
			},
		);
		observer.observe(content);
		return () => observer.disconnect();
	}, [stickySide, id, onVisibilityChange, rootRef, stickyWidth, stickyLeftWidth]);

	return (
		<th ref={ref} className={className} data-clipped={clipped}>
			<span ref={contentRef} className="flex items-center gap-1">
				{children}
			</span>
		</th>
	);
}

function normalizeClassName(
	value: string | null | undefined | {cell?: string; heading?: string; summary?: string},
) {
	if (isNil(value)) return {};
	if (isString(value)) return {cell: value};
	return value;
}
