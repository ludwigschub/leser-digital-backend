import { extendType, nullable } from "nexus"

import { Context } from "../../context"

export const articleQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.nonNull.field("articles", {
      type: "Article",
      args: { filter: nullable("ArticleQueryFilter") },
      resolve: async (_parent, args, { prisma }: Context) => {
        const { source, editor } = args.filter ?? {}
        const filter = {
          source: source ? { key: source } : undefined,
          editors: editor ? { some: { name: editor } } : undefined,
        }
        return await prisma.article.findMany({
          where: args.filter ? filter : undefined,
          include: {
            source: { include: { editors: false } },
            editors: { include: { source: false } },
          },
          orderBy: {
            uploadedAt: "desc",
          },
        })
      },
    })
  },
})
