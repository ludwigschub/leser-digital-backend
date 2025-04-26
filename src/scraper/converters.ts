import { BaseArticleConverter } from "./converter/BaseArticleConverter"
import { SpiegelArticleConverter } from "./converter/SpiegelArticleConverter"
import { T3NArticleConverter } from "./converter/T3NArticleConverter"
import { ZeitArticleConverter } from "./converter/ZeitArticleConverter"

export const converters: Record<string, typeof BaseArticleConverter> = {
  zeit: ZeitArticleConverter,
  spiegel: SpiegelArticleConverter,
  t3n: T3NArticleConverter,
}
