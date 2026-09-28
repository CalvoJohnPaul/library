import * as z from 'zod';
import {DateDefinition, IdDefinition} from './common.js';

export const AdminAccountDefinition = z.object({
	id: IdDefinition,
	type: z.literal('ADMIN'),
	name: z.string(),
	username: z.string(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const StudentAccountDefinition = z.object({
	id: IdDefinition,
	type: z.literal('STUDENT'),
	name: z.string(),
	studentId: z.string(),
	course: z.string(),
	yearAndSection: z.string(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const CreateStudentAccountInputDefinition = z.object({
	name: z.string(),
	studentId: z.string(),
	course: z.string(),
	yearAndSection: z.string(),
});

export const AccountTypeDefinition = z.enum(['ADMIN', 'STUDENT']);
export const AccountDefinition = z.union([AdminAccountDefinition, StudentAccountDefinition]);

export type AdminAccount = z.infer<typeof AdminAccountDefinition>;
export type StudentAccount = z.infer<typeof StudentAccountDefinition>;
export type CreateStudentAccountInput = z.infer<typeof CreateStudentAccountInputDefinition>;
export type AccountType = z.infer<typeof AccountTypeDefinition>;
export type Account = z.infer<typeof AccountDefinition>;
