import * as z from 'zod';
import {BookCopyStatusDefinition} from './BookCopy.js';
import {DateDefinition} from './common.js';

export const ReservationStatusDefinition = z.enum(['PENDING', 'CANCELLED', 'COMPLETED']);
export const ReservationSortByInputDefinition = z.enum(['dateTimeCreated', 'dateTimeUpdated']);

export const ReservationDefinition = z.object({
	id: z.number(),
	book: z.object({
		id: z.number(),
		title: z.string(),
	}),
	bookCopy: z
		.object({id: z.number(), isbn: z.string(), status: BookCopyStatusDefinition})
		.nullable(),
	member: z.object({
		id: z.number(),
		name: z.string(),
		externalId: z.string(),
	}),
	status: ReservationStatusDefinition,
	ticket: z.string(),
	remarks: z.string().optional().nullable(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const CreateReservationInputDefinition = z.object({
	bookId: z.number().int().positive(),
	memberId: z.number().int().positive(),
	remarks: z.string().nullable().optional(),
});

export const UpdateReservationInputDefinition = z.strictObject({
	remarks: z.string().nullable().optional(),
});

export type ReservationStatus = z.infer<typeof ReservationStatusDefinition>;
export type ReservationSortByInput = z.infer<typeof ReservationSortByInputDefinition>;
export type Reservation = z.infer<typeof ReservationDefinition>;
export type CreateReservationInput = z.infer<typeof CreateReservationInputDefinition>;
export type UpdateReservationInput = z.infer<typeof UpdateReservationInputDefinition>;
