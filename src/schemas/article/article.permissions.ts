import { allow } from "graphql-shield"

export const articleQueryRules = {
  articles: allow, // Anyone can read articles
  mostViewedArticles: allow, // Anyone can read most viewed articles
}
