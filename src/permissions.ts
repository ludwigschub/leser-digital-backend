import { deny, shield } from "graphql-shield"

import { rules } from "./rules"
import { articleQueryRules } from "./schemas/article/article.permissions"
import {
  articleActivityMutationRules,
  articleActivityQueryRules,
} from "./schemas/articleActivity/articleActivity.permissions"
import { sourceQueryRules } from "./schemas/source/source.permissions"
import { subscriptionMutationRules, subscriptionQueryRules } from "./schemas/subscription/subscription.permission"
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
      ...articleActivityQueryRules,
      ...sourceQueryRules,
      ...subscriptionQueryRules,
    },
    Mutation: {
      "*": deny,
      ...userMutationRules,
      ...verificationCodeMutationRules,
      ...articleActivityMutationRules,
      ...subscriptionMutationRules
    },
  },
  { allowExternalErrors: true }
)
