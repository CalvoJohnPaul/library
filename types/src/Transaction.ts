import * as z from 'zod';
import {DateDefinition, IdDefinition} from './common.js';

export const TransactionTypeDefinition = z.enum(['BORROW', 'RETURN']);
export const TransactionDefinition = z.object({
	id: IdDefinition,
	type: TransactionTypeDefinition,
	accountId: IdDefinition,
	bookCopyId: IdDefinition,
	dateTimeCreated: DateDefinition,
	dateTimeUpdated: DateDefinition,
});

export type TransactionType = z.infer<typeof TransactionTypeDefinition>;
export type Transaction = z.infer<typeof TransactionDefinition>;
