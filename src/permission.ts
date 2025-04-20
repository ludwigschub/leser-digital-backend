import { deny, shield } from "graphql-shield"

import { rules } from "./rules"
import { articleQueryRules } from "./schemas/article/article.permissions"
import {
  articleActivityMutations,
  articleActivityQueries,
} from "./schemas/articleActivity/articleActivity.permissions"
import { sourceQueryRules } from "./schemas/source/source.permissions"
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
      ...articleActivityQueries,
      ...sourceQueryRules,
    },
    Mutation: {
      "*": deny,
      ...userMutationRules,
      ...verificationCodeMutationRules,
      ...articleActivityMutations,
    },
  },
  { allowExternalErrors: true }
)
