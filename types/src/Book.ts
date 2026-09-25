import * as z from 'zod';

export const BookDefinition = z.object({
	id: z.string(),
	title: z.string(),
	author: z.string(),
	genre: z.string(),
	yearPublished: z.number(),
	dateTimeCreated: z.string(),
	dateTimeUpdated: z.string(),
});

export type Book = z.infer<typeof BookDefinition>;
