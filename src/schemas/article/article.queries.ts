import { ArticleActivityType, Prisma, Subscription } from "@prisma/client"
import { extendType, nullable } from "nexus"

import { Context } from "../../context"

const getArticleSubscriptionsFilter = (subscriptions: Subscription[]) => {
  return {
    OR: [
      ...(subscriptions.find((s) => s.sourceId)
        ? [
            {
              source: {
                id: {
                  in: subscriptions.map((s) => s.sourceId).filter(Boolean),
                },
              },
            },
          ]
        : []),
      ...(subscriptions.find((s) => s.editorId)
        ? [
            {
              editors: {
                id: {
                  in: subscriptions.map((s) => s.editorId).filter(Boolean),
                },
              },
            },
          ]
        : []),
      ...(subscriptions.find((s) => s.topicId)
        ? [
            {
              topic: {
                id: {
                  in: subscriptions.map((s) => s.topicId).filter(Boolean),
                },
              },
            },
          ]
        : []),
    ],
  } as Prisma.ArticleWhereInput
}

export const articleQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("article", {
      type: "Article",
      args: {
        id: "String",
      },
      resolve: async (_parent, { id }, { prisma }: Context) => {
        return await prisma.article.findUnique({
          where: { id },
          include: {
            source: { include: { editors: false } },
            editors: { include: { source: false } },
          },
        })
      },
    })
    t.list.nonNull.field("feed", {
      type: "Article",
      args: {
        filter: nullable("ArticleQueryFilter"),
        pagination: "PaginationInput",
      },
      resolve: async (_parent, args, { prisma, user }: Context) => {
        if (user) {
          const userSubscriptions = await prisma.subscription.findMany({
            where: { userId: user.id },
          })
          if (
            userSubscriptions.length > 0 &&
            !(args.filter?.source || args.filter?.editor)
          ) {
            return await prisma.article.findMany({
              where: {
                ...getArticleSubscriptionsFilter(userSubscriptions),
                short: args.filter?.short ?? false,
              },
              include: {
                source: { include: { editors: false } },
                editors: { include: { source: false } },
              },
              orderBy: {
                uploadedAt: "desc",
              },
              take: args.pagination?.limit,
              skip: args.pagination?.offset,
            })
          }
        }
        return await prisma.article.findMany({
          where: {
            short: args.filter?.short ?? false,
          },
          include: {
            source: { include: { editors: false } },
            editors: { include: { source: false } },
          },
          orderBy: {
            uploadedAt: "desc",
          },
          take: args.pagination?.limit,
          skip: args.pagination?.offset,
        })
      },
    })
    t.list.nonNull.field("articles", {
      type: "Article",
      args: {
        filter: nullable("ArticleQueryFilter"),
        pagination: "PaginationInput",
      },
      resolve: async (_parent, args, { prisma }: Context) => {
        const { source, editor, topic, category, short } = args.filter ?? {}
        const filter = {
          source: source ? { key: source } : undefined,
          editors: editor ? { some: { name: editor } } : undefined,
          topic: topic ? { category: topic } : undefined,
          category: category ? { equals: category } : undefined,
          short,
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
          take: args.pagination?.limit,
          skip: args.pagination?.offset,
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
    t.list.nonNull.field("mostViewedArticles", {
      type: "Article",
      args: {
        pagination: "PaginationInput",
      },
      resolve: async (_parent, args, { prisma }: Context) => {
        const mostViewed = await prisma.article.findMany({
          where: {
            activity: {
              some: {
                type: ArticleActivityType.VIEW_ARTICLE,
              },
            },
          },
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
          take: args.pagination?.limit,
          skip: args.pagination?.offset,
        })

        return mostViewed
      },
    })
  },
})
