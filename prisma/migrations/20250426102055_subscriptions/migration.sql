-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ArticleCategory" ADD VALUE 'CRIME';
ALTER TYPE "ArticleCategory" ADD VALUE 'FITNESS';
ALTER TYPE "ArticleCategory" ADD VALUE 'MUSIC';
ALTER TYPE "ArticleCategory" ADD VALUE 'MOVIES';
ALTER TYPE "ArticleCategory" ADD VALUE 'ANIMALS';
ALTER TYPE "ArticleCategory" ADD VALUE 'NATURE';
ALTER TYPE "ArticleCategory" ADD VALUE 'PHILOSOPHY';
ALTER TYPE "ArticleCategory" ADD VALUE 'LITERATURE';

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sourceId" INTEGER,
    "category" "ArticleCategory",
    "editorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Editor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
