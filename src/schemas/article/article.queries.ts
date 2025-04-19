import { ArticleActivityType } from "@prisma/client"
import { extendType, nullable } from "nexus"

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
          short: false,
        }
        return await prisma.article.findMany({
          where: filter,
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

        const activity = await prisma.articleActivity.findMany({
          where: {
            userId: user?.id,
            type: ArticleActivityType.SAVE_ARTICLE,
            article: {
              source: source ? { key: source } : undefined,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: { article: true },
        })

        return activity.map((activity) => {
          return {
            ...activity.article,
            activity: [activity],
          }
        })
      },
    })
    t.list.nonNull.field("viewedArticles", {
      type: "Article",
      args: { source: nullable("String") },
      resolve: async (_parent, { source }, { prisma, user }: Context) => {
        const activity = await prisma.articleActivity.findMany({
          where: {
            userId: user?.id,
            type: ArticleActivityType.VIEW_ARTICLE,
            article: {
              source: source ? { key: source } : undefined,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: { article: true },
        })

        return activity.map((activity) => {
          return {
            ...activity.article,
            activity: [activity],
          }
        })
      },
    })
    t.list.field("recommendedArticles", {
      type: "Article",
      resolve: async (_parent, _args, { prisma }: Context) => {
        return prisma.article.findMany({
          where: {
            recommended: true,
          },
          orderBy: {
            uploadedAt: "desc",
          },
          include: {
            source: { include: { editors: false } },
          },
          take: 3,
        })
      },
    })
    t.list.field("mostViewedArticles", {
      type: "Article",
      resolve: async (_parent, _args, { prisma }: Context) => {
        const mostViewed = await prisma.article.findMany({
          include: {
            _count: {
              select: {
                activity: { where: { type: ArticleActivityType.VIEW_ARTICLE } },
              },
            },
          },
          orderBy: {
            activity: {
              _count: "desc"
            }
          }
        })

        return mostViewed
      },
    })
  },
})
