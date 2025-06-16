import { extendType } from "nexus"

import { Context } from "../../context"

export const SubscriptionQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.nonNull.field("subscriptions", {
      type: "Subscription",
      resolve: async (_parent, _args, { prisma, user }: Context) => {
        return await prisma.subscription.findMany({
          where: { userId: user?.id },
          orderBy: { createdAt: "desc" },
        })
      },
    })
  },
})
