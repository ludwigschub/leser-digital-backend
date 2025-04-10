import { seedUsers } from "./seed/user";

const seed = async () => {
  await seedUsers();

  console.log("✅ Finished seeding!");
};

seed();
