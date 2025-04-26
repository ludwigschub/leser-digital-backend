import { extendType } from "nexus"

import { Context } from "../../context"
import { UserNotLoggedInError } from "../user/user.errors"

export const SubscriptionMutations = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createSubscription", {
      type: "Subscription",
      args: {
        sourceId: "Int",
        editorId: "Int",
        category: "ArticleCategory",
      },
      resolve: async (
        _parent,
        { sourceId, editorId, category },
        { prisma, user }: Context
      ) => {
        if (!user) {
          throw UserNotLoggedInError
        }
        if (!sourceId && !editorId && !category) {
          throw new Error("At least one argument is required")
        }
        return await prisma.subscription.create({
          data: {
            user: { connect: { id: user.id } },
            source: sourceId ? { connect: { id: sourceId } } : undefined,
            editor: editorId ? { connect: { id: editorId } } : undefined,
            category,
          },
        })
      },
    })
    t.field("deleteSubscription", {
      type: "Subscription",
      args: {
        id: "Int",
      },
      resolve: async (_parent, { id }, { prisma, user }: Context) => {
        if (!user) {
          throw UserNotLoggedInError
        }
        return await prisma.subscription.delete({
          where: { id, userId: user.id },
        })
      },
    })
  },
})
