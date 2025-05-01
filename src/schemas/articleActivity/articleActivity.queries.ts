import { extendType, nonNull } from "nexus"

import { Context } from "../../context"

export const ArticleActivityQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("articleActivity", {
      type: "ArticleActivity",
      args: {
        id: nonNull("String"),
      },
      resolve: async (_parent, { id }, { prisma, user }: Context) => {
        return await prisma.articleActivity.findFirst({
          where: {
            article: { id },
            user: { id: user?.id },
          },
        })
      },
    })
  },
})
