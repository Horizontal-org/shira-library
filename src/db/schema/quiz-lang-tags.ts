import { mysqlTable, bigint, primaryKey } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";
import { langTags } from "./lang-tags";

export const quizLangTags = mysqlTable("quiz_lang_tags", {
  quizId: bigint("quiz_id", { mode: "number", unsigned: true }).notNull().references(() => quizTemplates.id, { onDelete: "cascade" }),
  langTagId: bigint("lang_tag_id", { mode: "number", unsigned: true }).notNull().references(() => langTags.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.quizId, t.langTagId] }),
]);

export type QuizLangTag = typeof quizLangTags.$inferSelect;
