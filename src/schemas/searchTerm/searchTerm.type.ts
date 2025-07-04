import { objectType } from "nexus"
import { SearchTerm as SearchTermType } from "nexus-prisma"

import { Context } from "../../context"

export const SearchTerm = objectType({
  name: SearchTermType.$name,
  description: SearchTermType.$description,
  definition(t) {
    t.field(SearchTermType.id)
    t.field(SearchTermType.term)
    t.field(SearchTermType.active)
    t.field(SearchTermType.topic)
    t.field(SearchTermType.source)
    t.field(SearchTermType.createdAt)
    t.field(SearchTermType.updatedAt)
    t.nullable.field("ranking", {
      type: "Int",
      resolve: async (parent, _arg, { prisma, user }: Context) => {
        if (user?.role === "ADMIN") {
          const ranking = await prisma.searchTermRanking.findFirst({
            where: { searchTermId: parent.id },
            orderBy: { createdAt: "desc" },
          })
          return Math.floor(ranking?.mentions || 0)
        }
      },
    })
    t.field("subscribers", {
      type: "Int",
      resolve: async (parent, _arg, { prisma }) => {
        return await prisma.subscription.count({
          where: { searchTermId: parent.id },
        })
      },
    })
    t.nullable.field("isSubscribed", {
      type: "Subscription",
      resolve: async (parent, _arg, { prisma, user }: Context) => {
        if (!user) return false
        const subscription = await prisma.subscription.findFirst({
          where: { searchTermId: parent.id, userId: user.id },
        })
        return subscription
      },
    })
  },
})
