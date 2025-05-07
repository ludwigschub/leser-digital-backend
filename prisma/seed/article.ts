import { Prisma, Source, Topic } from "@prisma/client"

import prisma from "../../src/prismaClient"

export const getArticles = (
  source: Source,
  topic: Topic
): Prisma.ArticleCreateInput[] => [
  {
    title: "Example Article",
    description: "Example description",
    url: "https://example.com",
    image: "https://picsum.photos/1000",
    uploadedAt: new Date(),
    source: { connect: { id: source.id } },
    topic: { connect: { id: topic.id } },
  },
  {
    title: "Example Article 2",
    description: "Example description",
    url: "https://example.com",
    image: "https://picsum.photos/1000",
    uploadedAt: new Date(),
    source: { connect: { id: source.id } },
    topic: { connect: { id: topic.id } },
  },
  {
    title: "Example Article 3",
    description: "Example description",
    url: "https://example.com",
    image: "https://picsum.photos/1000",
    uploadedAt: new Date(),
    source: { connect: { id: source.id } },
    topic: { connect: { id: topic.id } },
  },
]

export const seedArticles = async (source: Source, topic: Topic) => {
  const articles = await getArticles(source, topic)
  await Promise.all(
    articles.map(async (article) => {
      await prisma.article.create({ data: article })
    })
  )
}
