import { mysqlTable, bigint, primaryKey } from "drizzle-orm/mysql-core";
import { questionTemplates } from "./question-templates";
import { images } from "./images";

export const questionTemplateImages = mysqlTable("question_template_images", {
  questionId: bigint("question_id", { mode: "number", unsigned: true }).notNull()
    .references(() => questionTemplates.id, { onDelete: "cascade" }),
  imageId: bigint("image_id", { mode: "number", unsigned: true }).notNull()
    .references(() => images.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.questionId, t.imageId] }),
]);

export type QuestionTemplateImageLink = typeof questionTemplateImages.$inferSelect;
