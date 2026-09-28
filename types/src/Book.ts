import * as z from 'zod';
import {DateDefinition, IdDefinition} from './common.js';

export const BookDefinition = z.object({
	id: IdDefinition,
	title: z.string(),
	author: z.string(),
	genre: z.string(),
	yearPublished: z.number().positive(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
	totalCopies: z.number(),
	available: z.boolean(),
});

export const CreateBookInputDefinition = z.object({
	title: z.string(),
	author: z.string(),
	genre: z.string(),
	yearPublished: z.number().positive(),
});

export const UpdateBookDataInputDefinition = z.object({
	title: z.string().optional(),
	author: z.string().optional(),
	genre: z.string().optional(),
	yearPublished: z.number().positive().optional(),
});

export const UpdateBookInputDefinition = z.object({
	id: IdDefinition,
	data: UpdateBookDataInputDefinition,
});

export type Book = z.infer<typeof BookDefinition>;
export type CreateBookInput = z.infer<typeof CreateBookInputDefinition>;
export type UpdateBookDataInput = z.infer<typeof UpdateBookDataInputDefinition>;
export type UpdateBookInput = z.infer<typeof UpdateBookInputDefinition>;
