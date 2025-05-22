import { allow } from "graphql-shield"

export const articleQueryRules = {
  article: allow, // Anyone can read a single article
  feed: allow, // Anyone can read articles
  articles: allow, // Anyone can read articles
  mostViewedArticles: allow, // Anyone can read most viewed articles
}
