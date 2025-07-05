import { ArticleCategory, Subscription, Topic, User } from "@prisma/client"

import { executeQuery } from "../../../test/helpers"
import prisma from "../../prismaClient"

describe("Integration test for topic methods", () => {
  const topicsQuery = `
    query topics {
      topics {
        id
      }
    }
`
  const topicQuery = `
    query topic($category: ArticleCategory!) {
      topic(category: $category) {
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

  test("should return all topics with articles", async () => {
    const topics = await prisma.topic.findMany({
      where: { category: { not: ArticleCategory.UNKNOWN } },
      include: { articles: true },
    })
    const response = await executeQuery(topicsQuery, {})
    expect((response.data?.topics as Topic[]).length).toEqual(
      topics.filter((topic) => {
        return topic.articles.length !== 0
      }).length
    )
  })

  test("should return a specific topic by category", async () => {
    const topic = await prisma.topic.findFirst({
      where: { category: ArticleCategory.HEALTH },
      include: { articles: true },
    })
    const response = await executeQuery(topicQuery, {
      category: ArticleCategory.HEALTH,
    })
    expect((response.data?.topic as Topic).id).toEqual(topic?.id)
  })

  test("should show the subscribers of a source", async () => {
    const firstSubscription = await prisma.subscription.findFirst({
      where: {
        searchTerm: { topic: { isNot: null } },
        user: { email: firstExampleUser?.email },
      },
      include: { searchTerm: true },
    })
    const topic = await prisma.topic.findFirst({
      where: { id: firstSubscription?.searchTerm.topicId as string },
    })
    const subscribers = await prisma.subscription.count({
      where: {
        searchTerm: {
          topic: { id: firstSubscription?.searchTerm.topicId as string },
        },
      },
    })
    const response = await executeQuery(
      topicQuery,
      {
        category: topic?.category,
      },
      firstExampleUser?.email
    )
    expect(
      (response.data?.topic as Topic & { subscribers: number })?.subscribers
    ).toBe(subscribers)
    expect(
      (response.data?.topic as Topic & { isSubscribed: Subscription })
        ?.isSubscribed.id
    ).toBeDefined()
  })
  test("should show the article count of a source", async () => {
    const topicWithArticles = await prisma.topic.findMany({
      orderBy: { articles: { _count: "desc" } },
      include: { articles: true },
    })
    const topicWithMostArticles = topicWithArticles[0]
    const response = await executeQuery(topicQuery, {
      category: topicWithMostArticles.category,
    })
    expect(
      (response.data?.topic as Topic & { articleCount: number }).articleCount
    ).toBe(topicWithMostArticles.articles.length)
  })
})
