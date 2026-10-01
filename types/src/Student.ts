import * as z from 'zod';
import {DateDefinition} from './common.js';

export const StudentDefinition = z.object({
	id: z.number(),
	externalId: z.string(),
	name: z.string(),
	course: z.string(),
	yearAndSection: z.string(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
	dateTimeLastBorrowedBook: DateDefinition.nullable(),
});

export const CreateStudentInputDefinition = z.object({
	externalId: z.string({error: 'External ID is required'}),
	name: z.string({error: 'Name is required'}),
	course: z.string({error: 'Course is required'}),
	yearAndSection: z.string({error: 'Year and section is required'}),
});

export const UpdateStudentDataInputDefinition = z.object({
	name: z.string().optional().nullable(),
	course: z.string().optional().nullable(),
	yearAndSection: z.string().optional().nullable(),
});

export const UpdateStudentInputDefinition = z.object({
	id: z.number(),
	data: UpdateStudentDataInputDefinition,
});

export const StudentSortByInputDefinition = z.enum([
	'dateTimeCreated',
	'dateTimeUpdated',
	'dateTimeLastBorrowedBook',
]);

export type Student = z.infer<typeof StudentDefinition>;
export type CreateStudentInput = z.infer<typeof CreateStudentInputDefinition>;
export type UpdateStudentDataInput = z.infer<typeof UpdateStudentDataInputDefinition>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentInputDefinition>;
export type StudentSortByInput = z.infer<typeof StudentSortByInputDefinition>;
