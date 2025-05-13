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

export const SourceActivityStat = objectType({
  name: "SourceActivityStat",
  definition(t) {
    t.nonNull.field("source", { type: "Source" })
    t.nonNull.int("views")
  },
})

export const TopicActivityStat = objectType({
  name: "TopicActivityStat",
  definition(t) {
    t.nonNull.field("topic", { type: "Topic" })
    t.nonNull.int("views")
  },
})
