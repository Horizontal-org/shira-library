import { mysqlTable, serial, varchar, text, int, timestamp } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";

export const questionTemplates = mysqlTable("question_templates", {
  id: serial("id").primaryKey(),
  quizTemplateId: int("quiz_template_id").notNull().references(() => quizTemplates.id, { onDelete: "cascade" }),
  //add things
  question: text("question").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  options: text("options"),
  correctAnswer: text("correct_answer").notNull(),
  order: int("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
