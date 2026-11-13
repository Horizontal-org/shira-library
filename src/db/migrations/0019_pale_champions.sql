CREATE TABLE
	`note_template_images` (
		`note_id` bigint unsigned NOT NULL,
		`image_id` bigint unsigned NOT NULL,
		CONSTRAINT `note_template_images_note_id_image_id_pk` PRIMARY KEY (`note_id`, `image_id`)
	);

--> statement-breakpoint
CREATE TABLE
	`note_templates` (
		`id` serial AUTO_INCREMENT NOT NULL,
		`name` varchar(100) NOT NULL,
		`content` text NOT NULL,
		`author_id` bigint unsigned,
		`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT `note_templates_id` PRIMARY KEY (`id`)
	);

--> statement-breakpoint
CREATE TABLE
	`quiz_notes` (
		`id` serial AUTO_INCREMENT,
		`quiz_id` bigint unsigned NOT NULL,
		`note_id` bigint unsigned NOT NULL,
		`position` int NOT NULL,
		CONSTRAINT `quiz_notes_quiz_id_note_id_pk` PRIMARY KEY (`quiz_id`, `note_id`)
	);

--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `position` int DEFAULT 0 NOT NULL;

--> statement-breakpoint
ALTER TABLE `note_template_images` ADD CONSTRAINT `note_template_images_note_id_note_templates_id_fk` FOREIGN KEY (`note_id`) REFERENCES `note_templates` (`id`) ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE `note_template_images` ADD CONSTRAINT `note_template_images_image_id_images_id_fk` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`) ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE `note_templates` ADD CONSTRAINT `note_templates_author_id_authors_id_fk` FOREIGN KEY (`author_id`) REFERENCES `authors` (`id`) ON DELETE set null ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE `quiz_notes` ADD CONSTRAINT `quiz_notes_quiz_id_quiz_templates_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quiz_templates` (`id`) ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE `quiz_notes` ADD CONSTRAINT `quiz_notes_note_id_note_templates_id_fk` FOREIGN KEY (`note_id`) REFERENCES `note_templates` (`id`) ON DELETE cascade ON UPDATE no action;