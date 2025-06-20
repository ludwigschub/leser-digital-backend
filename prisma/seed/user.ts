import { Role } from "@prisma/client";

import { hashPassword } from "../../src/password";
import prisma from "../../src/prismaClient";

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
  return await Promise.all(
    users.map(async (user) => await prisma.user.create({ data: user }))
  )
}
