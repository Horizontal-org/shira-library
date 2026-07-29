import { sql } from "drizzle-orm";
import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const authors = mysqlTable("authors", {
  id: serial().primaryKey(),
  publicSpaceId: varchar("public_space_id", { length: 31 }).notNull().unique(),
  spaceName: varchar("space_name", { length: 255 }).notNull(),
  spaceDisplayName: varchar("space_display_name", { length: 255 }).notNull(),
  organizationName: varchar("organization_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Author = typeof authors.$inferSelect;
