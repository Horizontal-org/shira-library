import { sql } from "drizzle-orm";
import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const tags = mysqlTable("tags", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Tag = typeof tags.$inferSelect;
