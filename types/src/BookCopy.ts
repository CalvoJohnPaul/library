import * as z from 'zod';
import {BookDefinition} from './Book.js';
import {DateDefinition} from './common.js';

export const BookCopyStatusDefinition = z.enum(['AVAILABLE', 'BORROWED']);
export const BookCopyDefinition = z.object({
	id: z.number(),
	isbn: z.string(),
	book: BookDefinition.pick({
		id: true,
		title: true,
		genre: true,
		author: true,
		yearPublished: true,
	}),
	status: BookCopyStatusDefinition,
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const CreateBookCopyInputDefinition = z.object({
	isbn: z.string({error: 'ISBN is required'}),
	bookId: z.number({error: 'Book ID is required'}),
});

export const UpdateBookCopyDataInputDefinition = z.object({
	isbn: z.string().optional().nullable(),
	bookId: z.number().optional().nullable(),
});

export const UpdateBookCopyInputDefinition = z.object({
	id: z.number(),
	data: UpdateBookCopyDataInputDefinition,
});

export const BorrowBookCopyDataInputDefinition = z.object({
	studentId: z.number({error: 'Student ID is required'}),
	remarks: z.string({error: 'Remarks is required'}).optional().nullable(),
});

export const BorrowBookCopyInputDefinition = z.object({
	id: z.number(),
	data: BorrowBookCopyDataInputDefinition,
});

export const ReturnBookCopyDataInputDefinition = z.object({
	remarks: z.string({error: 'Remarks is required'}).optional().nullable(),
});

export const ReturnBookCopyInputDefinition = z.object({
	id: z.number(),
	data: ReturnBookCopyDataInputDefinition,
});

export const BookCopySortByInputDefinition = z.enum(['dateTimeCreated', 'dateTimeUpdated']);

export type BookCopy = z.infer<typeof BookCopyDefinition>;
export type BookCopyStatus = z.infer<typeof BookCopyStatusDefinition>;
export type CreateBookCopyInput = z.infer<typeof CreateBookCopyInputDefinition>;
export type UpdateBookCopyDataInput = z.infer<typeof UpdateBookCopyDataInputDefinition>;
export type UpdateBookCopyInput = z.infer<typeof UpdateBookCopyInputDefinition>;
export type BorrowBookCopyDataInput = z.infer<typeof BorrowBookCopyDataInputDefinition>;
export type BorrowBookCopyInput = z.infer<typeof BorrowBookCopyInputDefinition>;
export type ReturnBookCopyDataInput = z.infer<typeof ReturnBookCopyDataInputDefinition>;
export type ReturnBookCopyInput = z.infer<typeof ReturnBookCopyInputDefinition>;
export type BookCopySortByInput = z.infer<typeof BookCopySortByInputDefinition>;
