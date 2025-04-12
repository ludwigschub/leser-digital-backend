import { Source } from "@prisma/client"
import axios from "axios"
import { toKebabCase } from "js-convert-case"
import { JSDOM } from "jsdom"
import RssParser from "rss-parser"
import TurndownService from "turndown"

interface ConvertedArticle {
  title: string
  content?: string
  description: string
  uploadedAt: Date
  url: string
  creators: string[]
  categories: string[]
  image?: string
  premium?: boolean
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
        link: url,
        summary: rawDescription,
        contentSnippet: rawContentSnippet,
        pubDate,
        creator,
        enclosure,
        categories: rawCategories,
      } = this.item
      if (!rawTitle || !url || !pubDate) {
        console.log("❌ Missing title or link. Skipping...")
        return
      }
      const response = await axios.get(url)
      const dom = new JSDOM(response.data)
      const html = dom.window.document.querySelector("article")?.innerHTML

      if (!html) {
        console.log("❌ No content found. Skipping...")
        return
      }

      const title = this.convertTitle(rawTitle, html)

      const description = this.convertDescription(
        rawDescription ?? rawContentSnippet,
        html
      )

      const premium = this.isPaywalled(html)

      const uploadedAt = new Date(pubDate)

      const image = this.convertImage(enclosure, html)

      const creators = this.convertCreators(creator, html)

      const categories = this.convertCategories(rawCategories, html)

      const article: ConvertedArticle = {
        title,
        description,
        uploadedAt,
        url,
        image,
        creators,
        categories,
        premium,
      }

      return article
    } catch (error) {
      console.error("Error fetching full article content:", error)
      return undefined
    }
  }

  public convertTitle(
    this: BaseArticleConverter,
    title: string,
    _html: string
  ): string {
    return title
  }

  public convertDescription(
    this: BaseArticleConverter,
    description: string | undefined,
    _html: string
  ): string {
    return description ?? ""
  }

  public convertImage(
    this: BaseArticleConverter,
    enclosure: RssParser.Enclosure | undefined,
    _html: string
  ): string | undefined {
    if (
      (enclosure?.type === "image/jpeg" || enclosure?.type === "image/png") &&
      enclosure?.url
    ) {
      return enclosure.url
    }
    return undefined
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
