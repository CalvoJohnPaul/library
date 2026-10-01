import * as z from 'zod';
import {DateDefinition} from './common.js';

export const AccountDefinition = z.object({
	id: z.number(),
	name: z.string(),
	email: z.string(),
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export const CreateAccountInputDefinition = z.object({
	name: z.string(),
	email: z.string(),
	password: z.string(),
});

export const UpdateAccountInputDefinition = z
	.object({
		name: z.string().optional(),
		email: z.string().optional(),
		newPassword: z.string().optional(),
		oldPassword: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.newPassword && !data.oldPassword) {
			ctx.addIssue({
				code: 'custom',
				message: 'Old password is required when setting a new password',
			});
		}
	});

export type Account = z.infer<typeof AccountDefinition>;
export type CreateAccountInput = z.infer<typeof CreateAccountInputDefinition>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountInputDefinition>;
