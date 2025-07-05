import { extendType, nullable } from "nexus"

import { Context } from "../../context"

export const searchTermQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("searchTerm", {
      type: "SearchTerm",
      args: {
        id: "String",
        term: "String",
      },
      resolve: async (_parent, { id, term }, { prisma }: Context) => {
        if (term) {
          return await prisma.searchTerm.findFirst({
            where: {
              term: {in: [term], mode: "insensitive" },
              topic: { is: null }, // Ensure no topic is associated
              source: { is: null }, // Ensure no source is associated
            },
          })
        } else if (id) {
          return await prisma.searchTerm.findUnique({
            where: { id },
          })
        }
        throw new Error("Either 'id' or 'term' must be provided")
      },
    })
    t.list.nonNull.field("allSearchTerms", {
      type: "SearchTerm",
      args: {
        query: nullable("String"),
        active: nullable("Boolean"),
        pagination: nullable("PaginationInput"),
      },
      resolve: async (
        _parent,
        { query, active, pagination },
        { prisma }: Context
      ) => {
        const searchTerms = await prisma.searchTerm.findMany({
          where: {
            OR: [
              { term: { startsWith: query || "", mode: "insensitive" } },
              { term: { contains: query || "", mode: "insensitive" } },
              { term: { equals: query || "", mode: "insensitive" } },
            ],
            ranking: { isNot: null },
            active,
          },
          orderBy: { ranking: { mentions: "desc" } },
          take: pagination?.limit || 10,
          skip: pagination?.offset || 0,
        })
        return searchTerms
      },
    })
    t.list.nonNull.field("searchTerms", {
      type: "SearchTerm",
      args: {
        query: nullable("String"),
        sourceId: nullable("String"),
        topicId: nullable("String"),
        pagination: nullable("PaginationInput"),
      },
      resolve: async (
        _parent,
        { query, sourceId, topicId, pagination },
        { prisma }: Context
      ) => {
        const searchTerm = await prisma.searchTerm.findMany({
          where: {
            OR: [
              { term: { startsWith: query || "", mode: "insensitive" } },
              { term: { contains: query || "", mode: "insensitive" } },
            ],
            active: true, // Ensure the search term is active
            topicId: topicId ?? undefined,
            sourceId: sourceId ?? undefined,
            ranking: { isNot: null }, // Ensure ranking exists
          },
          orderBy: { ranking: { mentions: "desc" } },
          take: pagination?.limit || 10,
          skip: pagination?.offset || 0,
        })
        return searchTerm
      },
    })
  },
})
