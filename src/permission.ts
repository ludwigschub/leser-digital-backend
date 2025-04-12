import { deny, shield } from "graphql-shield"

import { rules } from "./rules"
import { articleQueryRules } from "./schemas/article/article.permissions"
import {
  userMutationRules,
  userQueryRules,
} from "./schemas/user/user.permissions"
import { verificationCodeMutationRules } from "./schemas/verificationCode/verificationCode.permissions"

export const permissions = shield(
  {
    Query: {
      "*": rules.isAuthenticated,
      ...userQueryRules,
      ...articleQueryRules,
    },
    Mutation: {
      "*": deny,
      ...userMutationRules,
      ...verificationCodeMutationRules,
    },
  },
  { allowExternalErrors: true }
)
