import { mysqlTable, serial, bigint, primaryKey } from "drizzle-orm/mysql-core";
import { quizTemplates } from "./quiz-templates";
import { questionTemplates } from "./question-templates";

export const quizQuestions = mysqlTable("quiz_questions", {
  id: serial("id"),
  quizId: bigint("quiz_id", { mode: "number", unsigned: true }).notNull().references(() => quizTemplates.id, { onDelete: "cascade" }),
  questionId: bigint("question_id", { mode: "number", unsigned: true }).notNull().references(() => questionTemplates.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.quizId, t.questionId] }),
]);

export type QuizQuestion = typeof quizQuestions.$inferSelect;
