import { bigint, int, mysqlTable, primaryKey, serial } from "drizzle-orm/mysql-core";
import { noteTemplates } from "./note-templates";
import { quizTemplates } from "./quiz-templates";

export const quizNotes = mysqlTable("quiz_notes", {
  id: serial("id"),
  quizId: bigint("quiz_id", { mode: "number", unsigned: true }).notNull()
    .references(() => quizTemplates.id, { onDelete: "cascade" }),
  noteId: bigint("note_id", { mode: "number", unsigned: true }).notNull()
    .references(() => noteTemplates.id, { onDelete: "cascade" }),
  position: int("position").notNull(),
}, (t) => [
  primaryKey({ columns: [t.quizId, t.noteId] }),
]);
