import { mysqlTable, serial, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const quizTemplates = mysqlTable("quiz_templates", {
  id: serial("id").primaryKey(),
  //add things
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
