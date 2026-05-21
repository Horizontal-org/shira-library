import { mysqlTable, bigint, primaryKey } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";
import { tags } from "./tags";

export const quizTags = mysqlTable("quiz_tags", {
  quizId: bigint("quiz_id", { mode: "number", unsigned: true }).notNull().references(() => quizTemplates.id, { onDelete: "cascade" }),
  tagId: bigint("tag_id", { mode: "number", unsigned: true }).notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.quizId, t.tagId] }),
]);

export type QuizTag = typeof quizTags.$inferSelect;
