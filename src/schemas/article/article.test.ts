import { Article, ArticleActivityType, User } from "@prisma/client"
import { executeQuery } from "../../../test/helpers"
import prisma from "../../prismaClient"

describe("Integration test for article methods", () => {
  const mostViewedArticlesQuery = `
      query mostViewedArticles {
        mostViewedArticles {
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
      ],
    })
  })

  test("mostViewedArticles should return most viewed articles", async () => {
    const response = await executeQuery(mostViewedArticlesQuery, {})

    expect((response.data?.mostViewedArticles as Article[])[0]?.id).toBe(
      firstArticle?.id
    )
    expect((response.data?.mostViewedArticles as Article[])[1]?.id).toBe(
      secondArticle?.id
    )
  })
})
