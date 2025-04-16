import { rules } from "../../rules"

export const articleActivityQueries = {
  articleActivity: rules.isAuthenticated,
}

export const articleActivityMutations = {
  createArticleActivity: rules.isAuthenticated,
  deleteArticleActivity: rules.isAuthenticated,
}
