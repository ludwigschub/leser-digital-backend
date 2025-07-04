import {
  ArticleActivityType,
  Prisma,
  SearchTerm,
  Subscription,
} from "@prisma/client"
import { extendType, nullable } from "nexus"

import { Context } from "../../context"

export const getArticleSubscriptionsFilter = (
  subscriptions: (Subscription & { searchTerm: SearchTerm })[]
): Prisma.ArticleWhereInput => {
  return {
    OR: [
      subscriptions.find((s) => s.searchTerm.sourceId)
        ? {
            source: {
              id: {
                in: subscriptions
                  .map((s) => s.searchTerm.sourceId)
                  .filter(Boolean),
              },
            },
          }
        : undefined,
      subscriptions.find((s) => s.searchTerm.editorId)
        ? {
            editors: {
              every: {
                id: {
                  in: subscriptions
                    .map((s) => s.searchTerm.editorId)
                    .filter(Boolean),
                },
              },
            },
          }
        : undefined,
      subscriptions.find((s) => s.searchTerm.topicId)
        ? {
            topic: {
              id: {
                in: subscriptions
                  .map((s) => s.searchTerm.topicId)
                  .filter(Boolean),
              },
            },
          }
        : undefined,
    ].filter(Boolean) as Prisma.ArticleWhereInput[],
  }
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
            include: { searchTerm: true },
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
          take: args.pagination?.limit ?? 10,
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
        if (!args.filter) {
          return []
        }
        const { source, editor, topic, category, short } = args.filter
        const filter = {
          OR: [
            source ? { source: { key: source } } : undefined,
            editor ? { editors: { some: { name: editor } } } : undefined,
            topic ? { topic: { category: topic } } : undefined,
            category ? { category: { equals: category } } : undefined,
            short ? { short } : undefined,
          ].filter(Boolean),
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
      args: {
        filter: nullable("ArticlesQueryFilter"),
      },
      resolve: async (_parent, { filter }, { prisma, user }: Context) => {
        const { query, category } = filter ?? {}
        const activity = await prisma.articleActivity.findMany({
          where: {
            userId: user?.id,
            type: ArticleActivityType.SAVE_ARTICLE,
            article: {
              topic: category ? { category } : undefined,
              OR: query
                ? [
                    { title: { contains: query?.trim(), mode: "insensitive" } },
                    {
                      description: {
                        contains: query?.trim(),
                        mode: "insensitive",
                      },
                    },
                    {
                      source: {
                        name: { contains: query?.trim(), mode: "insensitive" },
                      },
                    },
                    {
                      topic: {
                        name: { contains: query?.trim(), mode: "insensitive" },
                      },
                    },
                  ]
                : undefined,
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
      args: {
        filter: nullable("ArticlesQueryFilter"),
      },
      resolve: async (_parent, { filter }, { prisma, user }: Context) => {
        const { query, category, order } = filter ?? {}
        const activity = await prisma.articleActivity.findMany({
          where: {
            userId: user?.id,
            type: ArticleActivityType.VIEW_ARTICLE,
            article: {
              topic: category ? { category } : undefined,
              OR: query
                ? [
                    { title: { contains: query?.trim(), mode: "insensitive" } },
                    {
                      description: {
                        contains: query?.trim(),
                        mode: "insensitive",
                      },
                    },
                    {
                      source: {
                        name: { contains: query?.trim(), mode: "insensitive" },
                      },
                    },
                    {
                      topic: {
                        name: { contains: query?.trim(), mode: "insensitive" },
                      },
                    },
                  ]
                : undefined,
            },
          },
          orderBy: {
            createdAt: order === "OLDEST" ? "asc" : "desc",
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
    t.list.nonNull.field("mostInterestingArticles", {
      type: "Article",
      args: {
        pagination: "PaginationInput",
      },
      resolve: async (_parent, args, { prisma, user }: Context) => {
        const userViewedArticles = await prisma.articleActivity.findMany({
          where: {
            userId: user?.id,
            type: ArticleActivityType.VIEW_ARTICLE,
            article: {
              ranking: {
                isNot: null,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            article: {
              include: { ranking: { include: { searchTerms: true } } },
            },
          },
          take: args.pagination?.limit ?? 10,
          skip: args.pagination?.offset ?? 0,
        })
        const userViewedSearchTerms = userViewedArticles.reduce(
          (activity, current) => {
            return [
              ...activity,
              ...(current.article.ranking?.searchTerms.map((term) => term) ??
                []),
            ]
          },
          [] as SearchTerm[]
        )
        if (userViewedSearchTerms.length > 0) {
          return await prisma.article.findMany({
            where: {
              ranking: {
                searchTerms: {
                  some: {
                    id: {
                      in: userViewedSearchTerms
                        .filter((term) => term.active)
                        .map((term) => term.id),
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
            orderBy: {
              ranking: {
                mentions: "desc",
              },
            },
            take: args.pagination?.limit ?? 10,
            skip: args.pagination?.offset ?? 0,
          })
        } else {
          return await prisma.article.findMany({
            where: {
              ranking: { isNot: null }, // Ensure the article has a ranking
            },
            orderBy: {
              ranking: {
                mentions: "desc",
              },
            },
            take: args.pagination?.limit ?? 10,
            skip: args.pagination?.offset ?? 0,
          })
        }
      },
    })
  },
})
