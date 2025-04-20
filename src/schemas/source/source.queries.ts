import { extendType } from "nexus"

export const sourceQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.field("sources", {
      type: "Source",
      resolve: async (_parent, _args, { prisma }) => {
        return await prisma.source.findMany()
      },
    })
    t.field("source", {
      type: "Source",
      args: {
        key: "String",
      },
      resolve: async (_parent, { key }, { prisma }) => {
        return await prisma.source.findUnique({
          where: { key },
        })
      },
    })
  },
})
