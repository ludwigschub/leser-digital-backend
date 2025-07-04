import { Article, SearchTerm, Source, Topic } from "@prisma/client"

import prisma from "../prismaClient"

import {
  getArticleSearchQuery,
  getSourceSearchQuery,
  getTopicSearchQuery,
} from "./queryFilter"
import { getMostFrequentTerms } from "./rankSearchTerms"

const replaceSpecialChars = (term: string) => {
  return term
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
}

export const learnSearchTerms = async ({
  article,
  minimum = 50,
}: {
  article: Article & { topic: Topic; source: Source }
  minimum?: number
}): Promise<SearchTerm[]> => {
  const articleText = `${article?.title} ${article?.description}`
  const mostFrequentTerms = getMostFrequentTerms(
    replaceSpecialChars(articleText)
  )
  const allTerms: SearchTerm[] = []
  const newTerms: SearchTerm[] = []

  for (let i = 0; i < mostFrequentTerms.length; i++) {
    const term = mostFrequentTerms[i]
    // Index term for article search
    if (!term || term.length < 1) {
      continue
    }

    const existingTerm = await prisma.searchTerm.findFirst({
      where: { term: term },
      include: { ranking: true },
    })
    if (existingTerm) {
      allTerms.push(existingTerm)
    } else {
      const articlesFromTerm = await prisma.article.findMany({
        where: getArticleSearchQuery(term),
      })
      if (articlesFromTerm.length > minimum) {
        console.debug(`Creating search term: ${term}`)
        const createdTerm = await prisma.searchTerm.create({
          data: {
            term: term,
          },
        })
        newTerms.push(createdTerm)
      }
    }
    // Index term for topic search
    const existingTopicTerm = await prisma.searchTerm.findFirst({
      where: { term: term, topicId: article?.topicId },
      include: { ranking: true },
    })
    if (existingTopicTerm) {
      allTerms.push(existingTopicTerm)
    } else {
      const articlesFromSameTopic = await prisma.article.findMany({
        where: getTopicSearchQuery(term, article?.topicId as string),
      })
      if (articlesFromSameTopic.length > minimum) {
        console.debug(
          `Creating search term for ${article?.topic.name}: ${term}`
        )
        const createdTerm = await prisma.searchTerm.create({
          data: {
            term: term,
            topicId: article?.topicId,
          },
        })
        newTerms.push(createdTerm)
      }
    }
    // Index term for source search
    const existingSourceTerm = await prisma.searchTerm.findFirst({
      where: { term: term, sourceId: article?.sourceId },
      include: { ranking: true },
    })
    if (existingSourceTerm) {
      allTerms.push(existingSourceTerm)
    } else {
      const articlesFromSameSource = await prisma.article.findMany({
        where: getSourceSearchQuery(term, article?.sourceId as string),
      })
      if (articlesFromSameSource.length > minimum) {
        console.debug(
          `Creating search term for ${article?.source.name}: ${term}`
        )
        await prisma.searchTerm
          .create({
            data: {
              term: term,
              sourceId: article?.sourceId,
            },
          })
          .then((createdTerm) => {
            newTerms.push(createdTerm)
          })
      }
    }
  }
  return [...allTerms, ...newTerms]
    .flat()
    .filter((term) => term.term !== undefined)
}
