import { mysqlTable, serial, int, boolean, timestamp } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";

export const questionTemplates = mysqlTable("question_templates", {
  id: serial("id").primaryKey(),
  highlighted: boolean("highlighted"),
  quizId: int("quiz_id").notNull().references(() => quizTemplates.id, { onDelete: "cascade" }),
  isPhishing: boolean("is_phishing"),
  isDemo: boolean("is_demo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
