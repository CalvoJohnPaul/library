-- AlterTable
ALTER TABLE "Student" ADD COLUMN "name" TEXT;

-- Backfill the new column from the dropped name parts before enforcing NOT NULL
UPDATE "Student" SET "name" = "firstName" || ' ' || "lastName";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "Student" DROP COLUMN "firstName";
ALTER TABLE "Student" DROP COLUMN "lastName";
