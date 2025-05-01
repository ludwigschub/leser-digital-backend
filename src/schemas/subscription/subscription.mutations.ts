import { extendType } from "nexus"

import { Context } from "../../context"
import { UserNotLoggedInError } from "../user/user.errors"

export const SubscriptionMutations = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createSubscription", {
      type: "Subscription",
      args: {
        sourceId: "String",
        editorId: "String",
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
        if (
          (sourceId === null || sourceId === undefined) &&
          (editorId === null || editorId === undefined) &&
          !category
        ) {
          throw new Error("At least one argument is required")
        }
        return await prisma.subscription.create({
          data: {
            user: { connect: { id: user.id } },
            source:
              sourceId !== null && sourceId !== undefined
                ? { connect: { id: sourceId } }
                : undefined,
            editor:
              editorId !== null && editorId !== undefined
                ? { connect: { id: editorId } }
                : undefined,
            category,
          },
        })
      },
    })
    t.field("deleteSubscription", {
      type: "Subscription",
      args: {
        id: "String",
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
