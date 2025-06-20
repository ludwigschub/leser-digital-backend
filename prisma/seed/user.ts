import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

import prisma from "../../src/prismaClient";

export const hashPassword = async (password: string) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

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
