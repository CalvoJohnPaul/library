import {dataAttr, Portal, parseDate} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {endOfDay, format, startOfDay} from 'date-fns';
import {ChevronDownIcon} from 'lucide-react';
import {twMerge} from 'tailwind-merge';
import type {DateRange} from '@/types/index';
import {DatePicker} from '../ui/DatePicker';

export interface DateRangeFieldProps {
	value?: DateRange | null;
	defaultValue?: DateRange | null;
	onChange?: (value: DateRange | null) => void;
	min?: Date;
	max?: Date;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	className?: string;
	placeholder?: string;
	portalled?: boolean;
}

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function DateRangeField(props: DateRangeFieldProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? null,
		onChange: props.onChange,
	});

	const valueAsArray = [value?.from, value?.to].filter(Boolean).map((d) => parseDate(d));

	const content = (
		<DatePicker.Positioner>
			<DatePicker.Content>
				<DatePicker.View view="day">
					<DatePicker.Context>
						{(api) => (
							<>
								<DatePicker.ViewControl>
									<DatePicker.PrevTrigger />
									<DatePicker.ViewTrigger>
										<span className="rounded-md px-1.5 py-0.5 font-semibold text-gray-700 text-sm hover:bg-gray-100 hover:text-gray-900">
											{format(api.visibleRange.start.toDate(tz), 'MMMM yyyy')}
										</span>
									</DatePicker.ViewTrigger>
									<DatePicker.NextTrigger />
								</DatePicker.ViewControl>
								<DatePicker.Table>
									<DatePicker.TableHead>
										<DatePicker.TableRow>
											{api.weekDays.map((weekDay, id) => (
												<DatePicker.TableHeader key={id}>{weekDay.short}</DatePicker.TableHeader>
											))}
										</DatePicker.TableRow>
									</DatePicker.TableHead>
									<DatePicker.TableBody>
										{api.weeks.map((week, id) => (
											<DatePicker.TableRow key={id}>
												{week.map((day, id) => (
													<DatePicker.TableCell key={id} value={day}>
														<DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
													</DatePicker.TableCell>
												))}
											</DatePicker.TableRow>
										))}
									</DatePicker.TableBody>
								</DatePicker.Table>
							</>
						)}
					</DatePicker.Context>
				</DatePicker.View>
				<DatePicker.View view="month">
					<DatePicker.Context>
						{(api) => (
							<>
								<DatePicker.ViewControl>
									<DatePicker.PrevTrigger />
									<DatePicker.ViewTrigger>
										<span className="rounded-md px-1.5 py-0.5 font-semibold text-gray-700 text-sm hover:bg-gray-100 hover:text-gray-900">
											{format(api.visibleRange.start.toDate(tz), 'MMMM yyyy')}
										</span>
									</DatePicker.ViewTrigger>
									<DatePicker.NextTrigger />
								</DatePicker.ViewControl>
								<DatePicker.Table>
									<DatePicker.TableBody>
										{api.getMonthsGrid({columns: 4, format: 'short'}).map((months, id) => (
											<DatePicker.TableRow key={id}>
												{months.map((month, id) => (
													<DatePicker.TableCell key={id} value={month.value}>
														<DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
													</DatePicker.TableCell>
												))}
											</DatePicker.TableRow>
										))}
									</DatePicker.TableBody>
								</DatePicker.Table>
							</>
						)}
					</DatePicker.Context>
				</DatePicker.View>
				<DatePicker.View view="year">
					<DatePicker.Context>
						{(api) => (
							<>
								<DatePicker.ViewControl>
									<DatePicker.PrevTrigger />
									<DatePicker.ViewTrigger>
										<span className="rounded-md px-1.5 py-0.5 font-semibold text-gray-700 text-sm hover:bg-gray-100 hover:text-gray-900">
											{format(api.visibleRange.start.toDate(tz), 'MMMM yyyy')}
										</span>
									</DatePicker.ViewTrigger>
									<DatePicker.NextTrigger />
								</DatePicker.ViewControl>
								<DatePicker.Table>
									<DatePicker.TableBody>
										{api.getYearsGrid({columns: 4}).map((years, id) => (
											<DatePicker.TableRow key={id}>
												{years.map((year, id) => (
													<DatePicker.TableCell key={id} value={year.value}>
														<DatePicker.TableCellTrigger>{year.label}</DatePicker.TableCellTrigger>
													</DatePicker.TableCell>
												))}
											</DatePicker.TableRow>
										))}
									</DatePicker.TableBody>
								</DatePicker.Table>
							</>
						)}
					</DatePicker.Context>
				</DatePicker.View>
			</DatePicker.Content>
		</DatePicker.Positioner>
	);

	return (
		<DatePicker.Root
			value={valueAsArray}
			onValueChange={(details) => {
				const l = details.value.map((d) => d.toDate(tz));
				const r: DateRange | null =
					l.length < 1
						? null
						: {
								from: l.at(0) ? startOfDay(l[0]) : null,
								to: l.at(1) ? endOfDay(l[1]) : null,
							};

				setValue(r);
			}}
			min={props.min ? parseDate(props.min) : undefined}
			max={props.max ? parseDate(props.max) : undefined}
			readOnly={props.readOnly}
			disabled={props.disabled}
			required={props.required}
			invalid={props.invalid}
			selectionMode="range"
			closeOnSelect={false}
		>
			<DatePicker.Control>
				<DatePicker.Context>
					{(api) => (
						<DatePicker.Trigger
							className={twMerge(
								'grow',
								'gap-2',
								'justify-start',
								'px-4',
								'text-left',
								'ui-invalid:border-red-400',
								'ui-open:ui-invalid:border-red-400',
							)}
							data-invalid={dataAttr(api.invalid)}
						>
							<span
								className="grow truncate"
								title={
									api.value.length < 1
										? undefined
										: api.value.map((v) => format(v.toDate(tz), 'dd MMM yyyy')).join(' - ')
								}
								data-placeholder-shown={dataAttr(valueAsArray.length <= 0)}
							>
								{api.value.length < 1
									? props.placeholder || 'Select'
									: api.value.map((v) => format(v.toDate(tz), 'dd MMM yyyy')).join(' - ')}
							</span>

							<ChevronDownIcon
								className="ui-open:rotate-180 text-gray-600 transition-transform duration-300"
								data-state={api.open ? 'open' : 'closed'}
							/>
						</DatePicker.Trigger>
					)}
				</DatePicker.Context>
			</DatePicker.Control>
			{props.portalled ? <Portal>{content}</Portal> : content}
		</DatePicker.Root>
	);
}
