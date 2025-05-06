import { JSDOM } from "jsdom"
import RssParser from "rss-parser"

import { BaseArticleConverter } from "./BaseArticleConverter"

export class ManagerArticleConverter extends BaseArticleConverter {
  public convertTitle(this: BaseArticleConverter, title: string): string {
    if (title.includes(": ")) {
      const first = title?.substring(0, title.indexOf(": ") + 2)
      return title.replace(first, "")
    }
    return title
  }

  public convertImage(
    this: BaseArticleConverter,
    image: RssParser.Enclosure | undefined,
    _html: string,
    head: string
  ) {
    const dom = JSDOM.fragment(head)
    const meta = dom.querySelector("meta[property='og:image']")
    const ogImage = meta?.getAttribute("content")
    if (ogImage) {
      return ogImage as string
    }
    return image?.url
  }

  public convertCreators(
    this: BaseArticleConverter,
    _creator: string | undefined,
    _html: string,
    head: string
  ): string[] {
    const dom = JSDOM.fragment(head)
    const meta = dom
      .querySelector("meta[name='author']")
      ?.getAttribute("content")
      ?.split(",")
    if (!meta || (meta.length === 1 && meta[0].trim() === "manager")) {
      return [this.source.name]
    } else {
      return [
        ...meta
          .filter((creator) => creator.trim() !== "manager")
          .map((creator) => creator.trim()),
        this.source.name,
      ]
    }
  }

  public isShort(this: BaseArticleConverter): boolean {
    return this.article.creators?.length === 1
  }

  public isPaywalled(this: ManagerArticleConverter, html: string) {
    const dom = JSDOM.fragment(html)
    const paywall = dom.querySelector("div[data-area='paywall']")
    return !!paywall
  }
}
