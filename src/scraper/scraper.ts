import { Prisma, Source } from "@prisma/client"
import RssParser from "rss-parser"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import prisma from "../prismaClient"

import { ConvertedArticle } from "./converter/BaseArticleConverter"
import { converters } from "./converters"

const parser = new RssParser()

const getOrCreateEditor = async (name: string, source: Source) => {
  const existingEditor = await prisma.editor.findFirst({
    where: { name, source: { key: source.key } },
  })
  if (existingEditor) {
    return existingEditor
  }
  const newEditor = await prisma.editor.create({
    data: {
      name,
      source: { connect: { key: source.key } },
    },
  })
  return newEditor
}

const debugMessage = (article: ConvertedArticle) => {
  console.debug(`📝 Article: ${article.title} (${article.url})`)
  console.debug(`🗃️ Category: ${article.category}`)
  console.debug(`⏰ Published: ${article.uploadedAt}`)
  console.debug(`✍️ Creator: ${article.creators}`)
}

async function scrape(feedKey?: string, debug?: boolean, dry?: boolean) {
  const sources = await prisma.source.findMany()

  for (const source of sources) {
    const { key, feeds, name } = source

    if (feedKey && key !== feedKey) {
      continue
    }

    if (!(key in converters)) {
      console.error(`❌ No converter found for source ${key}.`)
      continue
    }

    console.log(`📖 Converting articles from ${name}...`)
    const converter = converters[key]

    for (const feedUrl of feeds) {
      try {
        const feed = await parser.parseURL(feedUrl)

        for (const item of feed.items) {
          const exists = await prisma.article.findFirst({
            where: {
              source: { key },
              url: item.url,
            },
          })

          const articleConverter = new converter(source, item)
          const article = await articleConverter.convertArticle(
            exists
          )

          if (debug && article) {
            debugMessage(article)
          }

          if (!dry && article) {
            const editors = await Promise.all(
              article.creators?.map((creator) =>
                getOrCreateEditor(creator, source)
              ) ?? []
            )
            const { creators: _creators, ...newArticle } = article

            const newArticleInput: Prisma.ArticleCreateInput = {
              ...newArticle,
              source: { connect: { key } },
              editors: {
                connect: editors.map(({ id }) => ({ id })),
              },
            }

            if (exists) {
              await prisma.article.update({
                data: newArticleInput,
                where: { id: exists.id },
              })
            } else {
              await prisma.article.create({
                data: newArticleInput,
              })
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error parsing feed ${feedUrl}:`, error)
      }
    }

    console.log(`✅ Articles from ${key} converted successfully!`)
  }
}

;(async () => {
  const argv = await yargs(hideBin(process.argv))
    .option("feed", {
      alias: "f",
      type: "string",
      description: "Scrape specific feed",
      default: undefined,
    })
    .option("debug", {
      alias: "v",
      type: "boolean",
      description: "Show debug output",
      default: false,
    })
    .option("dry", {
      type: "boolean",
      description: "Run scraper in dry run mode",
      default: false,
    })
    .help().argv

  scrape(argv.feed, argv.debug, argv.dry)
})()
