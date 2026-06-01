import { sql } from "drizzle-orm";
import { mysqlTable, serial, bigint, varchar, timestamp, text } from "drizzle-orm/mysql-core";
import { questionTemplates } from "./question-templates";

export const explanationTemplates = mysqlTable("explanation_templates", {
  id: serial().primaryKey(),
  questionId: bigint("question_id", { mode: "number", unsigned: true }).notNull().references(() => questionTemplates.id, { onDelete: "cascade" }),
  position: varchar("position", { length: 255 }).notNull(),
  positionIndex: varchar("position_index", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type ExplanationTemplate = typeof explanationTemplates.$inferSelect;
