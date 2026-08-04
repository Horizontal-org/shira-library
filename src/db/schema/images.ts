import { sql } from "drizzle-orm";
import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const images = mysqlTable("images", {
  id: serial().primaryKey(),
  hash: varchar("hash", { length: 64 }).notNull().unique(),
  relativePath: varchar("relative_path", { length: 512 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Image = typeof images.$inferSelect;
