import { extendType, nullable } from "nexus"

import { ArticleActivityType } from "@prisma/client"
import { Context } from "../../context"

export const articleQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.nonNull.field("articles", {
      type: "Article",
      args: { filter: nullable("ArticleQueryFilter") },
      resolve: async (_parent, args, { prisma }: Context) => {
        const { source, editor } = args.filter ?? {}
        const filter = {
          source: source ? { key: source } : undefined,
          editors: editor ? { some: { name: editor } } : undefined,
        }
        return await prisma.article.findMany({
          where: args.filter ? filter : undefined,
          include: {
            source: { include: { editors: false } },
            editors: { include: { source: false } },
          },
          orderBy: {
            uploadedAt: "desc",
          },
        })
      },
    })
    t.list.nonNull.field("savedArticles", {
      type: "Article",
      args: { source: nullable("String") },
      resolve: async (_parent, args, { prisma, user }: Context) => {
        const { source } = args ?? {}

        return await prisma.article.findMany({
          where: {
            source: source ? { key: source } : undefined,
            activity: {
              some: {
                userId: user?.id,
                type: ArticleActivityType.SAVE_ARTICLE,
              },
            },
          },
          include: {
            source: { include: { editors: false } },
          },
        })
      },
    })
    t.list.nonNull.field("viewedArticles", {
      type: "Article",
      args: { source: nullable("String") },
      resolve: async (_parent, args, { prisma, user }: Context) => {
        const { source } = args ?? {}

        return await prisma.article.findMany({
          where: {
            source: source ? { key: source } : undefined,
            activity: {
              some: {
                userId: user?.id,
                type: ArticleActivityType.VIEW_ARTICLE,
              },
            },
          },
          include: {
            source: { include: { editors: false } },
          },
        })
      },
    })
  },
})
