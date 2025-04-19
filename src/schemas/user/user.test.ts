import jwt from "jsonwebtoken"

import { executeQuery } from "../../../test/helpers"
import { hashPassword } from "../../password"
import prisma from "../../prismaClient"

const sleep = (time: number) => {
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve()
    }, time)
  )
}

describe("Integration test for user methods", () => {
  const loggedInQuery = `
    query loggedIn {
      loggedIn {
        id
        email
        name
      }
    }
  `

  const loginMutation = `
    mutation login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        id
        email
        name
        accessToken
      }
    }
  `

  const refreshTokenMutation = `
    mutation refreshToken {
      refreshToken {
        id
        accessToken
      }
    }
  `

  const sendResetLinkMutation = `
    mutation sendResetLink($email: String!) {
      sendResetLink(email: $email)
    }
  `

  const resetPasswordMutation = `
    mutation resetPassword($token: String!, $password: String!) {
      resetPassword(token: $token, password: $password)
    }
  `

  const registerMutation = `
    mutation register($data: CreateUserInput!) {
      register(data: $data) {
        id
        email
        name
      }
    }
  `

  const logoutMutation = `
    mutation logout {
      logout {
        accessToken
      }
    }
  `

  const usersQuery = `
    query users {
      users {
        id
        email
        name
      }
    }
  `

  beforeAll(async () => {
    const registeredUser = await prisma.user.findFirst({
      where: { email: "registered@example.com" },
    })
    if (registeredUser) {
      await prisma.user.delete({ where: { id: registeredUser.id } })
    }
  })

  test("loggedIn query should return currently logged in user", async () => {
    const response = await executeQuery(loggedInQuery, {}, "test@example.com")

    expect(response.data?.loggedIn).toHaveProperty("id")
    expect(response.data?.loggedIn).toHaveProperty("email", "test@example.com")
    expect(response.data?.loggedIn).toHaveProperty("name")
  })
  
  test("loggedIn query should return an error if not logged in", async () => {
    const response = await executeQuery(loggedInQuery, {}, "notLoggedIn@example.com")

    expect(response.errors?.at(0)?.message).toBe("Not logged in")
    expect(response.errors?.at(0)?.extensions.code).toBe("NOT_LOGGED_IN")
  })

  test("login mutation should login the user", async () => {
    const response = await executeQuery(loginMutation, {
      email: "test@example.com",
      password: "testPassword",
    })

    expect(response.data?.login).toHaveProperty("id")
    expect(response.data?.login).toHaveProperty("email", "test@example.com")
    expect(response.data?.login).toHaveProperty("name")
    expect(response.data?.login).toHaveProperty("accessToken")
  })

  test("login mutation should throw error for invalid credentials", async () => {
    const response = await executeQuery(loginMutation, {
      email: "test@example.com",
      password: "wrongPassword",
    })

    expect(response.errors?.at(0)?.message).toBe("Invalid credentials")
    expect(response.errors?.at(0)?.extensions.code).toBe("INVALID_CREDENTIALS")
  })

  test("should refresh the access token when refresh token is valid", async () => {
    await sleep(1000)
    const user = await prisma.user.findFirst({
      where: { email: "test@example.com" },
    })

    const response = await executeQuery(refreshTokenMutation, {}, undefined, {
      forRefreshToken: "test@example.com",
    })

    expect(response.data?.refreshToken).toHaveProperty("id")
    expect(response.data?.refreshToken).toHaveProperty("accessToken")
    expect(
      (response.data?.refreshToken as { accessToken: string })?.accessToken !==
        user?.accessToken
    ).toBeTruthy()
  })

  test("should throw an error for refreshing tokens with invalid token", async () => {
    const response = await executeQuery(refreshTokenMutation, {}, undefined, {
      forInvalidRefreshToken: "test@example.com",
    })

    expect(response.errors?.at(0)?.message).toBe(
      "Invalid or expired refresh token"
    )
    expect(response.errors?.at(0)?.extensions.code).toBe(
      "INVALID_REFRESH_TOKEN"
    )
  })

  test("should throw an error for refreshing tokens without token", async () => {
    const response = await executeQuery(refreshTokenMutation)

    expect(response.errors?.at(0)?.message).toBe(
      "Invalid or expired refresh token"
    )
    expect(response.errors?.at(0)?.extensions.code).toBe(
      "INVALID_REFRESH_TOKEN"
    )
  })

  test("sendResetLink mutation should send reset link to user", async () => {
    const response = await executeQuery(sendResetLinkMutation, {
      email: "test@example.com",
    })

    expect(response.data?.sendResetLink).toBeTruthy()
  })

  test("sendResetLink should throw an error if link was already sent", async () => {
    const response = await executeQuery(sendResetLinkMutation, {
      email: "test@example.com",
    })

    expect(response.errors?.at(0)?.message).toBe("Reset link already sent")
    expect(response.errors?.at(0)?.extensions.code).toBe(
      "RESET_LINK_ALREADY_SENT"
    )
  })

  test("sendResetLink should throw an error if user doesnt exist", async () => {
    const response = await executeQuery(sendResetLinkMutation, {
      email: "invalid@example.com",
    })

    expect(response.errors?.at(0)?.message).toBe("User not found")
    expect(response.errors?.at(0)?.extensions.code).toBe("USER_NOT_FOUND")
  })

  test("resetPassword mutation should reset the password", async () => {
    const user = await prisma.user.findFirst({
      where: { email: "test@example.com" },
    })

    const response = await executeQuery(resetPasswordMutation, {
      token: user?.resetPasswordToken,
      password: "newPassword",
    })

    expect(response.data?.resetPassword).toBeTruthy()
  })

  test("resetPassword mutation should throw error for invalid token", async () => {
    const response = await executeQuery(resetPasswordMutation, {
      token: "invalid",
      password: "newPassword",
    })

    expect(response.errors?.at(0)?.message).toBe("Invalid or expired token")
    expect(response.errors?.at(0)?.extensions.code).toBe(
      "INVALID_OR_EXPIRED_TOKEN"
    )
  })

  test("resetPassword mutation should throw error for expired token", async () => {
    const response = await executeQuery(resetPasswordMutation, {
      token: jwt.sign(
        { email: "test@example.com" },
        process.env.JWT_SECRET!, {
          expiresIn: 0,
        }
      ),
      password: "newPassword",
    })

    expect(response.errors?.at(0)?.message).toBe("Invalid or expired token")
    expect(response.errors?.at(0)?.extensions.code).toBe(
      "INVALID_OR_EXPIRED_TOKEN"
    )
  })
  
  test("resetPassword mutation should throw error for invalid email", async () => {
    const response = await executeQuery(resetPasswordMutation, {
      token: jwt.sign(
        { email: "invalid@example.com" },
        process.env.JWT_SECRET!, {
          expiresIn: "1h",
        }
      ),
      password: "newPassword",
    })

    expect(response.errors?.at(0)?.message).toBe("User not found")
    expect(response.errors?.at(0)?.extensions.code).toBe(
      "USER_NOT_FOUND"
    )
  })

  test("register mutation should register the user", async () => {
    const response = await executeQuery(
      registerMutation,
      {
        data: {
          name: "Tester",
          email: "registered@example.com",
          password: "testPassword",
        },
      },
      ""
    )

    expect(response.data?.register).toHaveProperty("id")
    expect(response.data?.register).toHaveProperty(
      "email",
      "registered@example.com"
    )
    expect(response.data?.register).toHaveProperty("name", "Tester")
  })

  test("register mutation should throw error for already existing user", async () => {
    const response = await executeQuery(
      registerMutation,
      {
        data: {
          name: "Tester",
          email: "test@example.com",
          password: "testPassword",
        },
      },
      ""
    )

    expect(response.errors?.at(0)?.message).toBe("User already exists")
    expect(response.errors?.at(0)?.extensions.code).toBe("USER_ALREADY_EXISTS")
  })

  test("logout should delete active tokens", async () => {
    const response = await executeQuery(logoutMutation, {}, "test@example.com")
    expect(response.data?.logout).toHaveProperty("accessToken")
    expect(
      (response.data?.logout as { accessToken: string })?.accessToken
    ).toBeNull()
  })

  test("users query should return error if not an admin", async () => {
    const response = await executeQuery(usersQuery, {}, "test@example.com")

    expect(response.errors?.at(0)?.message).toBe("Not Authorised!")
  })
  
  test("users query should return all users if admin", async () => {
    const users = await prisma.user.findMany()
    const response = await executeQuery(usersQuery, {}, "admin@example.com")

    expect(response.data?.users).toHaveLength(users.length)
  })

  afterAll(async () => {
    await prisma.user.update({
      where: { email: "test@example.com" },
      data: {
        resetPasswordToken: null,
        password: await hashPassword("testPassword"),
      },
    })
  })
})
