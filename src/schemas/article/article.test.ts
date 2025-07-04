import {
    Article,
    ArticleActivity,
    ArticleActivityType,
    Topic,
    User,
} from "@prisma/client"

import { executeQuery } from "../../../test/helpers"
import prisma from "../../prismaClient"

import { getArticleSubscriptionsFilter } from "./article.queries"

describe("Integration test for article methods", () => {
  const mostInterestingArticlesQuery = `
      query mostInterestingArticles {
        mostInterestingArticles {
          id
          title
        }
      }
    `
  const articlesQuery = `
      query articles($filter: ArticleQueryFilter) {
        articles(filter: $filter) {
          id
        }
      }
    `
  const articleQuery = `
      query article($id: String!) {
        article(id: $id) {
          id
          activity {
            id
          }
          views
        }
      }
    `
  const feedQuery = `
      query feed {
        feed {
          id
        }
      }
    `
  const savedArticlesQuery = `
      query savedArticles($filter: ArticlesQueryFilter) {
        savedArticles(filter: $filter) {
          id
        }
      }
    `
  const viewedArticlesQuery = `
      query viewedArticles($filter: ArticlesQueryFilter) {
        viewedArticles(filter: $filter) {
          id
        }
      }
    `
  const recommendedArticlesQuery = `
      query recommendedArticles {
        recommendedArticles {
          id
        }
      }
    `

  let firstArticle: Article | null | undefined
  let secondArticle: Article | null | undefined
  let firstExampleUser: User | null | undefined
  let secondExampleUser: User | null | undefined

  beforeAll(async () => {
    firstArticle = await prisma.article.findFirst({
      where: { title: "Example Article" },
      include: { topic: true },
    })
    secondArticle = await prisma.article.findFirst({
      where: { title: "Example Article 2" },
    })
    firstExampleUser = await prisma.user.findFirst({
      where: { email: "test@example.com" },
      include: { subscriptions: true },
    })
    secondExampleUser = await prisma.user.findFirst({
      where: { email: "admin@example.com" },
    })
    await prisma.articleActivity.createMany({
      data: [
        {
          articleId: firstArticle!.id,
          userId: firstExampleUser!.id,
          type: ArticleActivityType.VIEW_ARTICLE,
        },
        {
          articleId: secondArticle!.id,
          userId: firstExampleUser!.id,
          type: ArticleActivityType.VIEW_ARTICLE,
        },
        {
          articleId: firstArticle!.id,
          userId: secondExampleUser!.id,
          type: ArticleActivityType.VIEW_ARTICLE,
        },
        {
          articleId: firstArticle!.id,
          userId: firstExampleUser!.id,
          type: ArticleActivityType.SAVE_ARTICLE,
        },
      ],
    })
    await prisma.article.update({
      where: { id: firstArticle!.id },
      data: { recommended: true },
    })
  })

  afterAll(async () => {
    await prisma.articleActivity.deleteMany({
      where: {
        articleId: firstArticle?.id,
        userId: firstExampleUser?.id,
      },
    })
    await prisma.article.update({
      where: { id: firstArticle?.id },
      data: { recommended: false },
    })
  })

  test("articles should not return any articles without a filter", async () => {
    const response = await executeQuery(articlesQuery, {})
    expect((response.data?.articles as Article[]).length).toBe(0)
  })

  test("articles should be searchable", async () => {
    const source = await prisma.source.findFirst({
      where: { id: firstArticle?.sourceId },
    })
    const sourceResponse = await executeQuery(articlesQuery, {
      filter: { source: source?.key },
    })
    const sourceArticles = await prisma.article.findMany({
      where: { sourceId: firstArticle?.sourceId },
    })
    expect((sourceResponse.data?.articles as Article[]).length).toBe(
      sourceArticles.length
    )
  })

  test("article should return a specific article", async () => {
    const response = await executeQuery(articleQuery, {
      id: firstArticle?.id,
    })
    const views = await prisma.articleActivity.count({
      where: {
        articleId: firstArticle?.id,
        type: ArticleActivityType.VIEW_ARTICLE,
      },
    })
    expect((response.data?.article as Article).id).toBe(firstArticle?.id)
    expect(
      (response.data?.article as Article & { activity: ArticleActivity[] })
        .activity
    ).toBeNull()
    expect((response.data?.article as Article & { views: number }).views).toBe(
      views
    )

    const authenticatedResponse = await executeQuery(
      articleQuery,
      { id: firstArticle?.id },
      firstExampleUser?.email
    )
    expect(
      (
        authenticatedResponse.data?.article as Article & {
          activity: ArticleActivity[]
        }
      ).activity
    ).toBeDefined()
  })

  test("feed should return all articles with no user", async () => {
    const response = await executeQuery(feedQuery, {})
    const feedArticles = await prisma.article.findMany({take: 10})
    expect((response.data?.feed as Article[]).length).toBeDefined()
    expect((response.data?.feed as Article[]).length).toBe(feedArticles.length)
  })

  test("feed should return articles for the user", async () => {
    const response = await executeQuery(feedQuery, {}, firstExampleUser?.email)
    const userSubscriptions = await prisma.subscription.findMany({
      where: { user: { id: firstExampleUser?.id } },
    })
    const feedArticles = await prisma.article.findMany({
      where: {
        ...getArticleSubscriptionsFilter(userSubscriptions),
      },
    })
    expect((response.data?.feed as Article[]).length).toBeDefined()
    expect((response.data?.feed as Article[]).length).toBe(feedArticles.length)

    const emptyResponse = await executeQuery(
      feedQuery,
      {},
      secondExampleUser?.email
    )
    const emptyFeedArticles = await prisma.article.findMany()
    expect((emptyResponse.data?.feed as Article[]).length).toBe(
      emptyFeedArticles.length
    )
  })

  test("viewedArticles should return viewed articles", async () => {
    const response = await executeQuery(
      viewedArticlesQuery,
      {},
      firstExampleUser?.email
    )
    const viewedArticles = await prisma.articleActivity
      .findMany({
        where: {
          userId: firstExampleUser?.id,
          type: ArticleActivityType.VIEW_ARTICLE,
        },
        include: { article: true },
      })
      .then((activities) => {
        return activities.map((activity) => activity.article)
      })
    expect((response.data?.viewedArticles as Article[]).length).toBe(
      viewedArticles.length
    )
  })
  test("viewedArticles should be searchable by category", async () => {
    const categoryFilter = (firstArticle as Article & { topic: Topic }).topic
      .category
    const response = await executeQuery(
      viewedArticlesQuery,
      {
        filter: {
          category: categoryFilter,
        },
      },
      firstExampleUser?.email
    )
    const viewedArticles = await prisma.articleActivity
      .findMany({
        where: {
          userId: firstExampleUser?.id,
          type: ArticleActivityType.VIEW_ARTICLE,
          article: {
            topic: {
              category: categoryFilter,
            },
          },
        },
        include: { article: true },
      })
      .then((activities) => {
        return activities.map((activity) => activity.article)
      })
    expect((response.data?.viewedArticles as Article[]).length).toBe(
      viewedArticles.length
    )
  })

  test("viewedArticles should be searchable by term", async () => {
    const query = "article 2"
    const response = await executeQuery(
      viewedArticlesQuery,
      {
        filter: { query },
      },
      firstExampleUser?.email
    )
    const viewedArticles = await prisma.articleActivity
      .findMany({
        where: {
          userId: firstExampleUser?.id,
          type: ArticleActivityType.VIEW_ARTICLE,
          article: {
            OR: [
              { title: { contains: query?.trim(), mode: "insensitive" } },
              {
                description: {
                  contains: query?.trim(),
                  mode: "insensitive",
                },
              },
              {
                source: {
                  name: { contains: query?.trim(), mode: "insensitive" },
                },
              },
            ],
          },
        },
        include: { article: true },
      })
      .then((activities) => {
        return activities.map((activity) => activity.article)
      })
    expect((response.data?.viewedArticles as Article[]).length).toBeTruthy()
    expect((response.data?.viewedArticles as Article[]).length).toBe(
      viewedArticles.length
    )
  })

  test("savedArticles should return saved articles", async () => {
    const response = await executeQuery(
      savedArticlesQuery,
      {},
      firstExampleUser?.email
    )
    const savedArticles = await prisma.articleActivity
      .findMany({
        where: {
          userId: firstExampleUser?.id,
          type: ArticleActivityType.SAVE_ARTICLE,
        },
        include: { article: true },
      })
      .then((activities) => {
        return activities.map((activity) => activity.article)
      })
    expect((response.data?.savedArticles as Article[]).length).toBe(
      savedArticles.length
    )
  })

  test("savedArticles should be searchable by category", async () => {
    const categoryFilter = (firstArticle as Article & { topic: Topic }).topic
      .category
    const response = await executeQuery(
      savedArticlesQuery,
      {
        filter: {
          category: categoryFilter,
        },
      },
      firstExampleUser?.email
    )
    const savedArticles = await prisma.articleActivity
      .findMany({
        where: {
          userId: firstExampleUser?.id,
          type: ArticleActivityType.SAVE_ARTICLE,
          article: {
            topic: {
              category: categoryFilter,
            },
          },
        },
        include: { article: true },
      })
      .then((activities) => {
        return activities.map((activity) => activity.article)
      })
    expect((response.data?.savedArticles as Article[]).length).toBe(
      savedArticles.length
    )
  })

  test("savedArticles should be searchable by term", async () => {
    const query = "article 2"
    const response = await executeQuery(
      savedArticlesQuery,
      {
        filter: { query },
      },
      firstExampleUser?.email
    )
    const savedArticles = await prisma.articleActivity
      .findMany({
        where: {
          userId: firstExampleUser?.id,
          type: ArticleActivityType.SAVE_ARTICLE,
          article: {
            OR: [
              { title: { contains: query?.trim(), mode: "insensitive" } },
              {
                description: {
                  contains: query?.trim(),
                  mode: "insensitive",
                },
              },
              {
                source: {
                  name: { contains: query?.trim(), mode: "insensitive" },
                },
              },
            ],
          },
        },
        include: { article: true },
      })
      .then((activities) => {
        return activities.map((activity) => activity.article)
      })
    expect((response.data?.savedArticles as Article[]).length).toBeTruthy()
    expect((response.data?.savedArticles as Article[]).length).toBe(
      savedArticles.length
    )
  })

  test("recommendedArticles should return recommended articles", async () => {
    const response = await executeQuery(
      recommendedArticlesQuery,
      {},
      firstExampleUser?.email
    )
    const recommendedArticles = await prisma.article.findMany({
      where: { recommended: true },
    })
    expect((response.data?.recommendedArticles as Article[]).length).toBe(
      recommendedArticles.length
    )
  })

  test("mostInterestingArticles should return most viewed articles", async () => {
    const response = await executeQuery(mostInterestingArticlesQuery, {})
    const articles = await prisma.article.findMany({
      where: {
        activity: {
          some: {
            type: ArticleActivityType.VIEW_ARTICLE,
          },
        },
      },
      include: {
        _count: {
          select: {
            activity: { where: { type: ArticleActivityType.VIEW_ARTICLE } },
          },
        },
      },
      orderBy: {
        activity: {
          _count: "desc",
        },
      },
    })

    expect((response.data?.mostInterestingArticles as Article[])[0]?.id).toBe(
      articles[0]?.id
    )
    expect((response.data?.mostInterestingArticles as Article[])[1]?.id).toBe(
      articles[1]?.id
    )
  })
})
