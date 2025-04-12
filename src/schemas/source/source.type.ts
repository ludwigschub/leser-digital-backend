import { objectType } from "nexus"
import { Source as SourceType } from "nexus-prisma"

export const Source = objectType({
  name: SourceType.$name,
  description: SourceType.$description,
  definition(t) {
    t.field(SourceType.id)
    t.field(SourceType.name)
    t.field(SourceType.key)
    t.field(SourceType.logo)
    t.field(SourceType.feedUrl)
    t.field(SourceType.createdAt)
    t.field(SourceType.updatedAt)
    t.field(SourceType.articles)
    t.field(SourceType.editors)
  },
})
