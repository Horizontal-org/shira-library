RENAME TABLE `question_template_images` TO `images`;--> statement-breakpoint
ALTER TABLE `images` DROP FOREIGN KEY `question_template_images_question_id_question_templates_id_fk`;
--> statement-breakpoint
ALTER TABLE `images` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `images` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `images` ADD `hash` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `images` ADD CONSTRAINT `images_hash_unique` UNIQUE(`hash`);--> statement-breakpoint
ALTER TABLE `images` DROP COLUMN `question_id`;