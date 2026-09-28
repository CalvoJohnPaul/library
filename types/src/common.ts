import * as z from 'zod';

export const IdDefinition = z.number().positive().min(1, 'Invalid ID');

export const PasswordDefinition = z
	.string()
	.trim()
	.min(8, 'Password too short')
	.max(100, 'Password too long');

export const DateDefinition = z
	.union([z.date(), z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), 'Invalid date')])
	.transform((v) => (typeof v === 'string' ? new Date(v) : v));

export type Paginated<T> = z.infer<ReturnType<typeof PaginatedDefinition<z.ZodType<T>>>>;
export const PaginatedDefinition = <T extends z.ZodType>(def: T) =>
	z.object({
		rows: z.array(def),
		next: z.number().nullable().optional(),
		previous: z.number().nullable().optional(),
		hasNext: z.boolean(),
		hasPrevious: z.boolean(),
	});

export type SortOrder = z.infer<typeof SortOrderDefinition>;
export const SortOrderDefinition = z.enum(['ASC', 'DESC']);
