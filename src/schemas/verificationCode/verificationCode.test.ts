import { executeQuery } from "../../../test/helpers"
import prisma from "../../prismaClient"

import { createCode } from "./verificationCode.mutations"

describe("Integration Test for verificationCode methods", () => {
  const EXAMPLE_CODE = createCode()
  const EXAMPLE_EMAIL = "unverified@example.com"
  const verifyMutation = `
    mutation verify($code: String!) {
        verify(code: $code) {
            id
            verified
        }
    }
`
  const resendVerificationCodeMutation = `
    mutation resendCode {
        resendVerificationCode
    }
`

  beforeAll(async () => {
    await prisma.user.create({
      data: {
        name: "Unverified User",
        email: EXAMPLE_EMAIL,
        password: "testPassword",
      },
    })
    await prisma.verificationCode.create({
      data: {
        code: EXAMPLE_CODE,
        user: { connect: { email: EXAMPLE_EMAIL } },
      },
    })
  })

  test("should verify the user with a valid code", async () => {
    const response = await executeQuery(
      verifyMutation,
      {
        code: EXAMPLE_CODE,
      },
      EXAMPLE_EMAIL
    )

    expect(response.data?.verify).toHaveProperty("id")
    expect(response.data?.verify).toHaveProperty("verified", true)
  })

  test("should throw error if verification code is invalid", async () => {
    const response = await executeQuery(
      verifyMutation,
      {
        code: "invalid",
      },
      EXAMPLE_EMAIL
    )

    expect(response.errors).toBeDefined()
    expect(response.errors).toHaveLength(1)
    expect(response.errors![0].message).toBe("Invalid verification code")
    expect(response.errors![0].extensions.code).toBe(
      "INVALID_VERIFICATION_CODE"
    )
  })

  test("should throw error if verification code is expired", async () => {
    // Create a verification code with expired date
    const EXAMPLE_CODE = createCode()
    await prisma.verificationCode.create({
      data: {
        code: EXAMPLE_CODE,
        user: { connect: { email: EXAMPLE_EMAIL } },
        createdAt: new Date(0),
      },
    })

    const response = await executeQuery(
      verifyMutation,
      {
        code: EXAMPLE_CODE,
      },
      EXAMPLE_EMAIL
    )

    expect(response.errors).toBeDefined()
    expect(response.errors).toHaveLength(1)
    expect(response.errors![0].message).toBe("Verification code expired")
    expect(response.errors![0].extensions.code).toBe(
      "VERIFICATION_CODE_EXPIRED"
    )
  })

  test("should resend verification code", async () => {
    // Create a verification code with expired date
    const EXAMPLE_CODE = createCode()
    await prisma.verificationCode.deleteMany({
      where: { user: { email: EXAMPLE_EMAIL } },
    })
    await prisma.verificationCode.create({
      data: {
        code: EXAMPLE_CODE,
        user: { connect: { email: EXAMPLE_EMAIL } },
        createdAt: new Date(0),
      },
    })

    const response = await executeQuery(
      resendVerificationCodeMutation,
      {},
      EXAMPLE_EMAIL
    )

    expect(response.data?.resendVerificationCode).toBe(true)
  })

  test("should throw error if code was already sent and is not expired", async () => {
    const response = await executeQuery(
      resendVerificationCodeMutation,
      {},
      EXAMPLE_EMAIL
    )

    expect(response.errors).toBeDefined()
    expect(response.errors).toHaveLength(1)
    expect(response.errors![0].message).toBe("Code already sent")
    expect(response.errors![0].extensions.code).toBe("CODE_ALREADY_SENT")
  })

  afterAll(async () => {
    await prisma.user.delete({
      where: { email: EXAMPLE_EMAIL },
    })
  })
})
