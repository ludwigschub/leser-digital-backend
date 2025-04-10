import { rule } from "graphql-shield";

export const authRules = {
  isAuthenticated: rule()(
    async (_root, _args, { user }) => {
      return !!user;
    }
  ),
};
