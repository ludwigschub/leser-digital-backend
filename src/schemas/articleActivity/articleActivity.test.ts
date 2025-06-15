import {
  ArticleActivity,
  ArticleActivityType,
  Source,
  User,
} from "@prisma/client"

import { executeQuery } from "../../../test/helpers"
import prisma from "../../prismaClient"

describe("Integration test for article activity methods", () => {
  const createArticleActivityMutation = `
        mutation createArticleActivity($data: ArticleActivityInput!) {
            createArticleActivity(data: $data) {
                id
            }
        }
    `
  const deleteArticleActivityMutation = `
        mutation deleteArticleActivity($id: String!) {
            deleteArticleActivity(id: $id) {
                id
            }
        }
    `
  const mySourceActivityStats = `
        query mySourceActivityStats {
            mySourceActivityStats {
                source {
                    id
                }
                views
            }
        }
    `
  const myTopicActivityStats = `
        query myTopicActivityStats {
            myTopicActivityStats {
                topic {
                    id
                }
                views
            }
        }
    `

  let firstExampleUser: User | null
  beforeAll(async () => {
    firstExampleUser = await prisma.user.findFirst({
      where: { email: "test@example.com" },
    })
  })

  test("should create an activity", async () => {
    const article = await prisma.article.findFirst()
    const data = {
      type: ArticleActivityType.VIEW_ARTICLE,
      articleId: article?.id,
    }
    const response = await executeQuery(
      createArticleActivityMutation,
      { data },
      firstExampleUser?.email
    )
    expect(
      (response.data?.createArticleActivity as ArticleActivity).id
    ).toBeDefined()
  })

  test("should show activity statistics for sources", async () => {
    const response = await executeQuery(
      mySourceActivityStats,
      {},
      firstExampleUser?.email
    )
    const viewedSource = await prisma.articleActivity.findFirst({
      where: { user: { email: firstExampleUser?.email } },
      include: { article: { include: { source: true } } },
    })
    expect(
      (response.data?.mySourceActivityStats as { source: Source }[]).find(
        (stat) => stat.source.id === viewedSource?.article.source.id
      )
    ).toBeTruthy()
  })

  test("should show activity statistics for topics", async () => {
    const response = await executeQuery(
      myTopicActivityStats,
      {},
      firstExampleUser?.email
    )
    const viewedTopic = await prisma.articleActivity.findFirst({
      where: { user: { email: firstExampleUser?.email } },
      include: { article: { include: { topic: true } } },
    })
    expect(
      (response.data?.myTopicActivityStats as { topic: { id: string } }[]).find(
        (stat) => stat.topic.id === viewedTopic?.article.topic.id
      )
    ).toBeTruthy()
  })

  test("should delete an activity", async () => {
    const articleActivity = await prisma.articleActivity.findFirst()
    const response = await executeQuery(
      deleteArticleActivityMutation,
      { id: articleActivity?.id },
      firstExampleUser?.email
    )
    expect(
      (response.data?.deleteArticleActivity as ArticleActivity).id
    ).toBeDefined()
  })
})
