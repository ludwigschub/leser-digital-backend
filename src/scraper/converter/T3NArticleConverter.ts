import { JSDOM } from "jsdom"

import { BaseArticleConverter } from "./BaseArticleConverter"

export class T3NArticleConverter extends BaseArticleConverter {
  public convertTitle(this: BaseArticleConverter, title: string): string {
    return title
  }

  public convertCreators(
    this: BaseArticleConverter,
    _creator: string | undefined,
    _html: string,
    head: string
  ): string[] {
    const dom = JSDOM.fragment(head)
    const meta = dom.querySelector("meta[name='author']")?.getAttribute("content")
    if (!meta) {
      return [this.source.name]
    } else {
      return [
        ...meta.split(",").map((creator) => creator.trim()),
        this.source.name,
      ]
    }
  }

  public isShort(this: BaseArticleConverter, _html: string): boolean {
    return false
  }

  public isPaywalled(this: T3NArticleConverter, html: string) {
    const dom = JSDOM.fragment(html)
    const paywall = dom.querySelector("div.c-paywall__wrapper")
    return !!paywall
  }
}
