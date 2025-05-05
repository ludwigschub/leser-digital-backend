import { enumType, inputObjectType, nullable, objectType } from "nexus"
import {
  ArticleCategory as ArticleCategoryType,
  Article as ArticleType,
} from "nexus-prisma"

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
    t.field(ArticleType.category)
    t.field(ArticleType.source)
    t.field(ArticleType.editors)
    t.field(ArticleType.uploadedAt)
    t.field(ArticleType.createdAt)
    t.field(ArticleType.updatedAt)
    t.list.nonNull.field("activity", {
      type: nullable("ArticleActivity"),
      resolve: (parent, _args, { prisma, user }) => {
        return prisma.articleActivity.findMany({
          where: {
            articleId: parent.id,
            userId: user?.id,
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
    t.string("category")
    t.boolean("short")
  },
})
