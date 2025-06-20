import { Article, ArticleCategory, Source, Topic } from "@prisma/client"
import axios from "axios"
import { toKebabCase } from "js-convert-case"
import { JSDOM } from "jsdom"
import RssParser from "rss-parser"
import TurndownService from "turndown"

import { classifyText } from "../openai"

export interface ConvertedArticle {
  title: string
  content?: string
  description: string
  uploadedAt: Date
  url: string
  creators: string[]
  category: ArticleCategory
  image?: string
  premium?: boolean
  short?: boolean
}

export class BaseArticleConverter {
  source: Source
  foldername: string
  item: RssParser.Item
  turndownService: TurndownService
  article: Partial<ConvertedArticle>

  constructor(source: Source, item: RssParser.Item) {
    this.source = source
    this.item = item
    this.foldername = toKebabCase(source.name)
    this.turndownService = new TurndownService()
    this.article = {}
  }

  public async convertArticle(
    this: BaseArticleConverter,
    existing?: (Article & { topic: Topic }) | null
  ): Promise<ConvertedArticle | undefined> {
    try {
      const {
        title: rawTitle,
        link: url,
        summary: rawDescription,
        contentSnippet: rawContentSnippet,
        pubDate,
        creator,
        enclosure,
      } = this.item
      if (!rawTitle || !url || !pubDate) {
        console.log("❌ Missing title or link. Skipping...")
        return
      }

      let html: string | undefined
      let head: string | undefined
      if (!existing || !existing.image) {
        const response = await axios.get(url).catch(() => {
          console.error("❌ Error fetching article...", url)
          return undefined
        })

        const dom = new JSDOM(response?.data)
        head = dom.window.document.head.innerHTML
        html = dom.window.document.body.innerHTML
      }

      this.article.title = this.convertTitle(rawTitle, html, head)

      this.article.description = this.convertDescription(
        rawDescription ?? rawContentSnippet,
        html,
        head
      )

      this.article.uploadedAt = new Date(pubDate)

      this.article.image = this.convertImage(enclosure, html, head)

      this.article.creators = this.convertCreators(creator, html, head)

      if (!existing) {
        this.article.category = await this.convertCategory(html, head)
        this.article.short = this.isShort(html, head)
        this.article.premium = this.isPaywalled(html, head)
        this.article.url = url
      } else {
        this.article.category = existing.topic.category
        this.article.short = existing.short
        this.article.premium = existing.premium
        this.article.url = existing.url
      }

      return this.article as ConvertedArticle
    } catch (error) {
      console.error("Error fetching full article content:", error)
      return undefined
    }
  }

  public convertTitle(
    this: BaseArticleConverter,
    title: string,
    _html?: string,
    _head?: string
  ): string {
    return title
  }

  public convertDescription(
    this: BaseArticleConverter,
    description: string | undefined,
    _html?: string,
    _head?: string
  ): string {
    return description ?? ""
  }

  public convertImage(
    this: BaseArticleConverter,
    enclosure: RssParser.Enclosure | undefined,
    _html?: string,
    _head?: string
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
    _html?: string,
    _head?: string
  ): string[] {
    if (!creator) {
      return [this.source.name]
    } else {
      return [creator]
    }
  }

  public async convertCategory(
    this: BaseArticleConverter,
    _html?: string,
    _head?: string
  ): Promise<ArticleCategory> {
    const categories = [
      ...Object.keys(ArticleCategory).map((category) => category),
    ]
    const category = await classifyText(
      this.article.title as string,
      this.article.description as string,
      categories
    )
    if (category && categories.find((c) => c === category)) {
      return category as ArticleCategory
    } else {
      console.debug(`❌ Unknown category "${category}"`)
      return ArticleCategory.UNKNOWN
    }
  }

  public isShort(
    this: BaseArticleConverter,
    _html?: string,
    _head?: string
  ): boolean {
    return false
  }

  public isPaywalled(
    this: BaseArticleConverter,
    _html?: string,
    _head?: string
  ) {
    return false
  }

  public setupTurndownServiceRules(this: BaseArticleConverter) {
    return
  }
}
