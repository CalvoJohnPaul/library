import * as z from 'zod';

export type Csrf = z.infer<typeof CsrfDefinition>;
export const CsrfDefinition = z.object({
	token: z.string(),
});
