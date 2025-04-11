import { Source } from "@prisma/client"
import axios from "axios"
import { toKebabCase } from "js-convert-case"
import { JSDOM } from "jsdom"
import RssParser from "rss-parser"
import TurndownService from "turndown"

interface ConvertedArticle {
  title: string
  content?: string
  pubDate: string
  link: string
  creators: string[]
  categories: string[]
}

export class BaseArticleConverter {
  source: Source
  foldername: string
  item: RssParser.Item
  turndownService: TurndownService

  constructor(source: Source, item: RssParser.Item) {
    this.source = source
    this.item = item
    this.foldername = toKebabCase(source.name)
    this.turndownService = new TurndownService()
  }

  public async convertArticle(this: BaseArticleConverter) {
    try {
      const {
        title: rawTitle,
        link,
        pubDate,
        creator,
        categories: rawCategories,
      } = this.item
      if (!rawTitle || !link || !pubDate) {
        console.log("❌ Missing title or link. Skipping...")
        return
      }
      const response = await axios.get(link)
      const dom = new JSDOM(response.data)
      const html = dom.window.document.querySelector("article")?.innerHTML

      if (!html) {
        console.log("❌ No content found. Skipping...")
        return
      }

      if (this.isPaywalled(html)) {
        console.log(`❌ "${link}" is paywalled. Skipping...`)
        return
      }

      const title = this.convertTitle(rawTitle, html)

      const creators = this.convertCreators(creator, html)

      const categories = this.convertCategories(rawCategories, html)

      const article: ConvertedArticle = {
        title,
        pubDate,
        link,
        creators,
        categories,
      }

      return article
    } catch (error) {
      console.error("Error fetching full article content:", error)
    }
  }

  public convertTitle(
    this: BaseArticleConverter,
    title: string,
    _html: string
  ): string {
    return title
  }

  public convertCreators(
    this: BaseArticleConverter,
    creator: string | undefined,
    _html: string
  ): string[] {
    if (!creator) {
      return [this.source.name]
    } else {
      return [creator]
    }
  }

  public convertCategories(
    this: BaseArticleConverter,
    categories: string[] | undefined,
    _html: string
  ): string[] {
    return categories ?? []
  }

  public isPaywalled(this: BaseArticleConverter, _html: string) {
    return false
  }

  public setupTurndownServiceRules(this: BaseArticleConverter) {
    return
  }
}
