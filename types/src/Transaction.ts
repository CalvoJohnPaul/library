import * as z from 'zod';

export const TransactionTypeDefinition = z.enum(['BORROW', 'RETURN']);
export const TransactionDefinition = z.object({
	id: z.string(),
	type: TransactionTypeDefinition,
	accountId: z.string(),
	bookCopyId: z.string(),
	dateTimeCreated: z.string(),
	dateTimeUpdated: z.string(),
});

export type TransactionType = z.infer<typeof TransactionTypeDefinition>;
export type Transaction = z.infer<typeof TransactionDefinition>;
