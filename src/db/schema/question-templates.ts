import { sql } from "drizzle-orm";
import { mysqlTable, serial, bigint, boolean, timestamp, text, varchar } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";

export const questionTemplates = mysqlTable("question_templates", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }),
  highlighted: boolean("highlighted"),
  isPhishing: boolean("is_phishing"),
  content: text("content").notNull(),
  isDemo: boolean("is_demo"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type QuestionTemplate = typeof questionTemplates.$inferSelect;
