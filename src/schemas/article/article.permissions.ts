import { allow } from "graphql-shield"

export const articleQueryRules = {
  articles: allow, // Anyone can read articles
}
