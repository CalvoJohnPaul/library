import * as z from 'zod';
import {DateDefinition} from './common.js';

export const StudentDefinition = z.object({
	id: z.number(),
	externalId: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	course: z.string(),
	yearAndSection: z.string(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const CreateStudentInputDefinition = z.object({
	externalId: z.string({error: 'External ID is required'}),
	firstName: z.string({error: 'First name is required'}),
	lastName: z.string({error: 'Last name is required'}),
	course: z.string({error: 'Course is required'}),
	yearAndSection: z.string({error: 'Year and section is required'}),
});

export const UpdateStudentDataInputDefinition = z.object({
	firstName: z.string().optional().nullable(),
	lastName: z.string().optional().nullable(),
	course: z.string().optional().nullable(),
	yearAndSection: z.string().optional().nullable(),
});

export const UpdateStudentInputDefinition = z.object({
	id: z.number(),
	data: UpdateStudentDataInputDefinition,
});

export const StudentSortByInputDefinition = z.enum(['dateTimeCreated', 'dateTimeUpdated']);

export type Student = z.infer<typeof StudentDefinition>;
export type CreateStudentInput = z.infer<typeof CreateStudentInputDefinition>;
export type UpdateStudentDataInput = z.infer<typeof UpdateStudentDataInputDefinition>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentInputDefinition>;
export type StudentSortByInput = z.infer<typeof StudentSortByInputDefinition>;
