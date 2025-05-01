import { BaseArticleConverter } from "./converter/BaseArticleConverter"
import { HandelsblattArticleConverter } from "./converter/HandelsblattArticleConverter"
import { ManagerArticleConverter } from "./converter/ManagerArticleConverter"
import { SpiegelArticleConverter } from "./converter/SpiegelArticleConverter"
import { SportschauArticleConverter } from "./converter/SportschauArticleConverter"
import { T3NArticleConverter } from "./converter/T3NArticleConverter"
import { TagesschauArticleConverter } from "./converter/TagesschauArticleConverter"
import { ZeitArticleConverter } from "./converter/ZeitArticleConverter"

export const converters: Record<string, typeof BaseArticleConverter> = {
  zeit: ZeitArticleConverter,
  spiegel: SpiegelArticleConverter,
  t3n: T3NArticleConverter,
  manager: ManagerArticleConverter,
  tagesschau: TagesschauArticleConverter,
  handelsblatt: HandelsblattArticleConverter,
  sportschau: SportschauArticleConverter,
}
