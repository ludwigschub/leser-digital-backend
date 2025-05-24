import { Prisma } from "@prisma/client"
import { extendType } from "nexus"

import { Context } from "../../context"

const getSearchQueryFilter = (query: string) => ({
  articles: {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { source: { name: { contains: query, mode: "insensitive" } } },
    ],
  } as Prisma.ArticleWhereInput,
  topics: {
    OR: [{ name: { contains: query, mode: "insensitive" } }],
  } as Prisma.TopicWhereInput,
  sources: {
    OR: [{ name: { contains: query, mode: "insensitive" } }],
  } as Prisma.SourceWhereInput,
})

export const searchQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("search", {
      type: "SearchResult",
      args: {
        query: "String",
        pagination: "PaginationInput",
      },
      resolve: async (_parent, { query, pagination }, { prisma }: Context) => {
        const queryFilter = getSearchQueryFilter(query)
        return {
          articles: await prisma.article.findMany({
            where: queryFilter.articles,
            take: pagination?.limit || 10,
            skip: pagination?.offset || 0,
            orderBy: { uploadedAt: "desc" },
          }),
          foundArticles: await prisma.article.count({
            where: queryFilter.articles,
          }),
          topics: await prisma.topic.findMany({
            where: queryFilter.topics,
          }),
          foundTopics: await prisma.topic.count({
            where: queryFilter.topics,
          }),
          sources: await prisma.source.findMany({
            where: queryFilter.sources,
          }),
          foundSources: await prisma.source.count({
            where: queryFilter.sources,
          }),
        }
      },
    })
  },
})
