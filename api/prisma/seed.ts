import {faker} from '@faker-js/faker';
import {BookGenreDefinition} from '@library/types';
import {PrismaPg} from '@prisma/adapter-pg';
import type {Prisma} from './.generated/client';
import {PrismaClient} from './.generated/client';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const SEED_WINDOW_DAYS = 90;

function generateTicket(date: Date) {
	const segment0 = faker.number.int({min: 0, max: 9999}).toString().padStart(4, '0');
	const segment1 = faker.string.alphanumeric(6).toUpperCase();
	const segment2 =
		(date.getMonth() + 1).toString().padStart(2, '0') +
		date.getDate().toString().padStart(2, '0') +
		date.getFullYear();

	return `${segment0}-${segment1}-${segment2}`;
}

async function seed() {
	faker.seed(20260929);

	await prisma.$transaction([
		prisma.reservation.deleteMany(),
		prisma.transaction.deleteMany(),
		prisma.bookCopy.deleteMany(),
		prisma.book.deleteMany(),
		prisma.member.deleteMany(),
	]);

	const now = new Date();
	const seedWindowStart = new Date(now.getTime() - SEED_WINDOW_DAYS * DAY_IN_MS);

	const booksData: Prisma.BookUncheckedCreateInput[] = Array.from({length: 600}, () => {
		const dateTimeCreated = faker.date.between({from: seedWindowStart, to: now});

		return {
			title: faker.book.title(),
			author: faker.book.author(),
			genre: faker.helpers.arrayElement(BookGenreDefinition.options),
			yearPublished: faker.number.int({min: 1960, max: now.getFullYear()}),
			dateTimeCreated,
			dateTimeUpdated: dateTimeCreated,
		};
	});

	for (let index = 0; index < booksData.length; index += 500) {
		await prisma.book.createMany({data: booksData.slice(index, index + 500)});
	}

	const books = await prisma.book.findMany({select: {id: true, dateTimeCreated: true}});

	const bookCopiesData: Prisma.BookCopyUncheckedCreateInput[] = books.flatMap((book) =>
		Array.from({length: faker.number.int({min: 2, max: 4})}, () => {
			const dateTimeCreated = faker.date.between({from: book.dateTimeCreated, to: now});

			return {
				bookId: book.id,
				isbn: faker.commerce.isbn(),
				status: faker.datatype.boolean(0.25) ? 'BORROWED' : 'AVAILABLE',
				dateTimeCreated,
				dateTimeUpdated: dateTimeCreated,
			};
		}),
	);

	for (let index = 0; index < bookCopiesData.length; index += 500) {
		await prisma.bookCopy.createMany({data: bookCopiesData.slice(index, index + 500)});
	}

	const membersData: Prisma.MemberUncheckedCreateInput[] = Array.from(
		{length: 750},
		(_, index) => ({
			externalId: `${faker.string.alphanumeric(6)}-${index}`,
			name: faker.person.fullName(),
			course: faker.helpers.arrayElement(['BSTM', 'BSIS', 'BSEE']),
			yearAndSection: faker.helpers.arrayElement([
				'1-A',
				'1-B',
				'2-A',
				'2-B',
				'3-A',
				'3-B',
				'4-A',
				'4-B',
			]),
		}),
	);

	for (let index = 0; index < membersData.length; index += 500) {
		await prisma.member.createMany({data: membersData.slice(index, index + 500)});
	}

	const members = await prisma.member.findMany({select: {id: true}});
	const bookCopies = await prisma.bookCopy.findMany({
		select: {id: true, bookId: true, status: true, dateTimeCreated: true},
	});
	const claimedCopyIds = new Set(
		bookCopies
			.filter((copy) => copy.status === 'BORROWED')
			.slice(0, 100)
			.map((copy) => copy.id),
	);
	const claimedTickets = new Map<number, string>();

	const transactionsData: Prisma.TransactionUncheckedCreateInput[] = bookCopies.flatMap((copy) => {
		const cycleCount = faker.number.int({min: 2, max: 3});
		const windowStart = copy.dateTimeCreated.getTime();
		const windowEnd = now.getTime();
		const segmentLength = Math.max((windowEnd - windowStart) / cycleCount, 1);

		return Array.from({length: cycleCount}, (_, index) => {
			const segmentStart = Math.min(Math.floor(windowStart + segmentLength * index), windowEnd);
			const segmentEnd = Math.min(Math.floor(segmentStart + segmentLength), windowEnd);
			const isPending = index === cycleCount - 1 && copy.status === 'BORROWED';

			const borrowedAt = faker.date.between({
				from: new Date(segmentStart),
				to: new Date(segmentEnd),
			});

			const borrowed: Prisma.TransactionUncheckedCreateInput = {
				type: 'BORROW',
				status: isPending ? 'PENDING' : 'COMPLETED',
				ticket: generateTicket(borrowedAt),
				remarks: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
				bookCopyId: copy.id,
				memberId: faker.helpers.arrayElement(members).id,
				dateTimeCreated: borrowedAt,
				dateTimeUpdated: borrowedAt,
			};
			if (isPending && claimedCopyIds.has(copy.id)) claimedTickets.set(copy.id, borrowed.ticket);

			if (isPending) return [borrowed];

			const returnedAt = faker.date.between({from: borrowedAt, to: new Date(segmentEnd)});

			return [
				{...borrowed, dateTimeUpdated: returnedAt},
				{
					...borrowed,
					type: 'RETURN' as const,
					remarks: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
					dateTimeCreated: returnedAt,
					dateTimeUpdated: returnedAt,
				},
			];
		}).flat();
	});

	for (let index = 0; index < transactionsData.length; index += 500) {
		await prisma.transaction.createMany({data: transactionsData.slice(index, index + 500)});
	}

	const lastBorrows = await prisma.transaction.groupBy({
		by: ['memberId'],
		where: {type: 'BORROW'},
		_max: {dateTimeCreated: true},
	});

	for (let index = 0; index < lastBorrows.length; index += 100) {
		await prisma.$transaction(
			lastBorrows.slice(index, index + 100).map((lastBorrow) =>
				prisma.member.update({
					where: {id: lastBorrow.memberId},
					data: {dateTimeLastBorrowedBook: lastBorrow._max.dateTimeCreated},
				}),
			),
		);
	}

	const lastTransactions = await prisma.transaction.groupBy({
		by: ['bookCopyId'],
		_max: {dateTimeCreated: true},
	});

	for (let index = 0; index < lastTransactions.length; index += 100) {
		await prisma.$transaction(
			lastTransactions.slice(index, index + 100).flatMap((lastTransaction) =>
				lastTransaction.bookCopyId == null
					? []
					: [
							prisma.bookCopy.update({
								where: {id: lastTransaction.bookCopyId},
								data: {dateTimeUpdated: lastTransaction._max.dateTimeCreated ?? now},
							}),
						],
			),
		);
	}

	const reservationsData: Prisma.ReservationUncheckedCreateInput[] = [];
	const reservationTransactions: Prisma.TransactionUncheckedCreateInput[] = [];
	const reservedCopyIds: number[] = [];

	for (const copy of bookCopies.filter((copy) => claimedCopyIds.has(copy.id))) {
		const borrow = transactionsData.find(
			(transaction) =>
				transaction.bookCopyId === copy.id &&
				transaction.type === 'BORROW' &&
				transaction.status === 'PENDING',
		);
		if (!borrow || !(borrow.dateTimeCreated instanceof Date) || !borrow.memberId) continue;
		const reservedAt = new Date(
			Math.max(copy.dateTimeCreated.getTime(), borrow.dateTimeCreated.getTime() - 1),
		);
		const ticket = claimedTickets.get(copy.id);
		if (!ticket) continue;
		reservationsData.push({
			bookId: copy.bookId,
			bookCopyId: copy.id,
			memberId: borrow.memberId,
			status: 'COMPLETED',
			ticket,
			dateTimeCreated: reservedAt,
			dateTimeUpdated: borrow.dateTimeCreated,
		});
		reservationTransactions.push({
			type: 'RESERVE',
			status: 'COMPLETED',
			ticket,
			bookId: copy.bookId,
			memberId: borrow.memberId,
			dateTimeCreated: reservedAt,
			dateTimeUpdated: borrow.dateTimeCreated,
		});
	}

	for (const book of books
		.filter((book) => book.dateTimeCreated.getTime() < now.getTime() - DAY_IN_MS)
		.slice(0, 100)) {
		const memberId = faker.helpers.arrayElement(members).id;
		const reservedAt = faker.date.between({
			from: book.dateTimeCreated,
			to: new Date(now.getTime() - DAY_IN_MS),
		});
		const cancelledAt = new Date(reservedAt.getTime() + 60 * 60 * 1000);
		const ticket = generateTicket(reservedAt);
		reservationsData.push({
			bookId: book.id,
			memberId,
			status: 'CANCELLED',
			ticket,
			dateTimeCreated: reservedAt,
			dateTimeUpdated: cancelledAt,
		});
		reservationTransactions.push(
			{
				type: 'RESERVE',
				status: 'COMPLETED',
				ticket,
				bookId: book.id,
				memberId,
				dateTimeCreated: reservedAt,
				dateTimeUpdated: cancelledAt,
			},
			{
				type: 'UNRESERVE',
				status: 'COMPLETED',
				ticket,
				bookId: book.id,
				memberId,
				dateTimeCreated: cancelledAt,
				dateTimeUpdated: cancelledAt,
			},
		);
	}

	const availableCopies = bookCopies.filter((copy) => copy.status === 'AVAILABLE');
	const pendingBookIds = new Set<number>();
	for (const copy of availableCopies) {
		if (pendingBookIds.size === 100) break;
		if (pendingBookIds.has(copy.bookId)) continue;
		pendingBookIds.add(copy.bookId);
		reservedCopyIds.push(copy.id);
		const memberId = faker.helpers.arrayElement(members).id;
		const lastTransactionAt = lastTransactions.find(
			(transaction) => transaction.bookCopyId === copy.id,
		)?._max.dateTimeCreated;
		const reservedAt = new Date(
			Math.max(
				copy.dateTimeCreated.getTime(),
				lastTransactionAt?.getTime() ?? 0,
				now.getTime() - 30 * 1000,
			),
		);
		const ticket = generateTicket(reservedAt);
		reservationsData.push({
			bookId: copy.bookId,
			bookCopyId: copy.id,
			memberId,
			status: 'PENDING',
			ticket,
			dateTimeCreated: reservedAt,
			dateTimeUpdated: reservedAt,
		});
		reservationTransactions.push({
			type: 'RESERVE',
			status: 'PENDING',
			ticket,
			bookId: copy.bookId,
			memberId,
			dateTimeCreated: reservedAt,
			dateTimeUpdated: reservedAt,
		});
	}

	for (let index = 0; index < reservationsData.length; index += 500) {
		await prisma.reservation.createMany({data: reservationsData.slice(index, index + 500)});
	}
	const reservations = await prisma.reservation.findMany({select: {id: true, ticket: true}});
	const reservationIds = new Map(reservations.map(({id, ticket}) => [ticket, id]));
	for (let index = 0; index < reservationTransactions.length; index += 500) {
		await prisma.transaction.createMany({
			data: reservationTransactions.slice(index, index + 500).map((transaction) => ({
				...transaction,
				reservationId: reservationIds.get(transaction.ticket),
			})),
		});
	}
	for (const ticket of claimedTickets.values()) {
		await prisma.transaction.updateMany({
			where: {ticket, type: 'BORROW'},
			data: {reservationId: reservationIds.get(ticket)},
		});
	}
	await prisma.bookCopy.updateMany({
		where: {id: {in: reservedCopyIds}},
		data: {status: 'RESERVED'},
	});

	console.log(
		`Seeded ${booksData.length} books, ${bookCopiesData.length} copies, ${membersData.length} members, ${reservationsData.length} reservations, ${transactionsData.length + reservationTransactions.length} transactions within the last ${SEED_WINDOW_DAYS} days.`,
	);
}

seed().catch((error) => {
	console.error(error);
	process.exit(1);
});
