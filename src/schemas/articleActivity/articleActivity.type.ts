import { enumType, objectType } from "nexus"
import {
    ArticleActivityType as ArticleActivityTypeEnum,
    ArticleActivity as gArticleActivityType,
} from "nexus-prisma"

export const ArticleActivityType = enumType({
  ...ArticleActivityTypeEnum,
})

export const ArticleActivity = objectType({
  name: gArticleActivityType.$name,
  description: gArticleActivityType.$description,
  definition(t) {
    t.field(gArticleActivityType.id)
    t.field(gArticleActivityType.article)
    t.field(gArticleActivityType.user)
    t.field(gArticleActivityType.type)
    t.field(gArticleActivityType.createdAt)
    t.field(gArticleActivityType.updatedAt)
  },
})
