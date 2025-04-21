/*
  Warnings:

  - Added the required column `banner` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Source" ADD COLUMN     "banner" TEXT NOT NULL;
