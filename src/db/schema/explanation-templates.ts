import { mysqlTable, serial, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { questionTemplates } from "./question-templates";

export const explanationTemplates = mysqlTable("explanation_templates", {
  id: serial("id").primaryKey(),
  questionId: int("question_id").notNull().references(() => questionTemplates.id, { onDelete: "cascade" }),
  position: varchar("position", { length: 255 }),
  positionIndex: varchar("position_index", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
