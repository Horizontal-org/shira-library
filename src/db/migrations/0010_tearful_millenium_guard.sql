CREATE TABLE `question_template_images` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`question_id` bigint unsigned,
	`relative_path` varchar(512) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `question_template_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `question_template_images` ADD CONSTRAINT `question_template_images_question_id_question_templates_id_fk` FOREIGN KEY (`question_id`) REFERENCES `question_templates`(`id`) ON DELETE cascade ON UPDATE no action;