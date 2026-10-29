import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {reserveBookJob} from '../../src/jobs/reserveBook.js';

const mock = vi.hoisted(() => {
	const reservation = {
		findMany: vi.fn(async () => [] as {id: number; bookId: number}[]),
		updateMany: vi.fn(async () => ({count: 1})),
	};
	const bookCopy = {
		findFirst: vi.fn(async () => null as {id: number} | null),
		updateMany: vi.fn(async () => ({count: 1})),
	};
	return {
		reservation,
		bookCopy,
		$transaction: vi.fn(
			async (
				callback: (tx: {
					reservation: typeof reservation;
					bookCopy: typeof bookCopy;
				}) => Promise<void>,
			) => callback({reservation, bookCopy}),
		),
	};
});

vi.mock('../../src/config/prisma.js', () => ({prisma: mock}));

beforeEach(() => {
	vi.clearAllMocks();
	mock.reservation.findMany.mockResolvedValue([]);
	mock.bookCopy.findFirst.mockResolvedValue(null);
	mock.reservation.updateMany.mockResolvedValue({count: 1});
	mock.bookCopy.updateMany.mockResolvedValue({count: 1});
});

afterEach(() => {
	vi.restoreAllMocks();
});

test('logs when the reserve job starts and completes with no reservations', async () => {
	const log = vi.spyOn(console, 'log').mockImplementation(() => {});
	await reserveBookJob.executeAsync();
	expect(log.mock.calls).toEqual([[`job 'reserveBook' started`], [`job 'reserveBook' completed`]]);
});

test('assigns an available copy to a pending reservation', async () => {
	mock.reservation.findMany.mockResolvedValue([{id: 1, bookId: 2}]);
	mock.bookCopy.findFirst.mockResolvedValue({id: 3});
	await reserveBookJob.executeAsync();
	expect(mock.reservation.findMany).toHaveBeenCalledWith({
		where: {status: 'PENDING', bookCopyId: null},
		select: {id: true, bookId: true},
		orderBy: {dateTimeCreated: 'asc'},
	});
	expect(mock.bookCopy.findFirst).toHaveBeenCalledWith({
		where: {bookId: 2, status: 'AVAILABLE'},
		select: {id: true},
	});
	expect(mock.reservation.updateMany).toHaveBeenCalledWith({
		where: {id: 1, status: 'PENDING', bookCopyId: null},
		data: {bookCopyId: 3},
	});
	expect(mock.bookCopy.updateMany).toHaveBeenCalledWith({
		where: {id: 3, bookId: 2, status: 'AVAILABLE'},
		data: {status: 'RESERVED'},
	});
});

test('skips reservations without an available copy', async () => {
	mock.reservation.findMany.mockResolvedValue([{id: 1, bookId: 2}]);
	await reserveBookJob.executeAsync();
	expect(mock.$transaction).not.toHaveBeenCalled();
});

test('does not change a copy if the reservation has already changed', async () => {
	mock.reservation.findMany.mockResolvedValue([{id: 1, bookId: 2}]);
	mock.bookCopy.findFirst.mockResolvedValue({id: 3});
	mock.reservation.updateMany.mockResolvedValue({count: 0});
	await reserveBookJob.executeAsync();
	expect(mock.bookCopy.updateMany).not.toHaveBeenCalled();
});

test('continues to the next reservation after a copy becomes unavailable', async () => {
	const error = vi.spyOn(console, 'error').mockImplementation(() => {});
	mock.reservation.findMany.mockResolvedValue([
		{id: 1, bookId: 2},
		{id: 3, bookId: 4},
	]);
	mock.bookCopy.findFirst.mockResolvedValueOnce({id: 5}).mockResolvedValueOnce({id: 6});
	mock.bookCopy.updateMany.mockResolvedValueOnce({count: 0}).mockResolvedValueOnce({count: 1});
	await reserveBookJob.executeAsync();
	expect(mock.reservation.updateMany).toHaveBeenCalledTimes(2);
	expect(mock.reservation.updateMany).toHaveBeenLastCalledWith({
		where: {id: 3, status: 'PENDING', bookCopyId: null},
		data: {bookCopyId: 6},
	});
	expect(error).toHaveBeenCalledWith('Failed to assign a copy to reservation 1', expect.any(Error));
});
