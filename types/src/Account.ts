import * as z from 'zod';

export const AdminAccountDefinition = z.object({
	id: z.string(),
	type: z.literal('ADMIN'),
	name: z.string(),
	username: z.string(),
	dateTimeCreated: z.string(),
	dateTimeUpdated: z.string(),
});

export const StudentAccountDefinition = z.object({
	id: z.string(),
	type: z.literal('STUDENT'),
	name: z.string(),
	studentId: z.string(),
	course: z.string(),
	yearAndSection: z.string(),
	dateTimeCreated: z.string(),
	dateTimeUpdated: z.string(),
});

export const AccountTypeDefinition = z.enum(['ADMIN', 'STUDENT']);
export const AccountDefinition = z.union([AdminAccountDefinition, StudentAccountDefinition]);

export type AdminAccount = z.infer<typeof AdminAccountDefinition>;
export type StudentAccount = z.infer<typeof StudentAccountDefinition>;
export type AccountType = z.infer<typeof AccountTypeDefinition>;
export type Account = z.infer<typeof AccountDefinition>;
