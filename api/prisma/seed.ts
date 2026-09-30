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
		prisma.student.deleteMany(),
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

	const studentsData: Prisma.StudentUncheckedCreateInput[] = Array.from(
		{length: 20},
		(_, index) => ({
			externalId: `${faker.string.alphanumeric(6)}-${index}`,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			course: faker.helpers.arrayElement(['BSIT', 'BSCS', 'BSIS', 'BSEM', 'BSPSY']),
			yearAndSection: `${faker.number.int({min: 1, max: 4})}-${faker.helpers.arrayElement(['A', 'B', 'C', 'D'])}`,
		}),
	);

	await prisma.student.createMany({data: studentsData});

	const students = await prisma.student.findMany({select: {id: true}});
	const bookCopies = await prisma.bookCopy.findMany({select: {id: true, status: true}});

	const transactionsData: Prisma.TransactionUncheckedCreateInput[] = bookCopies.flatMap((copy) => {
		const borrowed: Prisma.TransactionUncheckedCreateInput = {
			type: 'BORROW',
			bookCopyId: copy.id,
			studentId: faker.helpers.arrayElement(students).id,
		};

		if (copy.status === 'BORROWED') return [borrowed];

		return faker.datatype.boolean(0.3) ? [borrowed, {...borrowed, type: 'RETURN'}] : [borrowed];
	});

	await prisma.transaction.createMany({data: transactionsData});

	console.log(
		`Seeded ${booksData.length} books, ${bookCopiesData.length} copies, ${studentsData.length} students, ${transactionsData.length} transactions.`,
	);
}

seed().catch((error) => {
	console.error(error);
	process.exit(1);
});
