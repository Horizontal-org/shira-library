import { sql } from "drizzle-orm";
import { mysqlTable, serial, varchar, bigint, timestamp } from "drizzle-orm/mysql-core";
import { authors } from "./authors";

export const publishEvents = mysqlTable("publish_events", {
  id: serial().primaryKey(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }).notNull(),
  authorId: bigint("author_id", { mode: "number", unsigned: true })
    .references(() => authors.id, { onDelete: "set null" }),
  status: varchar("status", { length: 50 }),
  submissionNote: varchar("submission_note", { length: 1000 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type PublishEvent = typeof publishEvents.$inferSelect;
