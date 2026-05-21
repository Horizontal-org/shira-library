import { mysqlTable, bigint, primaryKey } from "drizzle-orm/mysql-core";
import { questionTemplates } from "./question-templates";
import { tags } from "./tags";

export const questionTags = mysqlTable("question_tags", {
  questionId: bigint("question_id", { mode: "number", unsigned: true }).notNull().references(() => questionTemplates.id, { onDelete: "cascade" }),
  tagId: bigint("tag_id", { mode: "number", unsigned: true }).notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.questionId, t.tagId] }),
]);

export type QuestionTag = typeof questionTags.$inferSelect;
