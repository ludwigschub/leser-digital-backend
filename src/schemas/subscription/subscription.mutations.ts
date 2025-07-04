import { extendType } from "nexus"

import { Context } from "../../context"

export const SubscriptionMutations = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createSubscription", {
      type: "Subscription",
      args: {
        sourceId: "String",
        termId: "String",
        topicId: "String",
      },
      resolve: async (
        _parent,
        { sourceId, termId, topicId },
        { prisma, user }: Context
      ) => {
        if (!sourceId && !termId && !topicId) {
          throw new Error("At least one argument is required")
        }
        return await prisma.subscription.create({
          data: {
            user: { connect: { id: user?.id } },
            searchTerm: {
              connect: termId ? { id: termId } : undefined,
              create: termId
                ? undefined
                : {
                    source: sourceId
                      ? { connect: { id: sourceId } }
                      : undefined,
                    topic: topicId ? { connect: { id: topicId } } : undefined,
                  },
            },
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
        return await prisma.subscription.delete({
          where: { id, userId: user?.id },
        })
      },
    })
  },
})
