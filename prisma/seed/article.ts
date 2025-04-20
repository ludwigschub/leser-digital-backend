import { ArticleCategory, Prisma, Source } from "@prisma/client"

import prisma from "../../src/prismaClient"

export const getArticles = (source: Source): Prisma.ArticleCreateInput[] => [
  {
    title: "Example Article",
    description: "Example description",
    url: "https://example.com",
    image: "https://picsum.photos/1000",
    uploadedAt: new Date(),
    source: { connect: { id: source.id } },
    category: ArticleCategory.ENTERTAINMENT,
  },
  {
    title: "Example Article 2",
    description: "Example description",
    url: "https://example.com",
    image: "https://picsum.photos/1000",
    uploadedAt: new Date(),
    source: { connect: { id: source.id } },
    category: ArticleCategory.ENTERTAINMENT,
  },
  {
    title: "Example Article 3",
    description: "Example description",
    url: "https://example.com",
    image: "https://picsum.photos/1000",
    uploadedAt: new Date(),
    source: { connect: { id: source.id } },
    category: ArticleCategory.ENTERTAINMENT,
  },
]

export const seedArticles = async (source: Source) => {
  const articles = await getArticles(source)
  await Promise.all(
    articles.map(async (article) => {
      await prisma.article.create({ data: article })
    })
  )
}
