import { mysqlTable, int, primaryKey } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";
import { tags } from "./tags";

export const quizTags = mysqlTable("quiz_tags", {
  quizId: int("quiz_id").notNull().references(() => quizTemplates.id, { onDelete: "cascade" }),
  tagId: int("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.quizId, t.tagId] }),
]);
