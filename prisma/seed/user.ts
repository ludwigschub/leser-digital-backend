import crypto from "crypto"

import { Role } from "@prisma/client"

import prisma from "../../src/prismaClient"

export const hashPassword = async (password: string) => {
  const passwordHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  )
  return Buffer.from(passwordHash).toString("base64")
}

const getUsers = async () => [
  {
    email: "test@example.com",
    password: await hashPassword("testPassword"),
    name: "TestUser",
    verified: true,
    role: Role.USER,
  },
  {
    email: "admin@example.com",
    password: await hashPassword("adminPassword"),
    name: "AdminUser",
    verified: true,
    role: Role.ADMIN,
  },
]

export const seedUsers = async () => {
  const users = await getUsers()
  await Promise.all(
    users.map(async (user) => {
      await prisma.user.create({ data: user })
    })
  )
}
