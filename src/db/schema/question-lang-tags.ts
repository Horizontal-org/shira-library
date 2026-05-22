import { mysqlTable, bigint, primaryKey } from "drizzle-orm/mysql-core";
import { questionTemplates } from "./question-templates";
import { langTags } from "./lang-tags";

export const questionLangTags = mysqlTable("question_lang_tags", {
  questionId: bigint("question_id", { mode: "number", unsigned: true }).notNull().references(() => questionTemplates.id, { onDelete: "cascade" }),
  langTagId: bigint("lang_tag_id", { mode: "number", unsigned: true }).notNull().references(() => langTags.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.questionId, t.langTagId] }),
]);

export type QuestionLangTag = typeof questionLangTags.$inferSelect;
