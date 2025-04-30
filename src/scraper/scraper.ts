import { Source } from "@prisma/client"
import RssParser from "rss-parser"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import prisma from "../prismaClient"

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

async function scrape(feedKey?: string, debug?: boolean, dry?: boolean) {
  const sources = await prisma.source.findMany()
  sources.forEach((source) => {
    const { key, feeds, name } = source
    if (feedKey && key !== feedKey) {
      return
    }

    if(!(key in converters)) {
      console.error(`❌ No converter found for source ${key}.`)
      return
    }

    console.log(`📖 Converting articles from ${name}...`)
    const converter = converters[key]
    feeds.forEach(async (feedUrl) => {
      parser.parseURL(feedUrl).then((feed) => {
        Promise.all(
          feed.items.map(async (item) => {
            const articleConverter = new converter(source, item)
            const article = await articleConverter.convertArticle()
            if (debug && article) {
              console.debug(`📝 Article: ${article.title} (${article.url})`)
              console.debug(`🗃️ Category: ${article.category}`)
              console.debug(`⏰ Published: ${article.uploadedAt}`)
              console.debug(`✍️ Creator: ${article.creators}`)
            }
            if (!dry && article) {
              const editors = await Promise.all(
                article.creators?.map((creator) =>
                  getOrCreateEditor(creator, source)
                ) ?? []
              )
              const newArticleInput = {
                title: article.title,
                url: article.url,
                uploadedAt: article.uploadedAt,
                category: article.category,
                description: article.description,
                image: article.image,
                premium: article.premium,
                short: article.short,
                source: { connect: { key } },
                editors: {
                  connect: editors.map((editor) => ({
                    id: editor.id,
                  })),
                },
              }
              const exists = await prisma.article.findFirst({
                where: {
                  title: article.title,
                  source: { key },
                  url: article.url,
                },
              })
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
          })
        )
          .then(() => {
            console.log(`✅ Articles from ${key} converted successfully!`)
          })
          .catch((error) => {
            console.error(`❌ Error converting articles from ${key}:`, error)
          })
      })
    })
  })
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
