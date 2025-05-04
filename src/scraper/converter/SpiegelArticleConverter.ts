import { JSDOM } from "jsdom"

import { BaseArticleConverter } from "./BaseArticleConverter"

export class SpiegelArticleConverter extends BaseArticleConverter {
  public convertTitle(this: BaseArticleConverter, title: string): string {
    const first = title?.substring(0, title.indexOf(": ") + 2)
    return title.replace(first, "")
  }

  public convertCreators(
    this: BaseArticleConverter,
    _creator: string | undefined,
    _html: string,
    head: string
  ): string[] {
    const dom = JSDOM.fragment(head)
    const author = dom.querySelector("meta[name='author']")
    const authorNames = author
      ?.getAttribute("content")
      ?.split(",")
      .filter((name) => name.trim() !== "DER SPIEGEL")
    if (authorNames) {
      return [...authorNames, this.source.name]
    }
    return [this.source.name]
  }

  public isShort(
    this: BaseArticleConverter,
    _html: string,
    _head: string
  ): boolean {
    return (
      this.article.creators?.length === 1 &&
      this.article.creators[0] === this.source.name
    )
  }

  public isPaywalled(this: SpiegelArticleConverter, html: string) {
    return html.includes(
      '<div data-sara-click-el="body_element" data-area="paywall" data-pos="1">'
    )
  }

  public setupTurndownServiceRules(this: SpiegelArticleConverter) {
    this.turndownService.addRule("convertHeader", {
      filter: (node) => node.nodeName === "HEADER",
      replacement: function (_content, node) {
        const headerNode = node.querySelector("h2")
        const title = headerNode?.children[1].textContent?.trim()
        const subTitle = headerNode?.children[0].textContent?.trim()
        return `# ${subTitle}: ${title}`
      },
    })
    this.turndownService.addRule("convertPicture", {
      filter: (node) =>
        node.nodeName === "FIGURE" && node.classList.contains("justify-start"),
      replacement: function (_content, node) {
        const img = node.querySelector("img")
        if (!img) {
          return ""
        }
        const dataSrc = img.getAttribute("data-src")
        const src = img.getAttribute("src")
        return img ? `![${img.getAttribute("title")}](${dataSrc || src})` : ""
      },
    })

    this.turndownService.addRule("convertQuote", {
      filter: (node) =>
        node.nodeName === "SECTION" &&
        node.getAttribute("data-area") === "quote",
      replacement: function (_content, node) {
        const caption = node.querySelector("div.RichTextCaption")?.textContent
        const quote = node.textContent
          ?.replace(caption ?? "", "")
          .replace(/[»«]/g, "")
          .trim()
        return `> ### ${quote}\n  ${caption}`
      },
    })

    this.turndownService.addRule("removeTopicBox", {
      filter: (node) =>
        node.nodeName === "SECTION" &&
        node.getAttribute("data-area") === "related_articles",
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeSharing", {
      filter: (node) => node.nodeName === "DIV" && node.id === "feature-bar",
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeFooter", {
      filter: (node) =>
        node.nodeName === "FOOTER" &&
        node.getAttribute("data-area") === "article-footer",
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeEmbed", {
      filter: (node) =>
        node.nodeName === "SECTION" &&
        node.getAttribute("data-area") === "embed",
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeScripts", {
      filter: (node) => node.nodeName === "SCRIPT",
      replacement: function () {
        return ""
      },
    })
  }
}
