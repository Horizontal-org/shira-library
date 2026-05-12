import { mysqlTable, serial, varchar, text, int, timestamp } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";

export const questionTemplates = mysqlTable("question_templates", {
  id: serial("id").primaryKey(),
  quizTemplateId: int("quiz_template_id").notNull().references(() => quizTemplates.id, { onDelete: "cascade" }),
  //add things
  createdAt: timestamp("created_at").defaultNow(),
});
