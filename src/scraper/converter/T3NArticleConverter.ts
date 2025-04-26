import { JSDOM } from "jsdom"

import { BaseArticleConverter } from "./BaseArticleConverter"

export class T3NArticleConverter extends BaseArticleConverter {
  public convertTitle(this: BaseArticleConverter, title: string): string {
    return title
  }

  public convertCreators(
    this: BaseArticleConverter,
    creator: string | undefined,
    _html: string
  ): string[] {
    if (!creator) {
      return [this.source.name]
    }

    return [creator, this.source.name]
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
