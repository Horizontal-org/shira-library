import { mysqlTable, serial, int, primaryKey } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";
import { questionTemplates } from "./question-templates";

export const quizQuestions = mysqlTable("quiz_questions", {
  id: serial("id"),
  quizId: int("quiz_id").notNull().references(() => quizTemplates.id, { onDelete: "cascade" }),
  questionId: int("question_id").notNull().references(() => questionTemplates.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.quizId, t.questionId] }),
]);
