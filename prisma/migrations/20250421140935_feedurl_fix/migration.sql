/*
  Warnings:

  - You are about to drop the column `feedUrl` on the `Source` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Source" DROP COLUMN "feedUrl",
ADD COLUMN     "feeds" TEXT[];
