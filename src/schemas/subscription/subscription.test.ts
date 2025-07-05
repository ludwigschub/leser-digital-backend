import { Subscription, User } from "@prisma/client"
import { GraphQLError } from "graphql"

import { executeQuery } from "../../../test/helpers"
import prisma from "../../prismaClient"

describe("Integration test for subscription methods", () => {
  const createSubscriptionMutation = `
    mutation createSubscription($sourceId: String, $termID: String, $topicId: String) {
      createSubscription(sourceId: $sourceId, termId: $termId, topicId: $topicId) {
        id
      }
    }
`
  const deleteSubscriptionMutation = `
    mutation deleteSubscription($id: String!) {
      deleteSubscription(id: $id) {
        id
      }
    }
`
  const subscriptionsQuery = `
    query subscriptions {
      subscriptions {
        id
      }
    }
`

  let firstExampleUser: User | null
  beforeAll(async () => {
    firstExampleUser = await prisma.user.findFirst({
      where: { email: "test@example.com" },
    })
  })

  test("should create a subscription", async () => {
    const source = await prisma.source.findFirst()
    const editor = await prisma.editor.findFirst()
    const topic = await prisma.topic.findFirst()
    const sourceSubscriptionResult = await executeQuery(
      createSubscriptionMutation,
      { sourceId: source?.id },
      firstExampleUser?.email
    )
    const topicSubscriptionResult = await executeQuery(
      createSubscriptionMutation,
      { topicId: topic?.id },
      firstExampleUser?.email
    )
    const editorSubscriptionResult = await executeQuery(
      createSubscriptionMutation,
      { editorId: editor?.id },
      firstExampleUser?.email
    )

    expect(
      (sourceSubscriptionResult.data?.createSubscription as Subscription)?.id
    ).toBeDefined()
    expect(
      (topicSubscriptionResult.data?.createSubscription as Subscription)?.id
    ).toBeDefined()
    expect(
      (editorSubscriptionResult.data?.createSubscription as Subscription)?.id
    ).toBeDefined()
  })

  test("should not create a subscription without any arguments", async () => {
    const result = await executeQuery(
      createSubscriptionMutation,
      {},
      firstExampleUser?.email
    )
    expect(result.errors).toBeDefined()
    expect((result.errors as GraphQLError[])[0].message).toBe(
      "At least one argument is required"
    )
  })

  test("should delete a subscription", async () => {
    const subscription = await prisma.subscription.findFirst({
      where: { user: { email: firstExampleUser?.email } },
    })
    const result = await executeQuery(
      deleteSubscriptionMutation,
      { id: subscription?.id },
      firstExampleUser?.email
    )
    expect((result.data?.deleteSubscription as Subscription)?.id).toBeDefined()
  })

  test("should get all subscriptions for a user", async () => {
    const subscriptions = await prisma.subscription.findMany({
      where: { user: { email: firstExampleUser?.email } },
    })
    const response = await executeQuery(
      subscriptionsQuery,
      {},
      firstExampleUser?.email
    )
    expect(response.data?.subscriptions).toBeDefined()
    expect((response.data?.subscriptions as Subscription[])?.length).toBe(
      subscriptions.length
    )
  })
})
