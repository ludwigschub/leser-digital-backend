import { ExecutionResult, graphql } from "graphql"
import { applyMiddleware } from "graphql-middleware"
import jwt from "jsonwebtoken"

import { permissions } from "../src/permissions"
import prisma from "../src/prismaClient"
import schema from "../src/schema"

const schemaWithPermissions = applyMiddleware(schema, permissions)

/**
 * Execute a GraphQL query in the default context
 * @param query The GraphQL Query to be executed
 * @param variableValues The variables used in the query
 * @param userEmail The email of the user that this query should be executed as, falls back to the fake student's email
 */
export async function executeQuery(
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variableValues?: { [name: string]: any },
  userEmail?: string,
  {
    forRefreshToken,
    forInvalidRefreshToken,
    forExpiredRefreshToken,
  }: {
    forRefreshToken?: string
    forInvalidRefreshToken?: boolean
    forExpiredRefreshToken?: string
  } = {}
): Promise<ExecutionResult> {
  let user = null
  let refreshToken = null

  if (forRefreshToken) {
    // istanbul ignore next-line
    refreshToken = (
      await prisma.user.findUnique({ where: { email: forRefreshToken } })
    )?.refreshToken[0]
  } else if (forInvalidRefreshToken) {
    refreshToken = jwt.sign({ email: "asdf" }, process.env.JWT_SECRET!, {
      expiresIn: "1m",
    })
  } else if (forExpiredRefreshToken) {
    refreshToken = jwt.sign({ email: "asdf" }, process.env.JWT_SECRET!, {
      expiresIn: "0s",
    })
  } else if (userEmail) {
    user = await prisma.user.findUnique({ where: { email: userEmail } })
  }

  return graphql({
    source: query,
    variableValues,
    schema: schemaWithPermissions,
    contextValue: {
      prisma,
      user,
      req: { headers: { cookie: `refresh_token=${refreshToken};` } },
    },
  })
}
