import { sql } from "drizzle-orm";
import { mysqlTable, serial, boolean, bigint, timestamp, text, varchar } from "drizzle-orm/mysql-core";
import { authors } from "./authors";

export const questionTemplates = mysqlTable("question_templates", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  highlighted: boolean("highlighted").notNull().default(false),
  isPhishing: boolean("is_phishing").notNull(),
  content: text("content").notNull(),
  appType: varchar("app_type", { length: 255 }).notNull(),
  defaultApp: varchar("default_app", { length: 255 }),
  isDemo: boolean("is_demo").notNull().default(false),
  authorId: bigint("author_id", { mode: "number", unsigned: true })
    .references(() => authors.id, { onDelete: "set null" }),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type QuestionTemplate = typeof questionTemplates.$inferSelect;
