import * as z from 'zod';
import {DateDefinition} from './common.js';

export const MemberDefinition = z.object({
	id: z.number(),
	externalId: z.string(),
	name: z.string(),
	course: z.string().nullable(),
	yearAndSection: z.string().nullable(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
	dateTimeLastBorrowedBook: DateDefinition.nullable(),
});

export const CreateMemberInputDefinition = z.object({
	externalId: z
		.string({error: 'External ID is required'})
		.trim()
		.min(1, {error: 'External ID is required'}),
	name: z.string({error: 'Name is required'}).trim().min(1, {error: 'Name is required'}),
	course: z.string().optional().nullable(),
	yearAndSection: z.string().optional().nullable(),
});

export const UpdateMemberDataInputDefinition = z.object({
	externalId: z.string().optional().nullable(),
	name: z.string().optional().nullable(),
	course: z.string().optional().nullable(),
	yearAndSection: z.string().optional().nullable(),
});

export const UpdateMemberInputDefinition = z.object({
	id: z.number(),
	data: UpdateMemberDataInputDefinition,
});

export const MemberSortByInputDefinition = z.enum([
	'dateTimeCreated',
	'dateTimeUpdated',
	'dateTimeLastBorrowedBook',
]);

export type Member = z.infer<typeof MemberDefinition>;
export type CreateMemberInput = z.infer<typeof CreateMemberInputDefinition>;
export type UpdateMemberDataInput = z.infer<typeof UpdateMemberDataInputDefinition>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberInputDefinition>;
export type MemberSortByInput = z.infer<typeof MemberSortByInputDefinition>;
