-- CreateEnum
CREATE TYPE "ArticleActivityType" AS ENUM ('VIEW_ARTICLE', 'SAVE_ARTICLE');

-- CreateTable
CREATE TABLE "ArticleActivity" (
    "id" SERIAL NOT NULL,
    "type" "ArticleActivityType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,

    CONSTRAINT "ArticleActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArticleActivity" ADD CONSTRAINT "ArticleActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleActivity" ADD CONSTRAINT "ArticleActivity_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
