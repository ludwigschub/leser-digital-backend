import { Source } from "@prisma/client"
import { scheduleJob } from "node-schedule"
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
    const { key, feedUrl, name } = source
    if (feedKey && key !== feedKey) {
      return
    }

    console.log(`📖 Converting articles from ${name}...`)
    const converter = converters[key]
    parser.parseURL(feedUrl).then((feed) => {
      Promise.all(
        feed.items.map(async (item) => {
          const articleConverter = new converter(source, item)
          const article = await articleConverter.convertArticle()
          if (debug && article) {
            console.debug(`📝 Article: ${article.title} (${article.url})`)
            console.debug(`🗃️ Categories: ${article.categories}`)
            console.debug(`⏰ Published: ${article.uploadedAt}`)
            console.debug(`✍️ Creator: ${article.creators}`)
          }
          if (!dry && article) {
            const editors = await Promise.all(
              article.creators.map((creator) =>
                getOrCreateEditor(creator, source)
              )
            )
            const newArticleInput = {
              title: article.title,
              url: article.url,
              uploadedAt: article.uploadedAt,
              categories: article.categories,
              description: article.description,
              image: article.image,
              premium: article.premium,
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
      ).then(() => {
        console.log(`✅ Articles from ${key} converted successfully!`)
      })
    })
  })
}

;(async () => {
  const argv = await yargs(hideBin(process.argv))
    .option("generate", {
      alias: "g",
      type: "boolean",
      description: "Generate article files",
      default: false,
    })
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
    .option("schedule", {
      alias: "s",
      type: "string",
      description: "Run scraper on a schedule",
      default: undefined,
    })
    .option("dry", {
      type: "boolean",
      description: "Run scraper in dry run mode",
      default: false,
    })
    .help().argv

  const job = () => scrape(argv.feed, argv.debug, argv.dry)

  if (!argv.schedule) {
    job()
  } else {
    scheduleJob(argv.schedule, () => {
      console.log("⏰ Running scraper...")
      job()
    })
  }
})()
