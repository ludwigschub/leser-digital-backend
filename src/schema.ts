import { makeSchema } from "nexus";
import {
  // Import DateTime scalar
  DateTime as dateTimeScalar,
} from "nexus-prisma/scalars";

import * as types from "./schemas";

const schema = makeSchema({
  types: { ...types, dateTimeScalar },
  outputs: {
    schema: __dirname + "/../node_modules/@generated/schema.graphql",
    typegen: __dirname + "/../node_modules/@generated/nexus.ts",
  },
  contextType: {
    module: require.resolve("./context"),
    export: "Context",
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },
});

export default schema;
