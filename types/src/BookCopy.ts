import * as z from 'zod';

export const BookStatusDefinition = z.enum(['available', 'borrowed']);
export const BookCopyDefinition = z.object({
	id: z.string(),
	bookId: z.string(),
	status: BookStatusDefinition,
	dateTimeCreated: z.date(),
	dateTimeUpdated: z.date(),
});

export type BookStatus = z.infer<typeof BookStatusDefinition>;
export type BookCopy = z.infer<typeof BookCopyDefinition>;
