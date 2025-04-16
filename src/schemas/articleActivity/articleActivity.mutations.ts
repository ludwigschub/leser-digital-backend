import { extendType, inputObjectType, nonNull } from "nexus"

import { Context } from "../../context"

export const ArticleActivityInput = inputObjectType({
  name: "ArticleActivityInput",
  definition(t) {
    t.nonNull.int("articleId")
    t.nonNull.field("type", { type: "ArticleActivityType" })
  },
})

export const ArticleActivityMutations = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createArticleActivity", {
      type: "ArticleActivity",
      args: { data: nonNull("ArticleActivityInput") },
      resolve: async (
        _parent,
        { data: { type, articleId: id } },
        { prisma, user }: Context
      ) => {
        return await prisma.articleActivity.create({
          data: {
            type,
            article: { connect: { id } },
            user: { connect: { id: user?.id } },
          },
        })
      },
    })
    t.field("deleteArticleActivity", {
      type: "ArticleActivity",
      args: { id: nonNull("Int") },
      resolve: async (_parent, { id }, { prisma }: Context) => {
        return await prisma.articleActivity.delete({
          where: {
            id,
          },
        })
      },
    })
  },
})
