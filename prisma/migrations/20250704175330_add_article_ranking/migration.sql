-- AlterTable
ALTER TABLE "SearchTerm" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "articleRankingId" TEXT[];

-- CreateTable
CREATE TABLE "ArticleRanking" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "mentions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleRankingToSearchTerm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleRanking_articleId_key" ON "ArticleRanking"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleRankingToSearchTerm_AB_unique" ON "_ArticleRankingToSearchTerm"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleRankingToSearchTerm_B_index" ON "_ArticleRankingToSearchTerm"("B");

-- AddForeignKey
ALTER TABLE "ArticleRanking" ADD CONSTRAINT "ArticleRanking_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleRankingToSearchTerm" ADD CONSTRAINT "_ArticleRankingToSearchTerm_A_fkey" FOREIGN KEY ("A") REFERENCES "ArticleRanking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleRankingToSearchTerm" ADD CONSTRAINT "_ArticleRankingToSearchTerm_B_fkey" FOREIGN KEY ("B") REFERENCES "SearchTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
