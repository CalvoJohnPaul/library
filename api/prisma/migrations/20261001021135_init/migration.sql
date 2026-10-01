-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('AVAILABLE', 'BORROWED');

-- CreateEnum
CREATE TYPE "BookGenre" AS ENUM ('FICTION', 'NON_FICTION', 'ROMANCE', 'FANTASY', 'SCIENCE_FICTION', 'MYSTERY', 'THRILLER', 'HORROR', 'HISTORICAL_FICTION', 'BIOGRAPHY', 'SELF_HELP', 'HISTORY', 'PHILOSOPHY', 'PSYCHOLOGY', 'BUSINESS', 'SCIENCE', 'TRAVEL', 'RELIGION_SPIRITUALITY', 'YOUNG_ADULT', 'CHILDREN', 'POETRY');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BORROW', 'RETURN');

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
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "yearAndSection" TEXT NOT NULL,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "type" "TransactionType" NOT NULL,
    "ticket" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "bookCopyId" INTEGER NOT NULL,
    "dateTimeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BookCopy_isbn_key" ON "BookCopy"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Student_externalId_key" ON "Student"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_ticket_type_key" ON "Transaction"("ticket", "type");

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bookCopyId_fkey" FOREIGN KEY ("bookCopyId") REFERENCES "BookCopy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
