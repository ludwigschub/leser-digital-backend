import { exec } from "child_process"
import fs from "fs"

import { seedActivities } from "./seed/activity"
import { seedArticles } from "./seed/article"
import { seedEditors } from "./seed/editor"
import { seedSources } from "./seed/source"
import { seedSubscriptions } from "./seed/subscription"
import { seedTopics } from "./seed/topic"
import { seedUsers } from "./seed/user"

const seed = async () => {
  const users = await seedUsers()
  const sources = await seedSources()
  const topics = await seedTopics()
  await seedEditors(sources[0])

  console.log("Seeding test data...")
  const articles = await Promise.all(
    sources
      .map((source) =>
        Promise.all(topics.map((topic) => seedArticles(source, topic)))
      )
      .flat(2)
  ).then((res) => res.flat(2))

  await Promise.all(
    users.map((user) =>
      Promise.all([
        ...articles.map((article) => seedActivities(article, user.email)),
        seedSubscriptions(user),
      ])
    )
  )

  if (fs.existsSync("./datadump/articles.csv")) {
    console.debug("Copying dumped data...")
    // Execute the copy script
    const copyScript = `./copyData.sh ${process.env.DATABASE_URL}`
    exec(copyScript, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing copy script: ${error.message}`)
        return
      }
      if (stderr) {
        console.error(`Error in copy script: ${stderr}`)
        return
      }
      console.log(`Copy script output: ${stdout}`)
    })
  }

  console.log("✅ Finished seeding!")
}

;(async () => {
  seed()
})()
