import { JSDOM } from "jsdom"
import RssParser from "rss-parser"

import { BaseArticleConverter } from "./BaseArticleConverter"

export class TagesschauArticleConverter extends BaseArticleConverter {
  public convertTitle(this: BaseArticleConverter, title: string): string {
    const first = title?.substring(0, title.indexOf(": ") + 2)
    return title.replace(first, "")
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
    const dom = JSDOM.fragment(head)
    const meta = dom
      .querySelector("meta[name='author']")
      ?.getAttribute("content")
      ?.split(",")
      ?.map((creator) => creator.trim())
      ?.filter((creator) => creator !== "tagesschau.de" && Boolean(creator))
    if (
      !meta ||
      !meta?.length ||
      (meta.length === 1 && meta[0] === "tagesschau.de")
    ) {
      return [this.source.name]
    } else {
      return [
        ...meta.filter((creator) => creator.trim() !== "tagesschau.de"),
        this.source.name,
      ]
    }
  }

  public isShort(this: BaseArticleConverter): boolean {
    return false
  }

  public isPaywalled(this: TagesschauArticleConverter, _html: string) {
    return false
  }
}
