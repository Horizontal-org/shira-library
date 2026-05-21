import { sql } from "drizzle-orm";
import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const quizTemplates = mysqlTable("quiz_templates", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 255 }),
  language: varchar("language", { length: 10 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type QuizTemplate = typeof quizTemplates.$inferSelect;
