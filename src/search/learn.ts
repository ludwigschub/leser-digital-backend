import { exit } from "process"

import { Article, Source, Topic } from "@prisma/client"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import prisma from "../prismaClient"

import { learnSearchTerms } from "./learnSearchTerms"
import { rankSearchTerms } from "./rankSearchTerms"
(async () => {
  const argv = await yargs(hideBin(process.argv)).option("all", {
    type: "boolean",
    description: "Learn all search terms",
    default: false,
  }).argv
  let articles: Article[]
  if (argv.all) {
    articles = await prisma.article.findMany({
      where: {
        ranking: {
          is: null, // Only learn search terms for articles that have not been ranked yet
        },
      },
      include: {
        source: true,
        topic: true,
      },
      orderBy: {
        createdAt: "desc", // Order by most recent articles first
      },
    })
  } else {
    // Only learn search terms for articles created in the last 24 hours
    articles = await prisma.article.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // last 7 days
        },
        ranking: {
          is: null, // Only learn search terms for articles that have not been ranked yet
        },
      },
      include: {
        source: true,
        topic: true,
      },
    })
  }

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i] as Article & { topic: Topic; source: Source }
    console.debug(
      `Processing article ${i + 1}/${articles.length}: ${article.title}`
    )

    const searchTerms = await learnSearchTerms({ article })
    const termRankings = await rankSearchTerms(searchTerms)
    if (termRankings && termRankings.length) {
      console.debug(`Found ${termRankings.length} ranked search terms`)
      const existingArticleRanking = await prisma.articleRanking.findFirst({
        where: {
          articleId: article.id,
        },
      })
      const mentions = searchTerms.length
        ? Math.floor(
            termRankings
              .map((r) => r.mentions)
              .reduce((r, total) => total + r) / searchTerms.length
          )
        : 0
      if (!existingArticleRanking) {
        await prisma.articleRanking.create({
          data: {
            mentions,
            articleId: article.id,
            searchTerms: {
              connect: searchTerms.map((term) => ({ id: term.id })),
            },
          },
        })
        console.debug(
          `Ranked ${searchTerms.length} search terms for article ${article.title}: ${mentions}`
        )
      } else if (
        existingArticleRanking &&
        existingArticleRanking.mentions !== mentions
      ) {
        await prisma.articleRanking.update({
          data: {
            mentions,
            searchTerms: {
              connect: searchTerms.map((term) => ({ id: term.id })),
            },
          },
          where: {
            articleId: article.id,
          },
        })
        console.debug(
          `Ranked ${searchTerms.length} search terms for article: ${mentions}`
        )
      }
    }
  }
  exit()
})()
