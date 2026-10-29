import {faker} from '@faker-js/faker';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {unreserveBookJob} from '../../src/jobs/unreserveBook.js';

const mock = vi.hoisted(() => {
	const reservation = {
		findMany: vi.fn(async () => [] as {id: number}[]),
		updateMany: vi.fn(async () => ({count: 1})),
		update: vi.fn(async () => ({})),
		findUniqueOrThrow: vi.fn(async () => ({
			ticket: '',
			bookId: 0,
			memberId: 0,
			bookCopyId: null as number | null,
			remarks: null as string | null,
		})),
	};
	const transaction = {
		update: vi.fn(async () => ({})),
		create: vi.fn(async () => ({})),
	};
	const bookCopy = {updateMany: vi.fn(async () => ({count: 1}))};
	return {
		reservation,
		transaction,
		bookCopy,
		$transaction: vi.fn(
			async (
				callback: (tx: {
					reservation: typeof reservation;
					transaction: typeof transaction;
					bookCopy: typeof bookCopy;
				}) => Promise<void>,
			) => callback({reservation, transaction, bookCopy}),
		),
	};
});

vi.mock('../../src/config/prisma.js', () => ({prisma: mock}));

beforeEach(() => {
	vi.useFakeTimers({toFake: ['Date']});
	vi.clearAllMocks();
	mock.reservation.findMany.mockResolvedValue([]);
	mock.reservation.updateMany.mockResolvedValue({count: 1});
	mock.bookCopy.updateMany.mockResolvedValue({count: 1});
	mock.reservation.findUniqueOrThrow.mockResolvedValue({
		ticket: '',
		bookId: 0,
		memberId: 0,
		bookCopyId: null,
		remarks: null,
	});
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

test('logs when the unreserve job starts and completes with no reservations', async () => {
	const log = vi.spyOn(console, 'log').mockImplementation(() => {});
	await unreserveBookJob.executeAsync();

	expect(log.mock.calls).toEqual([
		[`job 'unreserveBook' started`],
		[`job 'unreserveBook' completed`],
	]);
});

test('unreserves pending reservations older than three days with the original ticket', async () => {
	vi.stubEnv('NODE_ENV', 'production');
	const now = new Date('2026-10-28T12:00:00.000Z');
	vi.setSystemTime(now);
	const id = faker.number.int({min: 1});
	const bookId = faker.number.int({min: 1});
	const memberId = faker.number.int({min: 1});
	const ticket = faker.string.uuid();
	mock.reservation.findMany.mockResolvedValue([{id}]);
	mock.reservation.findUniqueOrThrow.mockResolvedValue({
		ticket,
		bookId,
		memberId,
		bookCopyId: null,
		remarks: 'Please keep me updated',
	});

	await unreserveBookJob.executeAsync();

	expect(mock.reservation.findMany).toHaveBeenCalledWith({
		where: {status: 'PENDING', dateTimeCreated: {lt: new Date('2026-10-25T12:00:00.000Z')}},
		select: {id: true},
	});
	expect(mock.reservation.updateMany).toHaveBeenCalledWith({
		where: {id, status: 'PENDING'},
		data: {status: 'CANCELLED'},
	});
	expect(mock.reservation.update).toHaveBeenCalledWith({
		where: {id},
		data: {
			remarks: 'Please keep me updated; Cancelled by the system: reservation expired after 3 days.',
		},
	});
	expect(mock.transaction.update).toHaveBeenCalledWith({
		where: {ticket_type: {ticket, type: 'RESERVE'}},
		data: {status: 'COMPLETED'},
	});
	expect(mock.transaction.create).toHaveBeenCalledWith({
		data: {
			type: 'UNRESERVE',
			status: 'COMPLETED',
			ticket,
			bookId,
			memberId,
			reservationId: id,
			remarks: 'Cancelled by the system: reservation expired after 3 days.',
		},
	});
});

test('expires pending reservations after ten minutes in development', async () => {
	vi.stubEnv('NODE_ENV', 'development');
	vi.setSystemTime(new Date('2026-10-28T12:00:00.000Z'));
	mock.reservation.findMany.mockResolvedValue([{id: 1}]);
	await unreserveBookJob.executeAsync();
	expect(mock.reservation.findMany).toHaveBeenCalledWith({
		where: {
			status: 'PENDING',
			dateTimeCreated: {lt: new Date('2026-10-28T11:50:00.000Z')},
		},
		select: {id: true},
	});
	expect(mock.reservation.update).toHaveBeenCalledWith({
		where: {id: 1},
		data: {remarks: 'Cancelled by the system: reservation expired after 5 minutes.'},
	});
	expect(mock.transaction.create).toHaveBeenCalledWith({
		data: {
			type: 'UNRESERVE',
			status: 'COMPLETED',
			ticket: '',
			bookId: 0,
			memberId: 0,
			reservationId: 1,
			remarks: 'Cancelled by the system: reservation expired after 5 minutes.',
		},
	});
});

test('skips a reservation already unreserved by another request', async () => {
	mock.reservation.findMany.mockResolvedValue([{id: faker.number.int({min: 1})}]);
	mock.reservation.updateMany.mockResolvedValue({count: 0});

	await unreserveBookJob.executeAsync();

	expect(mock.transaction.update).not.toHaveBeenCalled();
	expect(mock.reservation.update).not.toHaveBeenCalled();
	expect(mock.transaction.create).not.toHaveBeenCalled();
	expect(mock.bookCopy.updateMany).not.toHaveBeenCalled();
});

test('releases an assigned reserved copy on expiration', async () => {
	mock.reservation.findMany.mockResolvedValue([{id: 1}]);
	mock.reservation.findUniqueOrThrow.mockResolvedValue({
		ticket: 'ticket',
		bookId: 2,
		memberId: 3,
		bookCopyId: 4,
		remarks: null,
	});
	await unreserveBookJob.executeAsync();
	expect(mock.bookCopy.updateMany).toHaveBeenCalledWith({
		where: {id: 4, status: 'RESERVED'},
		data: {status: 'AVAILABLE'},
	});
});

test('does nothing when no reservations have expired', async () => {
	await unreserveBookJob.executeAsync();
	expect(mock.$transaction).not.toHaveBeenCalled();
});

test('continues after a failed copy release without recording an UNRESERVE for it', async () => {
	const error = vi.spyOn(console, 'error').mockImplementation(() => {});
	mock.reservation.findMany.mockResolvedValue([{id: 1}, {id: 2}]);
	mock.reservation.findUniqueOrThrow
		.mockResolvedValueOnce({ticket: 'first', bookId: 3, memberId: 4, bookCopyId: 5, remarks: null})
		.mockResolvedValueOnce({
			ticket: 'second',
			bookId: 6,
			memberId: 7,
			bookCopyId: null,
			remarks: null,
		});
	mock.bookCopy.updateMany.mockResolvedValueOnce({count: 0});
	await unreserveBookJob.executeAsync();
	expect(mock.reservation.updateMany).toHaveBeenCalledTimes(2);
	expect(mock.transaction.create).toHaveBeenCalledTimes(1);
	expect(mock.transaction.create).toHaveBeenCalledWith({
		data: {
			type: 'UNRESERVE',
			status: 'COMPLETED',
			ticket: 'second',
			bookId: 6,
			memberId: 7,
			reservationId: 2,
			remarks: 'Cancelled by the system: reservation expired after 3 days.',
		},
	});
	expect(error).toHaveBeenCalledWith('Failed to unreserve reservation 1', expect.any(Error));
});
