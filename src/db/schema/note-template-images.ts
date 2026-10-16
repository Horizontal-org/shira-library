import { bigint, mysqlTable, primaryKey } from "drizzle-orm/mysql-core";
import { images } from "./images";
import { noteTemplates } from "./note-templates";

export const noteTemplateImages = mysqlTable("note_template_images", {
  noteId: bigint("note_id", { mode: "number", unsigned: true }).notNull()
    .references(() => noteTemplates.id, { onDelete: "cascade" }),
  imageId: bigint("image_id", { mode: "number", unsigned: true }).notNull()
    .references(() => images.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.noteId, t.imageId] }),
]);
