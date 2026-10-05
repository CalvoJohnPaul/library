import {faker} from '@faker-js/faker';
import {BookGenreDefinition} from '@library/types';
import {PrismaPg} from '@prisma/adapter-pg';
import type {Prisma} from './.generated/client';
import {PrismaClient} from './.generated/client';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

async function seed() {
	faker.seed(20260929);

	await prisma.$transaction([
		prisma.transaction.deleteMany(),
		prisma.bookCopy.deleteMany(),
		prisma.book.deleteMany(),
		prisma.member.deleteMany(),
	]);

	const booksData: Prisma.BookUncheckedCreateInput[] = Array.from({length: 50}, () => ({
		title: faker.book.title(),
		author: faker.book.author(),
		genre: faker.helpers.arrayElement(BookGenreDefinition.options),
		yearPublished: faker.number.int({
			min: 1960,
			max: new Date().getFullYear(),
		}),
	}));

	await prisma.book.createMany({data: booksData});

	const books = await prisma.book.findMany({select: {id: true}});

	const bookCopiesData: Prisma.BookCopyUncheckedCreateInput[] = books.flatMap((book) =>
		Array.from({length: faker.number.int({min: 1, max: 6})}, () => ({
			bookId: book.id,
			isbn: faker.commerce.isbn(),
			status: faker.datatype.boolean(0.25) ? 'BORROWED' : 'AVAILABLE',
		})),
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
	const bookCopies = await prisma.bookCopy.findMany({select: {id: true, status: true}});

	const date = new Date();
	let hasThreeDayGap = false;
	const transactionsData: Prisma.TransactionUncheckedCreateInput[] = bookCopies.flatMap((copy) => {
		const ticketSegment0 = faker.number.int({min: 0, max: 9999}).toString().padStart(4, '0');
		const ticketSegment1 = faker.string.alphanumeric(6).toUpperCase();
		const ticketSegment2 =
			(date.getMonth() + 1).toString().padStart(2, '0') +
			date.getDate().toString().padStart(2, '0') +
			date.getFullYear();
		const ticket = `${ticketSegment0}-${ticketSegment1}-${ticketSegment2}`;

		const borrowedAt = faker.date.recent({days: 365});
		const gapDays = hasThreeDayGap ? faker.number.int({min: 1, max: 14}) : 3;
		const returnedAt = new Date(borrowedAt.getTime() + gapDays * 24 * 60 * 60 * 1000);

		const borrowed: Prisma.TransactionUncheckedCreateInput = {
			type: 'BORROW',
			status: copy.status === 'BORROWED' ? 'PENDING' : 'COMPLETED',
			ticket,
			remarks: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
			bookCopyId: copy.id,
			memberId: faker.helpers.arrayElement(members).id,
			dateTimeCreated: borrowedAt,
			dateTimeUpdated: copy.status === 'BORROWED' ? borrowedAt : returnedAt,
		};

		if (copy.status === 'BORROWED') return [borrowed];

		hasThreeDayGap = true;

		return [
			borrowed,
			{
				...borrowed,
				type: 'RETURN',
				remarks: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
				dateTimeCreated: returnedAt,
				dateTimeUpdated: returnedAt,
			},
		];
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

	console.log(
		`Seeded ${booksData.length} books, ${bookCopiesData.length} copies, ${membersData.length} members, ${transactionsData.length} transactions.`,
	);
}

seed().catch((error) => {
	console.error(error);
	process.exit(1);
});
