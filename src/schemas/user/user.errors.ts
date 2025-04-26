import { GraphQLError } from "graphql"

export const UserNotLoggedInError = new GraphQLError("Not logged in", {
  extensions: { code: "NOT_LOGGED_IN" },
})
