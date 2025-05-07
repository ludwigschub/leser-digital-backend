import { inputObjectType } from "nexus"

export * from "./user"
export * from "./verificationCode"

export * from "./article"
export * from "./articleActivity"
export * from "./editor"
export * from "./source"
export * from "./subscription"
export * from "./topic"

export const PaginationInput = inputObjectType({
  name: "PaginationInput",
  definition(t) {
    t.int("offset", { default: 0 })
    t.int("limit", { default: 10 })
  },
})
