import * as z from 'zod';
import {BookDefinition} from './Book.js';
import {DateDefinition, IdDefinition} from './common.js';

export const BookStatusDefinition = z.enum(['AVAILABLE', 'BORROWED']);
export const BookCopyDefinition = z.object({
	id: IdDefinition,
	isbn: z.string(),
	book: BookDefinition.pick({
		id: true,
		title: true,
		genre: true,
		author: true,
		yearPublished: true,
	}),
	status: BookStatusDefinition,
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const CreateBookCopyInputDefinition = z.object({
	isbn: z.string(),
	bookId: IdDefinition,
});

export const UpdateBookCopyDataInputDefinition = z.object({
	isbn: z.string().optional(),
	bookId: IdDefinition.optional(),
	status: BookStatusDefinition.optional(),
});

export const UpdateBookCopyInputDefinition = z.object({
	id: IdDefinition,
	data: UpdateBookCopyDataInputDefinition,
});

export type BookStatus = z.infer<typeof BookStatusDefinition>;
export type BookCopy = z.infer<typeof BookCopyDefinition>;
export type CreateBookCopyInput = z.infer<typeof CreateBookCopyInputDefinition>;
export type UpdateBookCopyDataInput = z.infer<typeof UpdateBookCopyDataInputDefinition>;
export type UpdateBookCopyInput = z.infer<typeof UpdateBookCopyInputDefinition>;
