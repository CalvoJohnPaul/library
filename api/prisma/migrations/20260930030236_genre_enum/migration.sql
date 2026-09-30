/*
  Warnings:

  - Changed the type of `genre` on the `Book` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BookGenre" AS ENUM ('FICTION', 'NON_FICTION', 'ROMANCE', 'FANTASY', 'SCIENCE_FICTION', 'MYSTERY', 'THRILLER', 'HORROR', 'HISTORICAL_FICTION', 'BIOGRAPHY', 'SELF_HELP', 'HISTORY', 'PHILOSOPHY', 'PSYCHOLOGY', 'BUSINESS', 'SCIENCE', 'TRAVEL', 'RELIGION_SPIRITUALITY', 'YOUNG_ADULT', 'CHILDREN', 'POETRY');

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "genre",
ADD COLUMN     "genre" "BookGenre" NOT NULL;
