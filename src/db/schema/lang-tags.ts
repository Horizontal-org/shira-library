import { sql } from "drizzle-orm";
import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const langTags = mysqlTable("lang_tags", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }),
  code: varchar("code", { length: 10 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type LangTag = typeof langTags.$inferSelect;
