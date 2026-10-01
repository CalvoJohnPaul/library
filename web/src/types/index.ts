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

export interface IdFilterInput {
	eq?: string | null;
	neq?: string | null;
	in?: string[] | null;
	nin?: string[] | null;
}

export interface StringFilterInput {
	eq?: string | null;
	neq?: string | null;
	in?: string[] | null;
	nin?: string[] | null;
	contains?: string | null;
}

export interface NumberFilterInput {
	gt?: number | null;
	gte?: number | null;
	lt?: number | null;
	lte?: number | null;
}

export interface NumberLiteralFilterInput {
	eq?: number | null;
	neq?: number | null;
	in?: number[] | null;
	nin?: number[] | null;
}

export interface BooleanFilterInput {
	eq?: boolean | null;
	neq?: boolean | null;
}

export interface DateFilterInput {
	gt?: Date | null;
	gte?: Date | null;
	lt?: Date | null;
	lte?: Date | null;
}

export interface EnumFilterInput<T extends string> {
	eq?: T | null;
	neq?: T | null;
	in?: T[] | null;
	nin?: T[] | null;
}
