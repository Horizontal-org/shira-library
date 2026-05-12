import { mysqlTable, serial, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const quizTemplates = mysqlTable("quiz_templates", {
  id: serial("id").primaryKey(),
  //add things
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
