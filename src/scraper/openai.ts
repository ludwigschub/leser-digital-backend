import OpenAI from "openai"
import PQueue from "p-queue-cjs"

import { withRetry } from "./helpers"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const queue = new PQueue({ concurrency: 2 })

export async function classifyText(
  title: string,
  description: string,
  categories: string[]
): Promise<string | void> {
  const prompt = `Klassifiziere diesen News-Artikel basierend auf den gegebenen Kategorien: [${categories.join(
    ", "
  )}]. Wähle davon nur eine einzige Kategorie und zwar die, die am besten passt.
  \n\n"${title} ${description}"\n\nCategory:`

  return queue.add(
    () =>
      withRetry(() =>
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 10,
        })
      )
        .then((response) => {
          const category =
            response.choices[0].message.content?.trim() || "Unknown"
          return category
        })
        .catch(() => {
          console.warn(`⚠️ Failed to classify: "${title}"`)
        }),
    {}
  )
}
