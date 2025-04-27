import { rules } from "../../rules"

export const articleActivityQueryRules = {
  articleActivity: rules.isAuthenticated,
}

export const articleActivityMutationRules = {
  createArticleActivity: rules.isAuthenticated,
  deleteArticleActivity: rules.isAuthenticated,
}
