import {AsyncTask, SimpleIntervalJob} from 'toad-scheduler';
import {prisma} from '../config/prisma';

const reserveBookTask = new AsyncTask(
	'reserve_book',
	async () => {
		console.log(`job 'reserveBook' started`);
		const reservations = await prisma.reservation.findMany({
			where: {status: 'PENDING', bookCopyId: null},
			select: {id: true, bookId: true},
			orderBy: {dateTimeCreated: 'asc'},
		});

		for (const reservation of reservations) {
			try {
				const copy = await prisma.bookCopy.findFirst({
					where: {bookId: reservation.bookId, status: 'AVAILABLE'},
					select: {id: true},
				});
				if (!copy) continue;

				await prisma.$transaction(async (tx) => {
					const assigned = await tx.reservation.updateMany({
						where: {id: reservation.id, status: 'PENDING', bookCopyId: null},
						data: {bookCopyId: copy.id},
					});
					if (assigned.count === 0) return;
					const reserved = await tx.bookCopy.updateMany({
						where: {id: copy.id, bookId: reservation.bookId, status: 'AVAILABLE'},
						data: {status: 'RESERVED'},
					});
					if (reserved.count === 0) throw new Error('Copy is no longer available');
				});
			} catch (error) {
				console.error(`Failed to assign a copy to reservation ${reservation.id}`, error);
			}
		}
		console.log(`job 'reserveBook' completed`);
	},
	(error) => {
		console.error(error);
	},
);

const interval = process.env.NODE_ENV === 'development' ? {seconds: 30} : {hours: 1};

export const reserveBookJob = new SimpleIntervalJob(
	{...interval, runImmediately: true},
	reserveBookTask,
	{preventOverrun: true},
);
