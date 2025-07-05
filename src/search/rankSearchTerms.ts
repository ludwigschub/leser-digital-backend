import { SearchTerm, SearchTermRanking } from "@prisma/client"
import { deu, eng, removeStopwords } from "stopword"

import prisma from "../prismaClient"

import {
  getArticleSearchQuery,
  getSourceSearchQuery,
  getTopicSearchQuery,
} from "./queryFilter"

function getNGrams(words: string[], n: number): string[] {
  const ngrams: string[] = []
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(" "))
  }
  return ngrams
}

export function getMostFrequentTerms(text: string): string[] {
  const words = Array.from(
    text.matchAll(/\d{1,3}(?:[.,]\d{3})+|[\w.-]*[\w](?<![.-])/g),
    (m) => m[0]
  )
  const stopwords = [...deu, ...eng]
  const filteredWords = removeStopwords(words, stopwords)

  // Collect unigrams, bigrams, and trigrams
  const unigrams = filteredWords
  const bigrams = getNGrams(filteredWords, 2)
  const trigrams = getNGrams(filteredWords, 3)
  const fourgrams = getNGrams(filteredWords, 4)
  const fivegrams = getNGrams(filteredWords, 5)
  const sixgrams = getNGrams(filteredWords, 6)

  const allTerms = [
    ...unigrams,
    ...bigrams,
    ...trigrams,
    ...fourgrams,
    ...fivegrams,
    ...sixgrams,
  ]

  // Count frequencies
  const freqMap: Record<string, number> = {}
  for (const term of allTerms) {
    // Exclude if term is a number (including formatted numbers) or a single character
    if (
      /^\d+([.,]\d+)*$/.test(term) || // matches numbers like 100.000.000 or 1,000,000
      term.length === 1
    ) {
      continue
    }
    freqMap[term] = (freqMap[term] || 0) + 1
  }

  // Sort by frequency and return top N
  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term)
}

export const createOrUpdateRanking = async ({
  term,
  mentions,
}: {
  term: SearchTerm
  mentions: number
}): Promise<SearchTermRanking> => {
  const existingRanking = await prisma.searchTermRanking.findUnique({
    where: { searchTermId: term.id },
  })
  if (existingRanking && existingRanking.mentions !== mentions) {
    console.debug(
      `Updating ranking for term "${term.term}" with ${mentions} mentions`
    )
    return prisma.searchTermRanking.update({
      where: {
        searchTermId: term.id,
        forSourceId: term.sourceId,
        forTopicId: term.topicId,
      },
      data: { mentions },
    })
  } else if (!existingRanking) {
    console.debug(
      `Creating new ranking for term "${term.term}" with ${mentions} mentions`
    )
    return prisma.searchTermRanking.create({
      data: {
        searchTermId: term.id,
        mentions,
        forSourceId: term.sourceId,
        forTopicId: term.topicId,
      },
    })
  }
  return existingRanking
}

export const rankSearchTerms = async (
  searchTerms?: SearchTerm[]
): Promise<SearchTermRanking[] | undefined> => {
  searchTerms = searchTerms || []
  const rankings: SearchTermRanking[] = []
  for (let index = 0; index < searchTerms.length; index++) {
    const { term, sourceId, topicId } = searchTerms[index]

    if (term && !sourceId && !topicId) {
      const mentions = await prisma.article.count({
        where: getArticleSearchQuery(term),
      })
      rankings.push(
        await createOrUpdateRanking({
          term: searchTerms[index],
          mentions,
        })
      )
    }
    if (term && sourceId && !topicId) {
      const mentions = await prisma.article.count({
        where: getSourceSearchQuery(term, sourceId),
      })
      rankings.push(
        await createOrUpdateRanking({
          term: searchTerms[index],
          mentions,
        })
      )
    }
    if (term && !sourceId && topicId) {
      const mentions = await prisma.article.count({
        where: getTopicSearchQuery(term, topicId),
      })
      rankings.push(
        await createOrUpdateRanking({
          term: searchTerms[index],
          mentions,
        })
      )
    }
  }
  return rankings.sort((a, b) => b.mentions - a.mentions)
}
