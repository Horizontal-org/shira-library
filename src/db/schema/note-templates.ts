import { sql } from "drizzle-orm";
import { bigint, mysqlTable, serial, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { authors } from "./authors";

export const noteTemplates = mysqlTable("note_templates", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  content: text("content").notNull(),
  authorId: bigint("author_id", { mode: "number", unsigned: true })
    .references(() => authors.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type NoteTemplate = typeof noteTemplates.$inferSelect;
