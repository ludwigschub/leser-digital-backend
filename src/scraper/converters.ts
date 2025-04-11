import { BaseArticleConverter } from "./converter/BaseArticleConverter"
import { SpiegelArticleConverter } from "./converter/SpiegelArticleConverter"
import { ZeitArticleConverter } from "./converter/ZeitArticleConverter"

export const converters: Record<string, typeof BaseArticleConverter> = {
  zeit: ZeitArticleConverter,
  spiegel: SpiegelArticleConverter,
}
