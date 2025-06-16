import { ArticleCategory } from "@prisma/client"
import { extendType, nonNull } from "nexus"

import { Context } from "../../context"

export const TopicQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.nonNull.field("topics", {
      type: "Topic",
      resolve: async (_parent, _arg, { prisma }: Context) => {
        const allTopics = await prisma.topic.findMany({
          where: { category: { not: ArticleCategory.UNKNOWN } },
          orderBy: {
            articles: {
              _count: "desc",
            },
          },
          include: {
            articles: true,
          },
        })
        return allTopics.filter((topic) => topic.articles.length > 2)
      },
    })
    t.field("topic", {
      type: "Topic",
      args: { category: nonNull("ArticleCategory") },
      resolve: async (_parent, { category }, { prisma }: Context) => {
        const topic = await prisma.topic.findUnique({
          where: { category },
          include: {
            articles: true,
          },
        })
        return topic
      },
    })
  },
})
