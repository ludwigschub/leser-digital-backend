import { JSDOM } from "jsdom"
import RssParser from "rss-parser"

import { BaseArticleConverter } from "./BaseArticleConverter"

export class SportschauArticleConverter extends BaseArticleConverter {
  public convertTitle(this: BaseArticleConverter, title: string): string {
    return title
  }

  public convertImage(
    this: BaseArticleConverter,
    _image: RssParser.Enclosure | undefined,
    _html: string,
    head: string
  ) {
    const dom = JSDOM.fragment(head)
    const meta = dom.querySelector("meta[property='og:image']")
    const ogImage = meta?.getAttribute("content")
    return ogImage as string
  }

  public convertCreators(
    this: BaseArticleConverter,
    _creator: string | undefined,
    _html: string,
    head: string
  ): string[] {
    const dom = new JSDOM(head).window.document
    const meta = dom
      .querySelector("meta[name='author']")
      ?.getAttribute("content")
    const names = [meta]
      ?.map((name) => name?.trim())
      .filter((name) => Boolean(name) && name !== "sportschau.de")
    if (!names || !names?.length) {
      return [this.source.name]
    } else {
      return [...(names as string[]), this.source.name]
    }
  }

  public isShort(this: BaseArticleConverter): boolean {
    return false
  }

  public isPaywalled(this: SportschauArticleConverter, _html: string) {
    return false
  }
}
