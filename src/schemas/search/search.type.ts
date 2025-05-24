import { objectType } from "nexus"

export const SearchResult = objectType({
  name: "SearchResult",
  description: "Search result type",
  definition(t) {
    t.int("foundArticles")
    t.list.nonNull.field("articles", { type: "Article" })
    t.int("foundTopics")
    t.list.nonNull.field("topics", { type: "Topic" })
    t.int("foundSources")
    t.list.nonNull.field("sources", { type: "Source" })
  },
})
