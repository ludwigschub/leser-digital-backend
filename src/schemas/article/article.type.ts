import { enumType, inputObjectType, nullable, objectType } from "nexus"
import {
  ArticleCategory as ArticleCategoryType,
  Article as ArticleType,
} from "nexus-prisma"

import { Context } from "../../context"

export const Article = objectType({
  name: ArticleType.$name,
  description: ArticleType.$description,
  definition(t) {
    t.field(ArticleType.id)
    t.field(ArticleType.title)
    t.field(ArticleType.description)
    t.field(ArticleType.content)
    t.field(ArticleType.url)
    t.field(ArticleType.image)
    t.field(ArticleType.premium)
    t.field(ArticleType.topic)
    t.field(ArticleType.source)
    t.field(ArticleType.editors)
    t.field(ArticleType.uploadedAt)
    t.field(ArticleType.createdAt)
    t.field(ArticleType.updatedAt)
    t.list.nonNull.field("keywords", {
      type: "String",
      resolve: (parent, _args, { prisma }: Context) => {
        return prisma.searchTerm
          .findMany({
            distinct: ["term"],
            where: {
              articleRanking: { some: { articleId: parent.id } },
              active: true,
            },
            orderBy: { ranking: { mentions: "desc" } },
            take: 4,
          })
          .then((terms) => terms.map((term) => term.term))
      },
    })
    t.list.nonNull.field("activity", {
      type: nullable("ArticleActivity"),
      resolve: (parent, _args, { prisma, user }: Context) => {
        if (!user) return null
        return prisma.articleActivity.findMany({
          where: {
            articleId: parent.id,
            userId: user?.id,
          },
        })
      },
    })
    t.field("views", {
      type: "Int",
      resolve: async (parent, _args, { prisma }) => {
        return await prisma.articleActivity.count({
          where: {
            articleId: parent.id,
            type: "VIEW_ARTICLE",
          },
        })
      },
    })
  },
})

export const ArticleCategory = enumType({
  name: ArticleCategoryType.name,
  description: ArticleCategoryType.description,
  members: ArticleCategoryType.members,
})

export const articleQueryFilter = inputObjectType({
  name: "ArticleQueryFilter",
  definition(t) {
    t.string("source")
    t.string("editor")
    t.field("topic", { type: "ArticleCategory" })
    t.boolean("short")
  },
})

export const ArticleOrder = enumType({
  name: "ArticleOrder",
  description: "Order articles by upload date",
  members: ["OLDEST", "NEWEST"],
})

export const articlesQueryFilter = inputObjectType({
  name: "ArticlesQueryFilter",
  definition(t) {
    t.field("order", { type: "ArticleOrder" })
    t.string("query")
    t.field("category", { type: "ArticleCategory" })
  },
})
