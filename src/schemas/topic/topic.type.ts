import { objectType } from "nexus"
import { Topic as TopicType } from "nexus-prisma"

export const Topic = objectType({
  name: TopicType.$name,
  description: TopicType.$description,
  definition(t) {
    t.field(TopicType.id)
    t.field(TopicType.name)
    t.field(TopicType.category)
    t.field(TopicType.banner)
    t.field(TopicType.createdAt)
    t.field(TopicType.updatedAt)
  },
})
