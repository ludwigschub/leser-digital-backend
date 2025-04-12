import prisma from "../../src/prismaClient"

const ZEIT_RSS_FEED = "https://newsfeed.zeit.de/index"
const SPIEGEL_RSS_FEED = "https://www.spiegel.de/schlagzeilen/index.rss"

const getSources = async () => [
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
  const sources = await getSources()
  await Promise.all(
    sources.map(async (source) => {
      await prisma.source.create({ data: source })
    })
  )
}
