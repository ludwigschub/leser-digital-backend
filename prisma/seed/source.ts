import prisma from "../../src/prismaClient"

const ZEIT_RSS_FEED = "https://newsfeed.zeit.de/index"
const SPIEGEL_RSS_FEED = "https://www.spiegel.de/schlagzeilen/index.rss"

const getSources = async () => [
  {
    key: "zeit",
    name: "ZEIT ONLINE",
    icon: "https://static.zeit.de/p/zeit.web/icons/favicon.svg",
    feedUrl: ZEIT_RSS_FEED,
  },
  {
    key: "spiegel",
    name: "SPIEGEL Online",
    icon: "https://cdn.prod.www.spiegel.de/public/spon/images/icons/favicon.ico",
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
