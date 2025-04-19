-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "recommended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "short" BOOLEAN NOT NULL DEFAULT false;
