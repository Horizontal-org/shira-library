ALTER TABLE `question_templates` DROP FOREIGN KEY `question_templates_quiz_id_quiz_templates_id_fk`;
--> statement-breakpoint
ALTER TABLE `question_templates` DROP COLUMN `quiz_id`;--> statement-breakpoint
ALTER TABLE `quiz_templates` DROP COLUMN `language`;