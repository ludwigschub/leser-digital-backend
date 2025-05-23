import { objectType } from "nexus"

export const SearchResult = objectType({
  name: "SearchResult",
  description: "Search result type",
  definition(t) {
    t.list.nonNull.field("articles", { type: "Article" })
    t.list.nonNull.field("topics", { type: "Topic" })
    t.list.nonNull.field("sources", { type: "Source" })
  },
})
