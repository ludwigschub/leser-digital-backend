import { rules } from "../../rules"

export const topicQueryRules = {
  topics: rules.isAuthenticated,
}
