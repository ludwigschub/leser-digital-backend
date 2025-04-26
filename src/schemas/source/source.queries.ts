import { extendType } from "nexus"

import { Context } from "../../context"

export const sourceQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.nonNull.field("sources", {
      type: "Source",
      resolve: async (_parent, _args, { prisma }: Context) => {
        return await prisma.source.findMany({ orderBy: { id: "asc" } })
      },
    })
    t.field("source", {
      type: "Source",
      args: {
        key: "String",
      },
      resolve: async (_parent, { key }, { prisma }: Context) => {
        return await prisma.source.findUnique({
          where: { key },
        })
      },
    })
  },
})
