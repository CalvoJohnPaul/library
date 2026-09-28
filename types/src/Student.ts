import * as z from 'zod';
import {DateDefinition, IdDefinition} from './common.js';

export const StudentDefinition = z.object({
	id: IdDefinition,
	externalId: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	course: z.string(),
	yearAndSection: z.string(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const CreateStudentInputDefinition = z.object({
	externalId: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	course: z.string(),
	yearAndSection: z.string(),
});

export const UpdateStudentDataInputDefinition = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	course: z.string().optional(),
	yearAndSection: z.string().optional(),
});

export const UpdateStudentInputDefinition = z.object({
	id: IdDefinition,
	data: UpdateStudentDataInputDefinition,
});

export type Student = z.infer<typeof StudentDefinition>;
export type CreateStudentInput = z.infer<typeof CreateStudentInputDefinition>;
export type UpdateStudentDataInput = z.infer<typeof UpdateStudentDataInputDefinition>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentInputDefinition>;
