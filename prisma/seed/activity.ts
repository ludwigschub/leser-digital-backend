import { Article, ArticleActivityType } from "@prisma/client"

import prisma from "../../src/prismaClient"

export const seedActivities = async (
  article: Article,
  email: string
): Promise<void> => {
  await prisma.articleActivity.create({
    data: {
      article: { connect: { id: article.id } },
      user: { connect: { email } },
      type: ArticleActivityType.VIEW_ARTICLE,
    },
  })
  await prisma.articleActivity.create({
    data: {
      article: { connect: { id: article.id } },
      user: { connect: { email } },
      type: ArticleActivityType.SAVE_ARTICLE,
    },
  })
}
