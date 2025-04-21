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
