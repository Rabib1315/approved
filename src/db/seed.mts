import { config } from "dotenv"
config({ path: ".env.local" })

async function seed() {
  // Use dynamic imports to ensure environment variables are loaded first
  const { db } = await import("./index.mts")
  const { users } = await import("./schema/users-schema.ts")
  
  await db.insert(users).values([
    {
      id: "user_1",
      email: "alice@example.com",
      first_name: "Alice",
      last_name: "Smith",
      country_of_origin: "India",
      current_country: "Canada",
      phone: "+1234567890",
      is_onboarded: true,
    },
    {
      id: "user_2",
      email: "bob@example.com",
      first_name: "Bob",
      last_name: "Johnson",
      country_of_origin: "Nigeria",
      current_country: "Canada",
      phone: "+1987654321",
      is_onboarded: false,
    },
  ])
  console.log("Seed data inserted!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
}) 