import { deny, shield } from "graphql-shield"

import { articleQueryRules } from "./schemas/article/article.permissions"
import {
  articleActivityMutationRules,
  articleActivityQueryRules,
} from "./schemas/articleActivity/articleActivity.permissions"
import { searchQueryRules } from "./schemas/search/search.permissions"
import { searchTermMutationRules, searchTermQueryRules } from "./schemas/searchTerm/searchTerm.permissions"
import { sourceQueryRules } from "./schemas/source/source.permissions"
import {
  subscriptionMutationRules,
  subscriptionQueryRules,
} from "./schemas/subscription/subscription.permission"
import { topicQueryRules } from "./schemas/topic/topic.permission"
import {
  userMutationRules,
  userQueryRules,
} from "./schemas/user/user.permissions"
import { verificationCodeMutationRules } from "./schemas/verificationCode/verificationCode.permissions"

export const permissions = shield(
  {
    Query: {
      "*": deny,
      ...userQueryRules,
      ...articleQueryRules,
      ...articleActivityQueryRules,
      ...sourceQueryRules,
      ...subscriptionQueryRules,
      ...topicQueryRules,
      ...searchQueryRules,
      ...searchTermQueryRules
    },
    Mutation: {
      "*": deny,
      ...userMutationRules,
      ...verificationCodeMutationRules,
      ...articleActivityMutationRules,
      ...subscriptionMutationRules,
      ...searchTermMutationRules
    },
  },
  { allowExternalErrors: true }
)
