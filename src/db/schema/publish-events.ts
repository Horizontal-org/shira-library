import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const publishEvents = mysqlTable("publish_events", {
  id: serial("id").primaryKey(),
  resourceType: varchar("resource_type", { length: 50 }),
  resourceId: varchar("resource_id", { length: 255 }),
  authorId: varchar("author_id", { length: 255 }),
  authorName: varchar("author_name", { length: 255 }),
  authorEmail: varchar("author_email", { length: 255 }),
  status: varchar("status", { length: 50 }),
  rejectedNote: varchar("rejected_note", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
