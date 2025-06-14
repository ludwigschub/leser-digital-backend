import { Editor, Prisma, Source, Topic, User } from "@prisma/client"

import prisma from "../../src/prismaClient"

const getSubscriptions = (
  sources: Source[],
  topics: Topic[],
  editors: Editor[],
  user: User
): Prisma.SubscriptionCreateInput[] => [
  ...sources.map((source) => ({
    user: { connect: { id: user.id } },
    source: { connect: { id: source.id } },
  })),
  ...topics.map((topic) => ({
    user: { connect: { id: user.id } },
    topic: { connect: { id: topic.id } },
  })),
  ...editors.map((editor) => ({
    user: { connect: { id: user.id } },
    editor: { connect: { id: editor.id } },
  }))
]

export const seedSubscriptions = async (
  sources: Source[],
  topics: Topic[],
  editors: Editor[],
  user: User
) => {
  const subscriptions = getSubscriptions(sources, topics, editors, user)
  return await Promise.all(
    subscriptions.map(async (subscription) => {
      await prisma.subscription.create({ data: subscription })
    })
  )
}
