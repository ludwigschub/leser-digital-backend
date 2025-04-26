import { objectType } from "nexus"
import { Subscription as SubscriptionType } from "nexus-prisma"

export const Subscription = objectType({
  name: SubscriptionType.$name,
  description: SubscriptionType.$description,
  definition(t) {
    t.field(SubscriptionType.id)
    t.field(SubscriptionType.source)
    t.field(SubscriptionType.editor)
    t.field(SubscriptionType.category)
    t.field(SubscriptionType.createdAt)
    t.field(SubscriptionType.updatedAt)
  },
})
