import { JSDOM } from "jsdom"

import { BaseArticleConverter } from "./BaseArticleConverter"

export class ManagerArticleConverter extends BaseArticleConverter {
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
