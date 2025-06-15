import { Source, Subscription, User } from "@prisma/client"

import { executeQuery } from "../../../test/helpers"
import prisma from "../../prismaClient"

describe("Integration test for source methods", () => {
  const sourcesQuery = `
    query sources {
        sources {
            id
        }
    }
  `
  const sourceQuery = `
    query source($key: String!) {
        source(key: $key) {
            id
            isSubscribed {
                id
            }
            subscribers
            articleCount
        }
    }
  `
  let firstExampleUser: User | null

  beforeAll(async () => {
    firstExampleUser = await prisma.user.findFirst({
      where: { email: "test@example.com" },
    })
  })

  test("should return all sources", async () => {
    const response = await executeQuery(sourcesQuery, {})
    const sources = await prisma.source.findMany()
    expect((response.data?.sources as Source[]).length).toBe(sources.length)
  })

  test("should return a source by key", async () => {
    const source = await prisma.source.findFirst()
    const response = await executeQuery(sourceQuery, { key: source?.key })
    expect((response.data?.source as Source)?.id).toBe(source?.id)
  })

  test("should show the subscribers of a source", async () => {
    const firstSubscription = await prisma.subscription.findFirst({
      where: {
        source: { isNot: null },
        user: { email: firstExampleUser?.email },
      },
    })
    const source = await prisma.source.findFirst({
      where: { id: firstSubscription?.sourceId as string },
    })
    const subscribers = await prisma.subscription.count({
      where: { source: { id: firstSubscription?.sourceId as string } },
    })
    const response = await executeQuery(
      sourceQuery,
      {
        key: source?.key,
      },
      firstExampleUser?.email
    )
    expect(
      (response.data?.source as Source & { subscribers: number })?.subscribers
    ).toBe(subscribers)
    expect(
      (response.data?.source as Source & { isSubscribed: Subscription })
        ?.isSubscribed
    ).toBeDefined()
  })
  test("should show the article count of a source", async () => {
    const sourceWithArticles = await prisma.source.findMany({
      orderBy: { articles: { _count: "desc" } },
      include: { articles: true },
    })
    const sourceWithMostArticles = sourceWithArticles[0]
    const response = await executeQuery(sourceQuery, {
      key: sourceWithMostArticles.key,
    })
    expect(
      (response.data?.source as Source & { articleCount: number }).articleCount
    ).toBe(sourceWithMostArticles.articles.length)
  })
})
