import { Role } from "@prisma/client"
import { rule } from "graphql-shield"


export const roleRules = {
  isAdmin: rule()(async (_root, _args, { user }) => {
    return user.role === Role.ADMIN
  }),
}
