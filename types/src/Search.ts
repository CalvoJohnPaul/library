import * as z from 'zod';
import {BookDefinition} from './Book.js';
import {MemberDefinition} from './Member.js';
import {ReservationDefinition} from './Reservation.js';
import {TransactionDefinition} from './Transaction.js';

export const SearchResultTypeDefinition = z.enum(['BOOK', 'MEMBER', 'RESERVATION', 'TRANSACTION']);
export const SearchResultDefinition = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('BOOK'),
		data: BookDefinition.pick({
			id: true,
			title: true,
			author: true,
		}),
	}),
	z.object({
		type: z.literal('MEMBER'),
		data: MemberDefinition.pick({
			id: true,
			name: true,
			externalId: true,
		}),
	}),
	z.object({
		type: z.literal('RESERVATION'),
		data: ReservationDefinition.pick({
			id: true,
			ticket: true,
			status: true,
		}),
	}),
	z.object({
		type: z.literal('TRANSACTION'),
		data: TransactionDefinition.pick({
			id: true,
			type: true,
			ticket: true,
			status: true,
		}),
	}),
]);

export type SearchResultType = z.infer<typeof SearchResultTypeDefinition>;
export type SearchResult = z.infer<typeof SearchResultDefinition>;
