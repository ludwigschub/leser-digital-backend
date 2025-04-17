import http from "http";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { applyMiddleware } from "graphql-middleware";

import { Context } from "./context";
import { permissions } from "./permission";
import schema from "./schema";

// Initialize GraphQL server
export const createServer = (httpServer: http.Server): ApolloServer<Context> => {
  const schemaWithPermissions = applyMiddleware(schema, permissions);

  return new ApolloServer<Context>({
    schema: schemaWithPermissions,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: process.env.NODE_ENV === "development",
  });
};
