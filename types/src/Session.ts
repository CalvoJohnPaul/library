import * as z from 'zod';

export type CreateSessionInput = z.infer<typeof CreateSessionInputDefinition>;
export const CreateSessionInputDefinition = z.object({
	email: z.email(),
	password: z.string().trim().min(1, 'Password is required'),
});
