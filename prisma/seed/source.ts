import { Prisma } from "@prisma/client"

import prisma from "../../src/prismaClient"

const ZEIT_RSS_FEED = "https://newsfeed.zeit.de/index"
const SPIEGEL_RSS_FEED = "https://www.spiegel.de/schlagzeilen/index.rss"

const getSources = (): Prisma.SourceCreateInput[] => [
  {
    key: "zeit",
    name: "ZEIT ONLINE",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/98/Logo_Zeit_Online_2017.svg",
    feedUrl: ZEIT_RSS_FEED,
  },
  {
    key: "spiegel",
    name: "SPIEGEL Online",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Logo-der_spiegel.svg",
    feedUrl: SPIEGEL_RSS_FEED,
  },
]

export const seedSources = async () => {
  const sources = getSources()
  return await Promise.all(
    sources.map((source) => {
      return prisma.source.create({ data: source })
    })
  )
}
