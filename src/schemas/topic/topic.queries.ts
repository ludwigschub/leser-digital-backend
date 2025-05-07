import { extendType } from "nexus"

import { Context } from "../../context"

export const TopicQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.nonNull.field("topics", {
      type: "Topic",
      resolve: async (_parent, _arg, { prisma }: Context) => {
        const allTopics = await prisma.topic.findMany({
          orderBy: {
            articles: {
              _count: "desc",
            },
          },
          include: {
            articles: true,
          },
        })
        return allTopics.filter((topic) => topic.articles.length > 0)
      },
    })
  },
})
