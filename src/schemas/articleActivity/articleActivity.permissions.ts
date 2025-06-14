import { rules } from "../../rules"

export const articleActivityQueryRules = {
  mySourceActivityStats: rules.isAuthenticated,
  myTopicActivityStats: rules.isAuthenticated,
}

export const articleActivityMutationRules = {
  createArticleActivity: rules.isAuthenticated,
  deleteArticleActivity: rules.isAuthenticated,
}
