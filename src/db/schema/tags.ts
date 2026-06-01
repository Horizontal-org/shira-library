import { sql } from "drizzle-orm";
import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const tags = mysqlTable("tags", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }),
  slug: varchar("slug", { length: 255 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Tag = typeof tags.$inferSelect;
