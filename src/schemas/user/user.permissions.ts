import { allow, and, not } from "graphql-shield"

import { rules } from "../../rules"

export const userQueryRules = {
  loggedIn: allow,
  users: and(rules.isAuthenticated, rules.isAdmin),
}

export const userMutationRules = {
  login: not(rules.isAuthenticated),
  refreshToken: not(rules.isAuthenticated),
  register: not(rules.isAuthenticated),
  logout: rules.isAuthenticated,
  sendResetLink: not(rules.isAuthenticated),
  resetPassword: not(rules.isAuthenticated),
}
