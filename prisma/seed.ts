import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import { seedArticles } from "./seed/article"
import { seedSources } from "./seed/source"
import { seedUsers } from "./seed/user"

const seed = async (testData?: boolean) => {
  await seedUsers()
  const sources = await seedSources()
  if (testData) await seedArticles(sources[0])

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
