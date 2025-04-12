import { GraphQLError } from "graphql";
import { extendType } from "nexus";

import { Context } from "../../context";
import prisma from "../../prismaClient";

export const UserQueries = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("loggedIn", {
      type: "User",
      resolve: (_parent, _args, { user }: Context) => {
        if(!user) {
          throw new GraphQLError("Not logged in", {
            extensions: { code: "NOT_LOGGED_IN" },
          });
        }
        return user;
      },
    });
    t.list.field("users", {
      type: "User",
      resolve: async (_parent, _args) => {
        return await prisma.user.findMany();
      },
    });
  },
});
