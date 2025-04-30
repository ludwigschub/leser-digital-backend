import {
  ArticleActivityType,
  ArticleCategory,
  Prisma,
  Subscription,
} from "@prisma/client"
import { extendType, nullable } from "nexus"

import { Context } from "../../context"

const getArticleSubscriptionsFilter = (subscriptions: Subscription[]) => {
  return {
    OR: [
      {
        source: {
          id: {
            in: subscriptions
              .map((s) => s.sourceId)
              .filter((id) => id !== null && id !== undefined) as number[],
          },
        },
      },
      {
        editors: {
          some: {
            id: {
              in: subscriptions
                .map((s) => s.editorId)
                .filter((id) => id !== null && id !== undefined) as number[],
            },
          },
        },
      },
      {
        category: {
          in: subscriptions
            .map((s) => s.category)
            .filter((category) => Boolean(category)) as ArticleCategory[],
        },
      },
    ],
  }
}

export const articleQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.nonNull.field("articles", {
      type: "Article",
      args: { filter: nullable("ArticleQueryFilter") },
      resolve: async (_parent, args, { prisma, user }: Context) => {
        if (user) {
          const userSubscriptions = await prisma.subscription.findMany({
            where: { userId: user.id },
          })
          if (userSubscriptions.length > 0) {
            return await prisma.article.findMany({
              where: {
                ...getArticleSubscriptionsFilter(userSubscriptions),
                short: false,
              },
              include: {
                source: { include: { editors: false } },
                editors: { include: { source: false } },
              },
              orderBy: {
                uploadedAt: "desc",
              },
            })
          }
        }
        const { source, editor, category } = args.filter ?? {}
        const filter = {
          source: source ? { key: source } : undefined,
          editors: editor ? { some: { name: editor } } : undefined,
          category: category ? { equals: category } : null,
          short: false,
        } as Prisma.ArticleWhereInput
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

        if (!user) {
          return []
        }

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
        if (!user) {
          return []
        }

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
              _count: "desc",
            },
          },
        })

        return mostViewed
      },
    })
  },
})
