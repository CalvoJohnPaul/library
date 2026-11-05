import {createHash, randomBytes} from 'node:crypto';
import type {Account} from '../../prisma/.generated/client';
import type {prisma} from '../config/prisma';

export function sessionId(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(
	tx: Pick<typeof prisma, 'session'>,
	account: Pick<Account, 'id' | 'sessionVersion'>,
): Promise<string> {
	const token = randomBytes(32).toString('hex');
	await tx.session.create({
		data: {
			id: sessionId(token),
			accountId: account.id,
			accountVersion: account.sessionVersion,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		},
	});
	return token;
}
