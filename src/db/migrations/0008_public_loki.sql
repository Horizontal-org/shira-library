CREATE TABLE `authors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`public_space_id` varchar(27) NOT NULL,
	`space_name` varchar(255) NOT NULL,
	`space_display_name` varchar(255) NOT NULL,
	`organization_name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `authors_id` PRIMARY KEY(`id`),
	CONSTRAINT `authors_public_space_id_unique` UNIQUE(`public_space_id`)
);
--> statement-breakpoint
ALTER TABLE `publish_events` MODIFY COLUMN `author_id` bigint unsigned;--> statement-breakpoint
ALTER TABLE `question_templates` ADD `author_id` bigint unsigned;--> statement-breakpoint
ALTER TABLE `question_templates` ADD `approved` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_templates` ADD `author_id` bigint unsigned;--> statement-breakpoint
ALTER TABLE `quiz_templates` ADD `approved` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `publish_events` ADD CONSTRAINT `publish_events_author_id_authors_id_fk` FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_templates` ADD CONSTRAINT `question_templates_author_id_authors_id_fk` FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_templates` ADD CONSTRAINT `quiz_templates_author_id_authors_id_fk` FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publish_events` DROP COLUMN `author_name`;--> statement-breakpoint
ALTER TABLE `publish_events` DROP COLUMN `author_email`;