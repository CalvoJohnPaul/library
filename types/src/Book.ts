import * as z from 'zod';
import {DateDefinition} from './common.js';

export const BookGenreDefinition = z.enum([
	'FICTION',
	'NON_FICTION',
	'ROMANCE',
	'FANTASY',
	'SCIENCE_FICTION',
	'MYSTERY',
	'THRILLER',
	'HORROR',
	'HISTORICAL_FICTION',
	'BIOGRAPHY',
	'SELF_HELP',
	'HISTORY',
	'PHILOSOPHY',
	'PSYCHOLOGY',
	'BUSINESS',
	'SCIENCE',
	'TRAVEL',
	'RELIGION_SPIRITUALITY',
	'YOUNG_ADULT',
	'CHILDREN',
	'POETRY',
]);

export const BookDefinition = z.object({
	id: z.number(),
	title: z.string(),
	author: z.string(),
	genre: BookGenreDefinition,
	yearPublished: z.number().positive(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
	totalCopies: z.number(),
	available: z.boolean(),
});

export const CreateBookInputDefinition = z.object({
	title: z.string({error: 'Title is required'}).trim().min(1, 'Title is required'),
	author: z.string({error: 'Author is required'}).trim().min(1, 'Author is required'),
	genre: z.enum(BookGenreDefinition.options, {error: 'Genre is required'}),
	yearPublished: z.number({error: 'Year published is required'}).positive('Invalid year published'),
});

export const UpdateBookDataInputDefinition = z.object({
	title: z.string().optional().nullable(),
	author: z.string().optional().nullable(),
	genre: z.enum(BookGenreDefinition.options).optional().nullable(),
	yearPublished: z.number().positive().optional().nullable(),
});

export const UpdateBookInputDefinition = z.object({
	id: z.number(),
	data: UpdateBookDataInputDefinition,
});

export const BookSortByInputDefinition = z.enum(['dateTimeCreated', 'dateTimeUpdated']);

export type Book = z.infer<typeof BookDefinition>;
export type CreateBookInput = z.infer<typeof CreateBookInputDefinition>;
export type UpdateBookDataInput = z.infer<typeof UpdateBookDataInputDefinition>;
export type UpdateBookInput = z.infer<typeof UpdateBookInputDefinition>;
export type BookSortByInput = z.infer<typeof BookSortByInputDefinition>;
export type BookGenre = z.infer<typeof BookGenreDefinition>;
