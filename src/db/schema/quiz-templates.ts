import { sql } from "drizzle-orm";
import { mysqlTable, serial, varchar, text, boolean, bigint, timestamp } from "drizzle-orm/mysql-core";
import { authors } from "./authors";

export const quizTemplates = mysqlTable("quiz_templates", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  authorId: bigint("author_id", { mode: "number", unsigned: true })
    .references(() => authors.id, { onDelete: "set null" }),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type QuizTemplate = typeof quizTemplates.$inferSelect;
