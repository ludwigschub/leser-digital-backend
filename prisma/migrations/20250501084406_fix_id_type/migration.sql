/*
  Warnings:

  - The primary key for the `Article` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ArticleActivity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Editor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Source` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VerificationCode` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleActivity" DROP CONSTRAINT "ArticleActivity_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleActivity" DROP CONSTRAINT "ArticleActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "Editor" DROP CONSTRAINT "Editor_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_editorId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationCode" DROP CONSTRAINT "VerificationCode_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleToEditor" DROP CONSTRAINT "_ArticleToEditor_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleToEditor" DROP CONSTRAINT "_ArticleToEditor_B_fkey";

-- AlterTable
ALTER TABLE "Article" DROP CONSTRAINT "Article_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sourceId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Article_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Article_id_seq";

-- AlterTable
ALTER TABLE "ArticleActivity" DROP CONSTRAINT "ArticleActivity_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "articleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ArticleActivity_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ArticleActivity_id_seq";

-- AlterTable
ALTER TABLE "Editor" DROP CONSTRAINT "Editor_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sourceId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Editor_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Editor_id_seq";

-- AlterTable
ALTER TABLE "Source" DROP CONSTRAINT "Source_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Source_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Source_id_seq";

-- AlterTable
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "sourceId" SET DATA TYPE TEXT,
ALTER COLUMN "editorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Subscription_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "VerificationCode" DROP CONSTRAINT "VerificationCode_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "VerificationCode_id_seq";

-- AlterTable
ALTER TABLE "_ArticleToEditor" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "VerificationCode" ADD CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Editor" ADD CONSTRAINT "Editor_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Editor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleActivity" ADD CONSTRAINT "ArticleActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleActivity" ADD CONSTRAINT "ArticleActivity_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToEditor" ADD CONSTRAINT "_ArticleToEditor_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToEditor" ADD CONSTRAINT "_ArticleToEditor_B_fkey" FOREIGN KEY ("B") REFERENCES "Editor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
