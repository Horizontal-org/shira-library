import { mysqlTable, int, primaryKey } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";
import { langTags } from "./lang-tags";

export const quizLangTags = mysqlTable("quiz_lang_tags", {
  quizId: int("quiz_id").notNull().references(() => quizTemplates.id, { onDelete: "cascade" }),
  langTagId: int("lang_tag_id").notNull().references(() => langTags.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.quizId, t.langTagId] }),
]);
