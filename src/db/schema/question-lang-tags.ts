import { mysqlTable, int, primaryKey } from "drizzle-orm/mysql-core";
import { questionTemplates } from "./question-templates";
import { langTags } from "./lang-tags";

export const questionLangTags = mysqlTable("question_lang_tags", {
  questionId: int("question_id").notNull().references(() => questionTemplates.id, { onDelete: "cascade" }),
  langTagId: int("lang_tag_id").notNull().references(() => langTags.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.questionId, t.langTagId] }),
]);
