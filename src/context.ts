import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4"
import { PrismaClient, User } from "@prisma/client"
import jwt from "jsonwebtoken"

import prisma from "./prismaClient"

export interface Context extends ExpressContextFunctionArgument {
  user?: User | null
  prisma: PrismaClient
}

export const isCodeExpired = (expiresAt: number) => {
  return Date.now() >= expiresAt
}

export const createContext = async ({
  req,
  res,
}: ExpressContextFunctionArgument): Promise<Context> => {
  // Get the user from the token in authorization header
  const token = req.headers.authorization || ""
  const hash = token.split(" ")[1]
  const decoded = jwt.decode(hash) as { email: string; exp: number } | null
  const expired = isCodeExpired((decoded?.exp || 0) * 1000)

  if (!decoded || !decoded.email || expired) return { prisma, req, res }

  const user = await prisma.user.findUnique({
    where: { email: decoded.email, accessToken: hash },
  })

  return { prisma, user, req, res }
}
