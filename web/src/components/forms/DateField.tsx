import {dataAttr, Portal, parseDate} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {format} from 'date-fns';
import {isNil, isString} from 'es-toolkit';
import {ChevronDownIcon} from 'lucide-react';
import {twMerge} from 'tailwind-merge';
import {DatePicker} from '../ui/DatePicker';

export interface DateFieldProps {
	value?: string | Date | null;
	defaultValue?: string | Date | null;
	onChange?: (value: Date | null) => void;
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

export function DateField(props: DateFieldProps) {
	const [value, setValue] = useControllableState({
		prop: isString(props.value) ? new Date(props.value) : props.value,
		defaultProp: isString(props.defaultValue)
			? new Date(props.defaultValue)
			: (props.defaultValue ?? null),
		onChange: props.onChange,
	});

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
										<DatePicker.RangeText />
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
										<DatePicker.RangeText />
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
										<DatePicker.RangeText />
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
			value={value == null ? [] : [parseDate(value)]}
			onValueChange={(details) => {
				const newValue = details.value.at(0)?.toDate(tz);
				setValue(newValue ?? null);
			}}
			min={props.min ? parseDate(props.min) : undefined}
			max={props.max ? parseDate(props.max) : undefined}
			readOnly={props.readOnly}
			disabled={props.disabled}
			required={props.required}
			invalid={props.invalid}
			selectionMode="single"
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
								'ui-invalid:focus-within:outline-red-400',
								'focus:outline-2',
								'focus:outline-solid',
								'focus:outline-blue-600',
								'focus:-outline-offset-1',
								'ui-open:ui-invalid:border-red-400',
								'ui-open:ui-invalid:outline-red-400',
							)}
							data-invalid={dataAttr(api.invalid)}
						>
							<span className="grow" data-placeholder-shown={dataAttr(isNil(value))}>
								{api.value.length < 1
									? props.placeholder || 'Select'
									: format(api.value[0].toDate(tz), 'dd MMM yyyy')}
							</span>
							<ChevronDownIcon
								className="ui-open:rotate-180 text-neutral-300 transition-transform duration-300"
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
