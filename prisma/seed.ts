import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import { seedArticles } from "./seed/article"
import { seedEditors } from "./seed/editor"
import { seedSources } from "./seed/source"
import { seedSubscriptions } from "./seed/subscription"
import { seedTopics } from "./seed/topic"
import { seedUsers } from "./seed/user"

const seed = async (testData?: boolean) => {
  const users = await seedUsers()
  const sources = await seedSources()
  const topics = await seedTopics()
  const editors = await seedEditors(sources[0])
  if (testData) {
    await seedArticles(sources[0], topics[0])
    await seedSubscriptions(sources, topics, editors, users[0])
  }

  console.log("✅ Finished seeding!")
}

;(async () => {
  const argv = await yargs(hideBin(process.argv))
    .option("test", {
      alias: "t",
      type: "boolean",
      description: "Seed data for tests",
      default: undefined,
    })
    .help().argv
  seed(argv.test)
})()
