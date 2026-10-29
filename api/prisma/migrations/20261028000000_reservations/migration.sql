-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETED');

-- AlterEnum
ALTER TYPE "BookStatus" ADD VALUE 'RESERVED';

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'RESERVE';
ALTER TYPE "TransactionType" ADD VALUE 'UNRESERVE';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "bookId" INTEGER,
ALTER COLUMN "bookCopyId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "bookCopyId" INTEGER,
    "memberId" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "ticket" TEXT NOT NULL,
    "remarks" TEXT,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_ticket_key" ON "Reservation"("ticket");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_bookId_memberId_key" ON "Reservation"("bookId", "memberId") WHERE ("status" = 'PENDING');

-- CreateIndex
CREATE INDEX "Reservation_status_bookCopyId_idx" ON "Reservation"("status", "bookCopyId");

-- CreateIndex
CREATE INDEX "Transaction_bookId_type_dateTimeCreated_idx" ON "Transaction"("bookId", "type", "dateTimeCreated");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_bookCopyId_fkey" FOREIGN KEY ("bookCopyId") REFERENCES "BookCopy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
