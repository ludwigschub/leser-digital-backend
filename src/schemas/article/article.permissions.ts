import { allow } from "graphql-shield"

import { rules } from "../../rules"

export const articleQueryRules = {
  article: allow, // Anyone can read a single article
  feed: allow, // Anyone can read articles
  articles: allow, // Anyone can read articles
  mostViewedArticles: allow, // Anyone can read most viewed articles
  recommendedArticles: allow, // Must be authenticated to read saved articles
  savedArticles: rules.isAuthenticated, // Must be authenticated to read saved articles
  viewedArticles: rules.isAuthenticated, // Must be authenticated to read saved articles
}
