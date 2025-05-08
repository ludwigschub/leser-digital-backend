import { objectType } from "nexus"
import { Topic as TopicType } from "nexus-prisma"

import { Context } from "../../context"

export const Topic = objectType({
  name: TopicType.$name,
  description: TopicType.$description,
  definition(t) {
    t.field(TopicType.id)
    t.field(TopicType.name)
    t.field(TopicType.category)
    t.field(TopicType.banner)
    t.field("subscribers", {
      type: "Int",
      resolve: async (parent, _arg, { prisma }: Context) => {
        return await prisma.subscription.count({
          where: { topicId: parent.id },
        })
      },
    })
    t.nullable.field("isSubscribed", {
      type: "Subscription",
      resolve: async (parent, _arg, { prisma, user }: Context) => {
        if (!user) {
          return null
        }
        const subscription = await prisma.subscription.findFirst({
          where: { userId: user.id, topicId: parent.id },
        })
        return subscription
      },
    })
    t.field("articleCount", {
      type: "Int",
      resolve: async (parent, _arg, { prisma }: Context) => {
        return await prisma.article.count({
          where: { topic: { id: parent.id } },
        })
      },
    })
    t.field(TopicType.createdAt)
    t.field(TopicType.updatedAt)
  },
})
