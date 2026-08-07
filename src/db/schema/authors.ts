import { sql } from "drizzle-orm";
import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const authors = mysqlTable("authors", {
  id: serial().primaryKey(),
  publicSpaceId: varchar("public_space_id", { length: 31 }).notNull().unique(),
  spaceName: varchar("space_name", { length: 255 }).notNull(),
  spaceDisplayName: varchar("space_display_name", { length: 255 }).notNull(),
  organizationName: varchar("organization_name", { length: 255 }).notNull(),
  apiKeyHash: varchar("api_key_hash", { length: 64 }),
  apiKeyPrefix: varchar("api_key_prefix", { length: 12 }),
  apiKeyRevokedAt: timestamp("api_key_revoked_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Author = typeof authors.$inferSelect;
