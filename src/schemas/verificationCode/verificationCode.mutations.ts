import { GraphQLError } from "graphql"
import { extendType } from "nexus"

export const createCode = () => {
  const multiplier = 100_000
  return String(99999 + Math.floor(Math.random() * multiplier))
}

export const checkCodeExpiry = (createdAt: Date) => {
  const now = new Date().getTime()

  // Can't be older than 10 minutes
  const expires = createdAt.getTime() + 10 * 60 * 1000

  return expires < now
}

export const verificationCodeMutations = extendType({
  type: "Mutation",
  definition(t) {
    t.field("verify", {
      type: "User",
      args: {
        code: "String",
      },
      resolve: async (_parent, { code }, { prisma, user }) => {
        const verificationCode = await prisma.verificationCode.findFirst({
          where: {
            code,
            userId: user.id,
          },
        })
        if (!verificationCode) {
          throw new GraphQLError("Invalid verification code", {
            extensions: { code: "INVALID_VERIFICATION_CODE" },
          })
        }

        // Check if verification code is expired
        const expired = checkCodeExpiry(verificationCode.createdAt)
        if (expired) {
          throw new GraphQLError("Verification code expired", {
            extensions: { code: "VERIFICATION_CODE_EXPIRED" },
          })
        }

        await prisma.verificationCode.delete({
          where: { id: verificationCode.id },
        })
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { verified: true },
        })
        return updated
      },
    })
    t.field("resendVerificationCode", {
      type: "Boolean",
      resolve: async (_parent, _args, { prisma, user }) => {
        const existing = await prisma.verificationCode.findFirst({
          where: { userId: user.id },
        })

        if (existing) {
          const expired = checkCodeExpiry(existing.createdAt)
          if (!expired) {
            throw new GraphQLError("Code already sent", {
              extensions: { code: "CODE_ALREADY_SENT" },
            })
          }
        }

        await prisma.verificationCode.deleteMany({
          where: { userId: user.id },
        })
        const code = createCode()
        await prisma.verificationCode.create({
          data: { code, user: { connect: { id: user.id } } },
        })
        return true
      },
    })
  },
})
