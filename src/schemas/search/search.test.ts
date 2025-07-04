import { Article, ArticleCategory, Source, Topic } from "@prisma/client"

import { executeQuery } from "../../../test/helpers"
import prisma from "../../prismaClient"

describe("Integration test for search methods", () => {
  const searchQuery = `
        query search($query: String!) {
            search(query: $query) {
                articles {
                    id
                }
                foundArticles
                sources {
                    id
                }
                foundSources
                topics {
                    id
                }
                foundTopics
            }
        }
    `

  test("should return search results for a valid query", async () => {
    const query = "e"
    const response = await executeQuery(searchQuery, { query })
    const foundArticles = await prisma.article.count({
      where: { title: { contains: query, mode: "insensitive" } },
    })
    const foundSources = await prisma.source.count({
      where: { name: { contains: query, mode: "insensitive" } },
    })
    const foundTopics = await prisma.topic.count({
      where: {
        AND: [
          { name: { contains: query, mode: "insensitive" } },
          { category: { not: ArticleCategory.UNKNOWN } },
        ],
      },
    })

    expect(response.data).toBeDefined()
    expect(response.data?.search).toBeDefined()
    expect(
      (response.data?.search as { articles: Article[] })?.articles.length
    ).toBeDefined()
    expect(
      (response.data?.search as { foundArticles: number })?.foundArticles
    ).toBe(foundArticles)
    expect(
      (response.data?.search as { sources: Source[] })?.sources.length
    ).toBe(foundSources)
    expect(
      (response.data?.search as { foundSources: number })?.foundSources
    ).toBe(foundSources)
    expect((response.data?.search as { topics: Topic[] })?.topics.length).toBe(
      foundTopics
    )
    expect(
      (response.data?.search as { foundTopics: number })?.foundTopics
    ).toBe(foundTopics)
  })
})
