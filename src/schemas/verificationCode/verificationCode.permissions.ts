import { rules } from "../../rules";

export const verificationCodeMutationRules = {
  verify: rules.isAuthenticated,
  resendVerificationCode: rules.isAuthenticated,
};
