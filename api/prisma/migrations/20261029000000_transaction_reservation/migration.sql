-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "reservationId" INTEGER;

-- Backfill transactions from the matching reservation ticket.
UPDATE "Transaction" AS t
SET "reservationId" = r."id"
FROM "Reservation" AS r
WHERE t."ticket" = r."ticket" AND t."memberId" = r."memberId";

-- CreateIndex
CREATE INDEX "Transaction_reservationId_idx" ON "Transaction"("reservationId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
