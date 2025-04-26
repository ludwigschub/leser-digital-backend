import { objectType } from "nexus"
import { Source as SourceType } from "nexus-prisma"

import { Context } from "../../context"

export const Source = objectType({
  name: SourceType.$name,
  description: SourceType.$description,
  definition(t) {
    t.field(SourceType.id)
    t.field(SourceType.name)
    t.field(SourceType.key)
    t.field(SourceType.logo)
    t.field(SourceType.banner)
    t.field(SourceType.createdAt)
    t.field(SourceType.updatedAt)
    t.field(SourceType.articles)
    t.field(SourceType.editors)
    t.field("subscribers", {
      type: "Int",
      resolve: async (parent, _arg, { prisma }: Context) => {
        return await prisma.subscription.count({
          where: { sourceId: parent.id },
        })
      },
    })
    t.field("isSubscribed", {
      type: "Boolean",
      resolve: async (parent, _arg, { prisma, user }: Context) => {
        if (!user) {
          return false
        }
        const subscription = await prisma.subscription.findFirst({
          where: { userId: user.id, sourceId: parent.id },
        })
        return !!subscription
      },
    })
    t.field("articleCount", {
      type: "Int",
      resolve: async (parent, _arg, { prisma }: Context) => {
        return await prisma.article.count({
          where: { source: { id: parent.id } },
        })
      },
    })
  },
})
