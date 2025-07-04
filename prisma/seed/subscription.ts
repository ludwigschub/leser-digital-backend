import { Prisma, SearchTerm, User } from "@prisma/client"

import prisma from "../../src/prismaClient"

const getSubscriptions = (
  searchTerms: SearchTerm[],
  user: User
): Prisma.SubscriptionCreateInput[] => [
  ...searchTerms.map((searchTerm) => ({
    user: { connect: { id: user.id } },
    searchTerm: { connect: { id: searchTerm.id } },
  })),
]

export const seedSubscriptions = async (user: User) => {
  const searchTerms = await prisma.searchTerm.findMany()
  const subscriptions = getSubscriptions(searchTerms, user)
  return await Promise.all(
    subscriptions.map(async (subscription) => {
      await prisma.subscription.create({ data: subscription })
    })
  )
}
