-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('AVAILABLE', 'BORROWED');

-- CreateEnum
CREATE TYPE "BookGenre" AS ENUM ('FICTION', 'NON_FICTION', 'ROMANCE', 'FANTASY', 'SCIENCE_FICTION', 'MYSTERY', 'THRILLER', 'HORROR', 'HISTORICAL_FICTION', 'BIOGRAPHY', 'SELF_HELP', 'HISTORY', 'PHILOSOPHY', 'PSYCHOLOGY', 'BUSINESS', 'SCIENCE', 'TRAVEL', 'RELIGION_SPIRITUALITY', 'YOUNG_ADULT', 'CHILDREN', 'POETRY');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BORROW', 'RETURN');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "genre" "BookGenre" NOT NULL,
    "yearPublished" INTEGER NOT NULL,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookCopy" (
    "id" SERIAL NOT NULL,
    "isbn" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "status" "BookStatus" NOT NULL DEFAULT 'AVAILABLE',
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "course" TEXT,
    "yearAndSection" TEXT,
    "dateTimeLastBorrowedBook" TIMESTAMP(3),
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "ticket" TEXT NOT NULL,
    "remarks" TEXT,
    "memberId" INTEGER NOT NULL,
    "bookCopyId" INTEGER NOT NULL,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE INDEX "Book_dateTimeCreated_idx" ON "Book"("dateTimeCreated");

-- CreateIndex
CREATE INDEX "Book_dateTimeUpdated_idx" ON "Book"("dateTimeUpdated");

-- CreateIndex
CREATE INDEX "Book_genre_idx" ON "Book"("genre");

-- CreateIndex
CREATE UNIQUE INDEX "BookCopy_isbn_key" ON "BookCopy"("isbn");

-- CreateIndex
CREATE INDEX "BookCopy_status_idx" ON "BookCopy"("status");

-- CreateIndex
CREATE INDEX "BookCopy_dateTimeCreated_idx" ON "BookCopy"("dateTimeCreated");

-- CreateIndex
CREATE INDEX "BookCopy_dateTimeUpdated_idx" ON "BookCopy"("dateTimeUpdated");

-- CreateIndex
CREATE INDEX "BookCopy_bookId_idx" ON "BookCopy"("bookId");

-- CreateIndex
CREATE INDEX "BookCopy_bookId_status_idx" ON "BookCopy"("bookId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Member_externalId_key" ON "Member"("externalId");

-- CreateIndex
CREATE INDEX "Member_dateTimeCreated_idx" ON "Member"("dateTimeCreated");

-- CreateIndex
CREATE INDEX "Member_dateTimeUpdated_idx" ON "Member"("dateTimeUpdated");

-- CreateIndex
CREATE INDEX "Member_dateTimeLastBorrowedBook_idx" ON "Member"("dateTimeLastBorrowedBook");

-- CreateIndex
CREATE INDEX "Transaction_type_dateTimeCreated_idx" ON "Transaction"("type", "dateTimeCreated");

-- CreateIndex
CREATE INDEX "Transaction_status_dateTimeCreated_idx" ON "Transaction"("status", "dateTimeCreated");

-- CreateIndex
CREATE INDEX "Transaction_dateTimeUpdated_idx" ON "Transaction"("dateTimeUpdated");

-- CreateIndex
CREATE INDEX "Transaction_memberId_type_dateTimeCreated_idx" ON "Transaction"("memberId", "type", "dateTimeCreated");

-- CreateIndex
CREATE INDEX "Transaction_bookCopyId_type_dateTimeCreated_idx" ON "Transaction"("bookCopyId", "type", "dateTimeCreated");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_ticket_type_key" ON "Transaction"("ticket", "type");

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bookCopyId_fkey" FOREIGN KEY ("bookCopyId") REFERENCES "BookCopy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
