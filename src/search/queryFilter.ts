import { Prisma } from "@prisma/client"

export const getArticleSearchQuery = (query: string | string[]) =>
  ({
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { source: { name: { contains: query, mode: "insensitive" } } },
    ],
  } as Prisma.ArticleWhereInput)

export const getTopicSearchQuery = (query: string, topicId: string) => ({
  AND: [getArticleSearchQuery(query), { topicId }],
})

export const getSourceSearchQuery = (query: string, sourceId: string) => ({
  AND: [getArticleSearchQuery(query), { sourceId }],
})
