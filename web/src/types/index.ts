export interface Option {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface DateRange {
	from?: Date | null;
	to?: Date | null;
}

export interface NumberRange {
	from?: number | null;
	to?: number | null;
}
