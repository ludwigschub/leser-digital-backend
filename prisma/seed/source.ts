import { Prisma } from "@prisma/client"

import prisma from "../../src/prismaClient"

import {
  HANDELSBLATT_RSS_FEEDS,
  MANAGER_RSS_FEEDS,
  SPIEGEL_RSS_FEEDS,
  SPORTSCHAU_RSS_FEEDS,
  T3N_RSS_FEEDS,
  TAGESSCHAU_RSS_FEEDS,
  TECHCRUNCH_RSS_FEEDS,
  ZEIT_RSS_FEEDS,
} from "./rss-feeds"

const getSources = (): Prisma.SourceCreateInput[] => [
  {
    key: "zeit",
    name: "ZEIT ONLINE",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/98/Logo_Zeit_Online_2017.svg",
    feeds: ZEIT_RSS_FEEDS,
    banner:
      "https://img.zeit.de/2019/32/artenschutz-insektensterben/wide__1000x562__desktop__scale_2",
  },
  {
    key: "spiegel",
    name: "SPIEGEL Online",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Spiegel-Online-Logo.svg",
    feeds: SPIEGEL_RSS_FEEDS,
    banner:
      "https://cdn.prod.www.spiegel.de/images/e25af6a8-edb3-4a58-b98c-8af73a7ae51d_w520_r0.93_fpx49_fpy50.jpg",
  },
  {
    key: "manager",
    name: "Manager Magazin",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Manager_magazin_logo.svg",
    feeds: MANAGER_RSS_FEEDS,
    banner:
      // eslint-disable-next-line max-len
      "https://cdn.prod.www.manager-magazin.de/images/45cadac4-8169-4559-9228-9e3d290bcf9b_w1920_r1.778_fpx61.4_fpy45.webp",
  },
  {
    key: "tagesschau",
    name: "Tagesschau",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Tagesschau_Logo_2015.svg",
    feeds: TAGESSCHAU_RSS_FEEDS,
    banner:
      // eslint-disable-next-line max-len
      "https://images.tagesschau.de/image/fd8a4d30-5c1a-433c-97ef-25e56159ecea/AAABleSc7cg/AAABkZLpihI/20x9-1280/tagesschau-studio-sen-100.jpg",
  },
  {
    key: "t3n",
    name: "T3N Magazin",
    logo: "https://companieslogo.com/img/orig/t3n-de-ee06da85.svg",
    feeds: T3N_RSS_FEEDS,
    banner:
      "https://images.t3n.de/news/wp-content/uploads/2025/02/calm-technology.jpg?class=hero",
  },
  {
    key: "handelsblatt",
    name: "Handelsblatt",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Handelsblatt_201x_logo.svg",
    feeds: HANDELSBLATT_RSS_FEEDS,
    banner:
      "https://images.handelsblatt.com/wDgf21980cZx/cover/1600/1067/200/200/0/0/0.5/0.5/dax-sentiment.avif",
  },
  {
    key: "sportschau",
    name: "Sportschau",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Sportschau_2009.svg",
    feeds: SPORTSCHAU_RSS_FEEDS,
    banner:
      // eslint-disable-next-line max-len
      "https://images.sportschau.de/image/7c3d9c4e-75fd-43a5-b088-e5bf397c5083/AAABlmceYoI/AAABkZLpihI/20x9-1280/thomas-mueller-396.webp",
  },
  {
    key: "techcrunch",
    name: "TechCrunch",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b9/TechCrunch_logo.svg",
    feeds: TECHCRUNCH_RSS_FEEDS,
    banner:
      "https://techcrunch.com/wp-content/uploads/2023/09/53204393660_7e9d0c9a0d_k.jpg",
  },
]

export const seedSources = async () => {
  const sources = getSources()
  return await Promise.all(
    sources.map((source) => {
      return prisma.source.create({ data: { ...source } })
    })
  )
}
