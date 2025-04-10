import { objectType } from "nexus"
import { VerificationCode as VerificationCodeType } from "nexus-prisma"

export const VerificationCode = objectType({
  name: VerificationCodeType.$name,
  description: VerificationCodeType.$description,
  definition(t) {
    t.field(VerificationCodeType.id)
    t.field(VerificationCodeType.code)
    t.field(VerificationCodeType.user)
    t.field(VerificationCodeType.createdAt)
  },
})
