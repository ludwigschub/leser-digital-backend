import {
  Article,
  ArticleActivity,
  ArticleActivityType,
  User,
} from "@prisma/client"

import { executeQuery } from "../../../test/helpers"
import prisma from "../../prismaClient"

import { getArticleSubscriptionsFilter } from "./article.queries"

describe("Integration test for article methods", () => {
  const mostViewedArticlesQuery = `
      query mostViewedArticles {
        mostViewedArticles {
          id
          title
        }
      }
    `
  const articlesQuery = `
      query articles {
        articles {
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
      query savedArticles {
        savedArticles {
          id
        }
      }
    `
  const viewedArticlesQuery = `
      query viewedArticles {
        viewedArticles {
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

  test("articles should return all articles", async () => {
    const response = await executeQuery(articlesQuery, {})
    const articles = await prisma.article.findMany()
    expect((response.data?.articles as Article[]).length).toBe(articles.length)
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

  test("savedArticles should return saved articles", async () => {
    const response = await executeQuery(
      savedArticlesQuery,
      {},
      firstExampleUser?.email
    )
    expect((response.data?.savedArticles as Article[])[0]?.id).toBe(
      firstArticle?.id
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

  test("mostViewedArticles should return most viewed articles", async () => {
    const response = await executeQuery(mostViewedArticlesQuery, {})
    const articles = await prisma.article.findMany({
      include: { activity: true },
    })
    const sortedArticles = articles.sort((a, b) => {
      const aViews = a.activity.filter(
        (activity) => activity.type === ArticleActivityType.VIEW_ARTICLE
      ).length
      const bViews = b.activity.filter(
        (activity) => activity.type === ArticleActivityType.VIEW_ARTICLE
      ).length
      return bViews - aViews
    })
    expect((response.data?.mostViewedArticles as Article[])[0]?.id).toBe(
      sortedArticles[0]?.id
    )
    expect((response.data?.mostViewedArticles as Article[])[1]?.id).toBe(
      sortedArticles[1]?.id
    )
  })
})
