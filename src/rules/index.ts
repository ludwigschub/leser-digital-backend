import { authRules } from "./auth";
import { roleRules } from "./roles";

export const rules = { ...roleRules, ...authRules };
