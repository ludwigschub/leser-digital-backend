import { seedSources } from "./seed/source";
import { seedUsers } from "./seed/user";

const seed = async () => {
  await seedUsers();
  await seedSources()

  console.log("✅ Finished seeding!");
};

seed();
