import { allow } from "graphql-shield"

import { rules } from "../../rules"

export const searchTermQueryRules = {
  searchTerm: allow,
  searchTerms: allow,
  allSearchTerms: rules.isAdmin,
}

export const searchTermMutationRules = {
  toggleSearchTerm: rules.isAdmin,
}