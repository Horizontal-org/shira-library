import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

export const langTags = mysqlTable("lang_tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  code: varchar("code", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
