import { deny, shield } from "graphql-shield"

import { rules } from "./rules"
import {
  userMutationRules,
  userQueryRules,
} from "./schemas/user/user.permissions"
import { verificationCodeMutationRules } from "./schemas/verificationCode/verificationCode.permissions"

export const permissions = shield(
  {
    Query: { "*": rules.isAuthenticated, ...userQueryRules },
    Mutation: {
      "*": deny,
      ...userMutationRules,
      ...verificationCodeMutationRules,
    },
  },
  { allowExternalErrors: true }
)
