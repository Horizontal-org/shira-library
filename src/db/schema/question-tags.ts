import { mysqlTable, int, primaryKey } from "drizzle-orm/mysql-core";
import { questionTemplates } from "./question-templates";
import { tags } from "./tags";

export const questionTags = mysqlTable("question_tags", {
  questionId: int("question_id").notNull().references(() => questionTemplates.id, { onDelete: "cascade" }),
  tagId: int("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.questionId, t.tagId] }),
]);
