import http from "http"

import express from "express"

import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import cors from "cors"

import { createContext } from "./context"
import { createServer } from "./server"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app = express() as any
const PORT = process.env.PORT || 4000

const httpServer = http.createServer(app)

// Initialize GraphQL server
const server = createServer(httpServer)

// Middleware
app.use(express.json())

server.start().then(async () => {
  // Set up our Express middleware to handle CORS, body parsing
  app.use(
    cors<cors.CorsRequest>({
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
      origin:
        app.settings.env === "development" ? process.env.FRONTEND_URL : "*",
    })
  )

  app.use(
    "/graphql",
    expressMiddleware(server as unknown as ApolloServer, {
      context: createContext,
    })
  )

  // istanbul ignore if
  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
    })
  }
})

export default app
