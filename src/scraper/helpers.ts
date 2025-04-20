import { ResponseError } from "openai/resources/responses/responses"

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      if (
        (err as ResponseError).code === "rate_limit_exceeded" &&
        (err as { code: string }).code === "ECONNRESET" &&
        attempt < retries - 1
      ) {
        console.warn(`🔁 Error encountered. Retrying in ${delayMs}ms...`)
        await sleep(delayMs)
      } else {
        console.error(
          `❌ Failed after ${attempt + 1} attempts`,
          (err as ResponseError).message || err
        )
        throw err
      }
    }
  }
  throw new Error("❌ Max retries exceeded")
}
