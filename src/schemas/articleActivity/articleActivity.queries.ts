import { extendType } from "nexus"

import { Context } from "../../context"

export const ArticleActivityQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.nonNull.field("mySourceActivityStats", {
      type: "SourceActivityStat",
      resolve: async (_parent, _args, { prisma, user }: Context) => {
        const readSources = await prisma.article
          .groupBy({
            by: ["sourceId"],
            where: {
              activity: { some: { userId: user?.id } },
            },
          })
          .then((sources) => {
            return Promise.all(
              sources.map((source) => {
                return prisma.source.findUnique({
                  where: { id: source.sourceId },
                })
              })
            )
          })
        return Promise.all(
          readSources.filter(Boolean).map((source) => {
            return prisma.articleActivity
              .count({
                where: {
                  article: { sourceId: source?.id },
                  user: { id: user?.id },
                },
              })
              .then((count) => ({
                source,
                views: count,
              }))
          })
        ).then((sources) => {
          return sources.sort((a, b) => {
            // istanbul ignore next
            return a.views > b.views ? -1 : 1
          })
        })
      },
    })
    t.list.nonNull.field("myTopicActivityStats", {
      type: "TopicActivityStat",
      resolve: async (_parent, _args, { prisma, user }: Context) => {
        const readTopics = await prisma.article
          .groupBy({
            by: ["topicId"],
            where: {
              activity: { some: { userId: user?.id } },
            },
          })
          .then((topics) => {
            return Promise.all(
              topics.map((topic) => {
                return prisma.topic.findUnique({
                  where: { id: topic.topicId },
                })
              })
            )
          })
        return Promise.all(
          readTopics.filter(Boolean).map((topic) => {
            return prisma.articleActivity
              .count({
                where: {
                  article: { topicId: topic?.id },
                  user: { id: user?.id },
                },
              })
              .then((count) => ({
                topic,
                views: count,
              }))
          })
        ).then((topics) => {
          return topics.sort((a, b) => {
            // istanbul ignore next
            return a.views > b.views ? -1 : 1
          })
        })
      },
    })
  },
})
