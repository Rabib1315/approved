import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core"
import { applications } from "./applications-schema"

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  application_id: integer("application_id").references(() => applications.id),
  type: text("type").notNull(), // passport, transcript, letter_of_acceptance, etc.
  filename: text("filename").notNull(),
  original_name: text("original_name").notNull(),
  size: integer("size").notNull(),
  mime_type: text("mime_type").notNull(),
  storage_path: text("storage_path").notNull(),
  text_content: text("text_content"), // extracted text for AI/analysis
  is_verified: boolean("is_verified").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertDocument = typeof documents.$inferInsert
export type SelectDocument = typeof documents.$inferSelect 