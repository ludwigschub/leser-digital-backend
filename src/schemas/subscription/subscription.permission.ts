import { rules } from "../../rules"

export const subscriptionMutationRules = {
  createSubscription: rules.isAuthenticated,
  deleteSubscription: rules.isAuthenticated,
}

export const subscriptionQueryRules = {
  subscriptions: rules.isAuthenticated,
}
