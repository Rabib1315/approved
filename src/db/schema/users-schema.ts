import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  country_of_origin: text("country_of_origin"),
  current_country: text("current_country"),
  phone: text("phone"),
  is_onboarded: boolean("is_onboarded").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertUser = typeof users.$inferInsert
export type SelectUser = typeof users.$inferSelect 