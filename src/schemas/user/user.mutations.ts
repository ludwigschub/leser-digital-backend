import { PrismaClient, User } from "@prisma/client"
import { GraphQLError } from "graphql"
import jwt from "jsonwebtoken"
import { nonNull, objectType } from "nexus"

import { Context, isCodeExpired } from "../../context"
import { sendResetLink } from "../../email/forgotPassword"
import { sendVerificationCode } from "../../email/verificationCode"
import { hashPassword } from "../../password"
import { checkCodeExpiry, createCode } from "../verificationCode"

// istanbul ignore next
const checkOrCreateResetMail = async (prisma: PrismaClient, user: User) => {
  const existingToken = user?.resetPasswordToken
  if (existingToken) {
    const decoded = jwt.decode(existingToken) as { email: string; exp: number }
    const expired = isCodeExpired(decoded.exp * 1000)
    if (!expired) {
      return false
    }
  }

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  })

  if (process.env.NODE_ENV === "test") {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: token },
    })
    return true
  }

  if (user) {
    await sendResetLink(user, token, async () => {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: token },
      })
    })
    return true
  }
}

// istanbul ignore next
const checkOrCreateVerification = async (prisma: PrismaClient, user: User) => {
  if (process.env.NODE_ENV === "test") {
    return
  }

  const existingCode = await prisma.verificationCode.findFirst({
    where: { userId: user?.id },
  })

  if (existingCode?.createdAt) {
    const expired = checkCodeExpiry(existingCode?.createdAt)
    if (!expired) {
      return
    }
  }

  if (user && !user?.verified) {
    const code = createCode()
    await sendVerificationCode(user, code, async () => {
      await prisma.verificationCode.create({
        data: { code, user: { connect: { id: user.id } } },
      })
    })
  }
}

export const UserMutations = objectType({
  name: "Mutation",
  definition(t) {
    t.nullable.field("login", {
      type: "User",
      args: { email: nonNull("String"), password: nonNull("String") },
      resolve: async (
        _parent,
        { email, password },
        { prisma, res }: Context
      ) => {
        const user = await prisma.user.findUnique({
          where: {
            email,
            password: await hashPassword(password),
          },
        })
        if (!user) {
          throw new GraphQLError("Invalid credentials", {
            extensions: { code: "INVALID_CREDENTIALS" },
          })
        }
        const accessToken = jwt.sign(
          { email: user.email },
          process.env.JWT_SECRET!,
          { expiresIn: "1h" }
        )
        const refreshToken = jwt.sign(
          { email: user.email },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" }
        )

        // istanbul ignore next-line
        if (res) {
          res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            path: "/graphql/",
          })
        }

        // istanbul ignore if
        if (!user.verified) {
          await checkOrCreateVerification(prisma, user)
        }

        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { accessToken, refreshToken: { push: refreshToken } },
        })
        return updated
      },
    })
    t.field("refreshToken", {
      type: "User",
      resolve: async (_parent, _args, { prisma, res, req }: Context) => {
        // istanbul ignore next-line
        const cookies =
          req.headers.cookie?.split(";").reduce((all, cookie) => {
            const [name, value] = cookie.trim().split("=")
            return { ...all, [name]: value }
          }, {} as Record<string, string>) ?? {}
        const refreshToken = cookies["refresh_token"]

        try {
          jwt.verify(refreshToken, process.env.JWT_SECRET!)
        } catch {
          // istanbul ignore next-line
          if (res) {
            res.clearCookie("refresh_token")
          }
          throw new GraphQLError("Invalid or expired refresh token", {
            extensions: { code: "INVALID_REFRESH_TOKEN" },
          })
        }

        const user = await prisma.user.findFirst({
          where: { refreshToken: { has: refreshToken } },
        })
        // istanbul ignore next-line
        if (!user) {
          if (res) {
            res.clearCookie("refresh_token")
          }
          throw new GraphQLError("Invalid refresh token", {
            extensions: { code: "INVALID_REFRESH_TOKEN" },
          })
        }

        const accessToken = jwt.sign(
          { email: user.email },
          process.env.JWT_SECRET!,
          { expiresIn: "1h" }
        )
        const newRefreshToken = jwt.sign(
          { email: user.email },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" }
        )
        // istanbul ignore next-line
        if (res) {
          res.cookie("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: true,
          })
        }
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: {
            accessToken,
            refreshToken: [
              ...user.refreshToken.filter((token) => token !== refreshToken),
              newRefreshToken,
            ],
          },
        })
        return updated
      },
    })
    t.field("sendResetLink", {
      type: "Boolean",
      args: { email: nonNull("String") },
      resolve: async (
        _parent,
        { email }: { email: string },
        { prisma }: Context
      ) => {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: "USER_NOT_FOUND" },
          })
        }

        const sent = await checkOrCreateResetMail(prisma, user)
        if (!sent) {
          throw new GraphQLError("Reset link already sent", {
            extensions: { code: "RESET_LINK_ALREADY_SENT" },
          })
        }

        return sent
      },
    })
    t.field("resetPassword", {
      type: "Boolean",
      args: {
        token: nonNull("String"),
        password: nonNull("String"),
      },
      resolve: async (
        _parent,
        { token, password }: { token: string; password: string },
        { prisma }: Context
      ) => {
        const decoded = jwt.decode(token) as { email: string; exp: number }
        const expired = isCodeExpired(decoded?.exp * 1000)
        if (expired || !decoded?.exp) {
          throw new GraphQLError("Invalid or expired token", {
            extensions: { code: "INVALID_OR_EXPIRED_TOKEN" },
          })
        }

        const user = await prisma.user.findUnique({
          where: { email: decoded.email },
        })
        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: "USER_NOT_FOUND" },
          })
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: await hashPassword(password),
            resetPasswordToken: null,
          },
        })

        return true
      },
    })
    t.field("register", {
      type: "User",
      args: { data: nonNull("CreateUserInput") },
      resolve: async (
        _parent,
        { data: { name, email, password } },
        { prisma }: Context
      ) => {
        const alreadyExists = await prisma.user.findUnique({
          where: { email },
        })
        if (alreadyExists) {
          throw new GraphQLError("User already exists", {
            extensions: { code: "USER_ALREADY_EXISTS" },
          })
        }
        const accessToken = jwt.sign(
          { email: email },
          process.env.JWT_SECRET!,
          { expiresIn: "1h" }
        )

        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: await hashPassword(password),
            accessToken,
          },
        })

        checkOrCreateVerification(prisma, user)

        return user
      },
    })
    t.field("logout", {
      type: "User",
      resolve: async (_parent, _args, { prisma, user, res }: Context) => {
        // istanbul ignore next-line
        if (res) res.clearCookie("refresh_token")
        return await prisma.user.update({
          where: { id: user?.id },
          data: { accessToken: null, refreshToken: [] },
        })
      },
    })
  },
})
