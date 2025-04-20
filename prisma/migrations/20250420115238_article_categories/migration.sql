/*
  Warnings:

  - You are about to drop the column `categories` on the `Article` table. All the data in the column will be lost.
  - Added the required column `category` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('TECHNOLOGY', 'SCIENCE', 'HEALTH', 'BUSINESS', 'ENTERTAINMENT', 'SPORTS', 'POLITICS', 'CULTURE', 'ENVIRONMENT', 'RELIGION', 'EDUCATION', 'BREAKING', 'GAMING', 'TRAVEL', 'ART', 'PSYCHOLOGY', 'HISTORY', 'FOOD', 'FASHION', 'PUZZLE', 'WEATHER', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "categories",
ADD COLUMN     "category" "ArticleCategory" NOT NULL;
