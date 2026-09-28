import * as z from 'zod';
import {DateDefinition, IdDefinition} from './common.js';

export const StudentDefinition = z.object({
	id: IdDefinition,
	studentId: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	course: z.string(),
	yearAndSection: z.string(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const CreateStudentAccountInputDefinition = z.object({
	studentId: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	course: z.string(),
	yearAndSection: z.string(),
});

export type Student = z.infer<typeof StudentDefinition>;
export type CreateStudentAccountInput = z.infer<typeof CreateStudentAccountInputDefinition>;
