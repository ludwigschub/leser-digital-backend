import { JSDOM } from "jsdom"

import { BaseArticleConverter } from "./BaseArticleConverter"

export class HandelsblattArticleConverter extends BaseArticleConverter {
  public convertTitle(this: BaseArticleConverter, title: string): string {
    return title
  }

  public convertCreators(
    this: BaseArticleConverter,
    creator: string | undefined,
    _html: string
  ): string[] {
    const authors = creator
      ?.split(",")
      ?.map((creator) => creator.trim())
      .filter(Boolean)
    if (
      !authors ||
      !authors?.length ||
      (authors.length === 1 && authors[0] === "Redaktion Handelsblatt")
    ) {
      return [this.source.name]
    } else {
      return [...authors, this.source.name]
    }
  }

  public isShort(this: BaseArticleConverter): boolean {
    return !!(
      this.article.creators?.length === 2 &&
      this.article.creators?.find(
        (creator) => creator === "dpa" || creator === "Reuters"
      )
    )
  }

  public isPaywalled(this: HandelsblattArticleConverter, html: string) {
    const dom = new JSDOM(html)
    const paywall = dom.window.document.querySelector("app-paywall")
    return !!paywall
  }
}
