import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core"

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  status: text("status").notNull().default("draft"),
  institution: text("institution").notNull(),
  program: text("program").notNull(),
  start_date: text("start_date").notNull(),
  total_cost: text("total_cost").notNull(),
  strength_score: integer("strength_score"),
  is_complete: boolean("is_complete").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertApplication = typeof applications.$inferInsert
export type SelectApplication = typeof applications.$inferSelect 