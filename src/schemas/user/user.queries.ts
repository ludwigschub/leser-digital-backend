import { extendType } from "nexus"

import { Context } from "../../context"
import prisma from "../../prismaClient"

import { UserNotLoggedInError } from "./user.errors"

export const UserQueries = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("loggedIn", {
      type: "User",
      resolve: (_parent, _args, { user }: Context) => {
        if (!user) {
          throw UserNotLoggedInError
        }
        return user
      },
    })
    t.list.field("users", {
      type: "User",
      resolve: async (_parent, _args) => {
        return await prisma.user.findMany()
      },
    })
  },
})
