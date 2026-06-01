import { sql } from "drizzle-orm";
import { mysqlTable, serial, boolean, timestamp, text, varchar } from "drizzle-orm/mysql-core";

export const questionTemplates = mysqlTable("question_templates", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  highlighted: boolean("highlighted"),
  isPhishing: boolean("is_phishing").notNull(),
  content: text("content").notNull(),
  appType: varchar("app_type", { length: 255 }).notNull(),
  defaultApp: varchar("default_app", { length: 255 }),
  isDemo: boolean("is_demo"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type QuestionTemplate = typeof questionTemplates.$inferSelect;
