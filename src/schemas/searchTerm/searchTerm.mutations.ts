import { extendType } from "nexus"

import { Context } from "../../context"

export const searchTermMutations = extendType({
  type: "Mutation",
  definition(t) {
    t.nullable.field("toggleSearchTerm", {
      type: "SearchTerm",
      args: {
        id: "String",
      },
      resolve: async (_parent, { id }, { prisma, user }: Context) => {
        if (user?.role === "ADMIN") {
          const searchTerm = await prisma.searchTerm.findUnique({
            where: { id },
          })
          return prisma.searchTerm.update({
            where: { id },
            data: {
              active: !searchTerm?.active,
            },
          })
        }
      },
    })
  },
})
