ALTER TABLE `question_templates` MODIFY COLUMN `quiz_id` bigint unsigned;--> statement-breakpoint
ALTER TABLE `question_templates` ADD `name` varchar(255);