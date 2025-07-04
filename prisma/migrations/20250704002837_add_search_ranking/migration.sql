-- AlterTable
ALTER TABLE "SearchTerm" ADD COLUMN     "rankingId" TEXT;

-- CreateTable
CREATE TABLE "SearchTermRanking" (
    "id" TEXT NOT NULL,
    "searchTermId" TEXT NOT NULL,
    "mentions" INTEGER NOT NULL DEFAULT 0,
    "forSourceId" TEXT,
    "forTopicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchTermRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchTermRanking_searchTermId_key" ON "SearchTermRanking"("searchTermId");

-- AddForeignKey
ALTER TABLE "SearchTermRanking" ADD CONSTRAINT "SearchTermRanking_searchTermId_fkey" FOREIGN KEY ("searchTermId") REFERENCES "SearchTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchTermRanking" ADD CONSTRAINT "SearchTermRanking_forSourceId_fkey" FOREIGN KEY ("forSourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchTermRanking" ADD CONSTRAINT "SearchTermRanking_forTopicId_fkey" FOREIGN KEY ("forTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
