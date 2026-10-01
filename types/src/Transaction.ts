import * as z from 'zod';
import {BookCopyDefinition} from './BookCopy.js';
import {DateDefinition, IdDefinition} from './common.js';
import {StudentDefinition} from './Student.js';

export const TransactionTypeDefinition = z.enum(['BORROW', 'RETURN']);
export const TransactionStatusDefinition = z.enum(['PENDING', 'COMPLETED']);
export const TransactionDefinition = z.object({
	id: IdDefinition,
	type: TransactionTypeDefinition,
	status: TransactionStatusDefinition,
	ticket: z.string(),
	remarks: z.string().optional().nullable(),
	student: StudentDefinition.pick({
		id: true,
		externalId: true,
		firstName: true,
		lastName: true,
		course: true,
		yearAndSection: true,
	}),
	bookCopy: BookCopyDefinition.pick({
		id: true,
		book: true,
		isbn: true,
		status: true,
	}),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const TransactionSortByInputDefinition = z.enum(['dateTimeCreated', 'dateTimeUpdated']);

export type TransactionType = z.infer<typeof TransactionTypeDefinition>;
export type TransactionStatus = z.infer<typeof TransactionStatusDefinition>;
export type Transaction = z.infer<typeof TransactionDefinition>;
export type TransactionSortByInput = z.infer<typeof TransactionSortByInputDefinition>;
