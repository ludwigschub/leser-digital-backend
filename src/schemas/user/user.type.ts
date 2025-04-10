import { enumType, inputObjectType, objectType } from "nexus";
import { Role, User as UserType } from "nexus-prisma";

export const UserRoles = enumType({
  name: Role.name,
  members: Role.members,
});

export const User = objectType({
  name: UserType.$name,
  description: UserType.$description,
  definition(t) {
    t.field(UserType.id);
    t.field(UserType.name);
    t.field(UserType.email);
    t.field(UserType.role);
    t.field(UserType.accessToken);
    t.field(UserType.createdAt);
    t.field(UserType.verified);
    t.field(UserType.updatedAt);
  },
});

export const CreateUserInput = inputObjectType({
  name: "CreateUserInput",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.string("email");
    t.nonNull.string("password");
  },
});
