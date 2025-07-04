import { ArticleCategory, Prisma, SearchTerm } from "@prisma/client"
import { GraphQLError } from "graphql"
import { extendType, nullable } from "nexus"

import { Context } from "../../context"

const getSearchQueryFilter = (query?: string, term?: SearchTerm) => ({
  articles: {
    OR: [
      { title: { contains: query ?? term?.term, mode: "insensitive" } },
      {
        description: { contains: query ?? term?.term, mode: "insensitive" },
      },
    ],
    source: term?.sourceId
      ? {
          id: term?.sourceId,
        }
      : undefined,
    topic: term?.topicId
      ? {
          id: term?.topicId,
        }
      : undefined,
  } as Prisma.ArticleWhereInput,
  topics: {
    category: { not: ArticleCategory.UNKNOWN },
    name: { contains: query, mode: "insensitive" },
  } as Prisma.TopicWhereInput,
  sources: {
    name: { contains: query, mode: "insensitive" },
  } as Prisma.SourceWhereInput,
})

export const searchQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("search", {
      type: "SearchResult",
      args: {
        query: nullable("String"),
        term: nullable("String"),
        pagination: "PaginationInput",
      },
      resolve: async (
        _parent,
        { query, term, pagination },
        { prisma }: Context
      ) => {
        let searchTerm: SearchTerm | null = null
        let queryFilter:
          | {
              articles: Prisma.ArticleWhereInput
              topics: Prisma.TopicWhereInput
              sources: Prisma.SourceWhereInput
            }
          | undefined
        if (term) {
          searchTerm = await prisma.searchTerm.findFirst({
            where: {
              OR: [
                { id: term },
                {
                  term: { contains: term, mode: "insensitive" },
                  AND: [{ topic: { is: null } }, { source: { is: null } }],
                },
              ],
            },
            orderBy: { ranking: { mentions: "desc" } },
          })
          if (searchTerm) {
            query = query ?? searchTerm.term
            queryFilter = getSearchQueryFilter(query, searchTerm)
          }
        } else if (query) {
          queryFilter = getSearchQueryFilter(query)
        }
        if (!queryFilter) {
          throw new GraphQLError("No search term or query provided", {
            extensions: {
              code: "BAD_SEARCH",
            },
          })
        }
        return {
          articles: await prisma.article.findMany({
            where: queryFilter.articles,
            take: pagination?.limit || 10,
            skip: pagination?.offset || 0,
            orderBy: { ranking: { mentions: "desc" } },
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
