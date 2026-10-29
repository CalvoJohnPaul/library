import {AsyncTask, SimpleIntervalJob} from 'toad-scheduler';
import {prisma} from '../config/prisma';

const unreserveBookTask = new AsyncTask(
	'unreserve_book',
	async () => {
		console.log(`job 'unreserveBook' started`);

		const expiryMilliseconds =
			process.env.NODE_ENV === 'development' ? 10 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000;

		const reason = `Cancelled by the system: reservation expired after ${process.env.NODE_ENV === 'development' ? '5 minutes' : '3 days'}.`;

		const reservations = await prisma.reservation.findMany({
			where: {
				status: 'PENDING',
				dateTimeCreated: {
					lt: new Date(Date.now() - expiryMilliseconds),
				},
			},
			select: {
				id: true,
			},
		});

		for (const reservation of reservations) {
			try {
				await prisma.$transaction(async (tx) => {
					const {count} = await tx.reservation.updateMany({
						where: {
							id: reservation.id,
							status: 'PENDING',
						},
						data: {
							status: 'CANCELLED',
						},
					});

					if (count === 0) {
						return;
					}

					const existing = await tx.reservation.findUniqueOrThrow({
						where: {
							id: reservation.id,
						},
						select: {
							ticket: true,
							bookId: true,
							memberId: true,
							bookCopyId: true,
							remarks: true,
						},
					});

					await tx.reservation.update({
						where: {
							id: reservation.id,
						},
						data: {
							remarks: existing.remarks ? `${existing.remarks}; ${reason}` : reason,
						},
					});

					if (existing.bookCopyId !== null) {
						const released = await tx.bookCopy.updateMany({
							where: {
								id: existing.bookCopyId,
								status: 'RESERVED',
							},
							data: {
								status: 'AVAILABLE',
							},
						});

						if (released.count === 0) {
							throw new Error('Assigned copy is not reserved');
						}
					}

					await tx.transaction.update({
						where: {
							ticket_type: {ticket: existing.ticket, type: 'RESERVE'},
						},
						data: {
							status: 'COMPLETED',
						},
					});

					await tx.transaction.create({
						data: {
							type: 'UNRESERVE',
							status: 'COMPLETED',
							ticket: existing.ticket,
							bookId: existing.bookId,
							memberId: existing.memberId,
							reservationId: reservation.id,
							remarks: reason,
						},
					});
				});
			} catch (error) {
				console.error(`Failed to unreserve reservation ${reservation.id}`, error);
			}
		}

		console.log(`job 'unreserveBook' completed`);
	},
	(error) => {
		console.error(error);
	},
);

const interval = process.env.NODE_ENV === 'development' ? {seconds: 30} : {hours: 1};

export const unreserveBookJob = new SimpleIntervalJob(
	{...interval, runImmediately: true},
	unreserveBookTask,
	{preventOverrun: true},
);
