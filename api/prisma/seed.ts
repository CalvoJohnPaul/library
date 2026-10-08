import {faker} from '@faker-js/faker';
import {BookGenreDefinition} from '@library/types';
import {PrismaPg} from '@prisma/adapter-pg';
import type {Prisma} from './.generated/client';
import {PrismaClient} from './.generated/client';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const SEED_WINDOW_DAYS = 15;

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
		prisma.transaction.deleteMany(),
		prisma.bookCopy.deleteMany(),
		prisma.book.deleteMany(),
		prisma.member.deleteMany(),
	]);

	const now = new Date();
	const seedWindowStart = new Date(now.getTime() - SEED_WINDOW_DAYS * DAY_IN_MS);

	const booksData: Prisma.BookUncheckedCreateInput[] = Array.from({length: 50}, () => {
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

	await prisma.book.createMany({data: booksData});

	const books = await prisma.book.findMany({select: {id: true, dateTimeCreated: true}});

	const bookCopiesData: Prisma.BookCopyUncheckedCreateInput[] = books.flatMap((book) =>
		Array.from({length: faker.number.int({min: 1, max: 6})}, () => {
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

	await prisma.bookCopy.createMany({data: bookCopiesData});

	const membersData: Prisma.MemberUncheckedCreateInput[] = Array.from(
		{length: 20},
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

	await prisma.member.createMany({data: membersData});

	const members = await prisma.member.findMany({select: {id: true}});
	const bookCopies = await prisma.bookCopy.findMany({
		select: {id: true, status: true, dateTimeCreated: true},
	});

	const transactionsData: Prisma.TransactionUncheckedCreateInput[] = bookCopies.flatMap((copy) => {
		const cycleCount = faker.number.int({min: 2, max: 5});
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

			if (isPending) return [borrowed];

			const returnedAt = faker.date.between({from: borrowedAt, to: new Date(segmentEnd)});

			return [
				{...borrowed, dateTimeUpdated: returnedAt},
				{
					...borrowed,
					type: 'RETURN',
					remarks: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
					dateTimeCreated: returnedAt,
					dateTimeUpdated: returnedAt,
				},
			];
		}).flat();
	});

	await prisma.transaction.createMany({data: transactionsData});

	const lastBorrows = await prisma.transaction.groupBy({
		by: ['memberId'],
		where: {type: 'BORROW'},
		_max: {dateTimeCreated: true},
	});

	await prisma.$transaction(
		lastBorrows.map((lastBorrow) =>
			prisma.member.update({
				where: {id: lastBorrow.memberId},
				data: {dateTimeLastBorrowedBook: lastBorrow._max.dateTimeCreated},
			}),
		),
	);

	const lastTransactions = await prisma.transaction.groupBy({
		by: ['bookCopyId'],
		_max: {dateTimeCreated: true},
	});

	await prisma.$transaction(
		lastTransactions.map((lastTransaction) =>
			prisma.bookCopy.update({
				where: {id: lastTransaction.bookCopyId},
				data: {dateTimeUpdated: lastTransaction._max.dateTimeCreated ?? now},
			}),
		),
	);

	console.log(
		`Seeded ${booksData.length} books, ${bookCopiesData.length} copies, ${membersData.length} members, ${transactionsData.length} transactions within the last ${SEED_WINDOW_DAYS} days.`,
	);
}

seed().catch((error) => {
	console.error(error);
	process.exit(1);
});
