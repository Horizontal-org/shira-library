ALTER TABLE `explanation_templates` MODIFY COLUMN `position` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `explanation_templates` MODIFY COLUMN `position_index` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `lang_tags` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `lang_tags` MODIFY COLUMN `code` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `question_templates` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `question_templates` MODIFY COLUMN `highlighted` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `question_templates` MODIFY COLUMN `highlighted` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `question_templates` MODIFY COLUMN `is_phishing` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `question_templates` MODIFY COLUMN `is_demo` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `question_templates` MODIFY COLUMN `is_demo` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_templates` MODIFY COLUMN `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `tags` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `tags` MODIFY COLUMN `slug` varchar(255) NOT NULL;