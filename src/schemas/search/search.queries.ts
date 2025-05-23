import { extendType } from "nexus"

import { Context } from "../../context"

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
        const articles = await prisma.article.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { source: { name: { contains: query, mode: "insensitive" } } },
            ],
          },
          take: pagination?.limit || 10,
          skip: pagination?.offset || 0,
        })
        const topics = await prisma.topic.findMany({
          where: { OR: [{ name: { contains: query, mode: "insensitive" } }] },
        })
        const sources = await prisma.source.findMany({
          where: { OR: [{ name: { contains: query, mode: "insensitive" } }] },
        })
        return { articles, topics, sources }
      },
    })
  },
})
