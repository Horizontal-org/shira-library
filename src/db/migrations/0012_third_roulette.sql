CREATE TABLE `question_template_images` (
	`question_id` bigint unsigned NOT NULL,
	`image_id` bigint unsigned NOT NULL,
	CONSTRAINT `question_template_images_question_id_image_id_pk` PRIMARY KEY(`question_id`,`image_id`)
);
--> statement-breakpoint
ALTER TABLE `question_template_images` ADD CONSTRAINT `question_template_images_question_id_question_templates_id_fk` FOREIGN KEY (`question_id`) REFERENCES `question_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_template_images` ADD CONSTRAINT `question_template_images_image_id_images_id_fk` FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON DELETE cascade ON UPDATE no action;