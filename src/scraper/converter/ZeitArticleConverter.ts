import { JSDOM } from "jsdom"

import { BaseArticleConverter } from "./BaseArticleConverter"

export class ZeitArticleConverter extends BaseArticleConverter {
  public convertTitle(this: BaseArticleConverter, title: string): string {
    return title
  }

  public convertCreators(
    this: BaseArticleConverter,
    creator: string | undefined,
    html: string
  ): string[] {
    if (!creator) {
      return [this.source.name]
    }

    const first = creator?.substring(0, creator.indexOf(" - ") + 3)

    const names = creator
      ?.replace(first, "")
      .split(", ")
      .filter((name) => !!name)
    if (names.length) {
      return [...names, this.source.name]
    }

    const dom = JSDOM.fragment(html)
    const metadataSource = dom
      .querySelector("span.metadata__source")
      ?.innerHTML.replace("Quelle: ", "")

    if (metadataSource) {
      return [metadataSource, this.source.name]
    }

    return [this.source.name]
  }

  public isPaywalled(this: ZeitArticleConverter, html: string) {
    const dom = JSDOM.fragment(html)
    const paywall = dom.querySelector("aside#paywall")
    return !!paywall
  }

  public setupTurndownServiceRules(this: ZeitArticleConverter) {
    this.turndownService.addRule("convertPicture", {
      filter: (node) =>
        node.nodeName === "FIGURE" && node.classList.contains("article__media"),
      replacement: function (_content, node) {
        const img = node.querySelector("img.article__media-item")
        return img
          ? `![${img.getAttribute("alt")}](${img.getAttribute("src")})`
          : ""
      },
    })

    this.turndownService.addRule("removeTopicBox", {
      filter: (node) =>
        node.nodeName === "ASIDE" && node.classList.contains("topicbox"),
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeNewsletter", {
      filter: (node) =>
        node.nodeName === "ASIDE" &&
        node.classList.contains("newsletter-signup"),
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeAudioPlayer", {
      filter: (node) =>
        node.nodeName === "DIV" &&
        (node.classList.contains("audio-player") ||
          node.classList.contains("article-player-info")),
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeComments", {
      filter: (node) =>
        node.nodeName === "A" && node.classList.contains("z-text-button"),
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeShowable", {
      filter: (node) =>
        node.nodeName === "DIV" && node.classList.contains("js-showable"),
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeSummaryButton", {
      filter: (node) =>
        node.nodeName === "BUTTON" && node.classList.contains("z-text-button"),
      replacement: function () {
        return ""
      },
    })

    this.turndownService.addRule("removeFooter", {
      filter: (node) =>
        node.nodeName === "DIV" && node.classList.contains("article-footer"),
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

    this.turndownService.addRule("removeEmbeds", {
      filter: (node) =>
        node.nodeName === "DIV" && node.classList.contains("embed-wrapper"),
      replacement: function () {
        return ""
      },
    })
  }
}
