/*
		Warnings:

	- You are about to rename the "Student" table to "Member".
	- You are about to rename the "studentId" column on the "Transaction" table to "memberId".

*/
-- RenameTable
ALTER TABLE "Student" RENAME TO "Member";

-- AlterIndex
ALTER INDEX "Student_pkey" RENAME TO "Member_pkey";

-- AlterIndex
ALTER INDEX "Student_externalId_key" RENAME TO "Member_externalId_key";

-- RenameColumn
ALTER TABLE "Transaction" RENAME COLUMN "studentId" TO "memberId";

-- AlterForeignKey
ALTER TABLE "Transaction" RENAME CONSTRAINT "Transaction_studentId_fkey" TO "Transaction_memberId_fkey";
