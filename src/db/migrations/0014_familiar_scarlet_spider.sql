CREATE TABLE `images` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`hash` varchar(64) NOT NULL,
	`relative_path` varchar(512) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `images_id` PRIMARY KEY(`id`),
	CONSTRAINT `images_hash_unique` UNIQUE(`hash`)
);
--> statement-breakpoint
CREATE TABLE `question_template_images` (
	`question_id` bigint unsigned NOT NULL,
	`image_id` bigint unsigned NOT NULL,
	CONSTRAINT `question_template_images_question_id_image_id_pk` PRIMARY KEY(`question_id`,`image_id`)
);
--> statement-breakpoint
ALTER TABLE `question_template_images` ADD CONSTRAINT `question_template_images_question_id_question_templates_id_fk` FOREIGN KEY (`question_id`) REFERENCES `question_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_template_images` ADD CONSTRAINT `question_template_images_image_id_images_id_fk` FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON DELETE cascade ON UPDATE no action;