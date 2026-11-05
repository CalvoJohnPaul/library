import * as z from 'zod';
import {BookDefinition} from './Book.js';
import {BookCopyDefinition} from './BookCopy.js';
import {DateDefinition} from './common.js';
import {MemberDefinition} from './Member.js';
import {ReservationStatusDefinition} from './Reservation.js';

export const TransactionTypeDefinition = z.enum(['BORROW', 'RESERVE', 'UNRESERVE', 'RETURN']);
export const TransactionStatusDefinition = z.enum(['PENDING', 'COMPLETED']);
export const TransactionDefinition = z.object({
	id: z.number(),
	type: TransactionTypeDefinition,
	status: TransactionStatusDefinition,
	ticket: z.string(),
	remarks: z.string().optional().nullable(),
	member: MemberDefinition.pick({
		id: true,
		externalId: true,
		name: true,
		course: true,
		yearAndSection: true,
	}),
	book: BookDefinition.pick({
		id: true,
		title: true,
		author: true,
		genre: true,
		yearPublished: true,
	}).nullable(),
	bookCopy: BookCopyDefinition.pick({
		id: true,
		book: true,
		isbn: true,
		status: true,
	}).nullable(),
	reservation: z
		.object({
			id: z.number(),
			status: ReservationStatusDefinition,
		})
		.nullable(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const TransactionSortByInputDefinition = z.enum(['dateTimeCreated', 'dateTimeUpdated']);

export type TransactionType = z.infer<typeof TransactionTypeDefinition>;
export type TransactionStatus = z.infer<typeof TransactionStatusDefinition>;
export type Transaction = z.infer<typeof TransactionDefinition>;
export type TransactionSortByInput = z.infer<typeof TransactionSortByInputDefinition>;
