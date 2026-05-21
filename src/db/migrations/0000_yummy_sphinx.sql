CREATE TABLE `explanation_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`question_id` bigint unsigned NOT NULL,
	`position` varchar(255),
	`position_index` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `explanation_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lang_tags` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`code` varchar(10),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `lang_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publish_events` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`resource_type` varchar(50),
	`resource_id` varchar(255),
	`author_id` varchar(255),
	`author_name` varchar(255),
	`author_email` varchar(255),
	`status` varchar(50),
	`rejected_note` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `publish_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_lang_tags` (
	`question_id` bigint unsigned NOT NULL,
	`lang_tag_id` bigint unsigned NOT NULL,
	CONSTRAINT `question_lang_tags_question_id_lang_tag_id_pk` PRIMARY KEY(`question_id`,`lang_tag_id`)
);
--> statement-breakpoint
CREATE TABLE `question_tags` (
	`question_id` bigint unsigned NOT NULL,
	`tag_id` bigint unsigned NOT NULL,
	CONSTRAINT `question_tags_question_id_tag_id_pk` PRIMARY KEY(`question_id`,`tag_id`)
);
--> statement-breakpoint
CREATE TABLE `question_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`highlighted` boolean,
	`quiz_id` bigint unsigned NOT NULL,
	`is_phishing` boolean,
	`is_demo` boolean,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `question_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_lang_tags` (
	`quiz_id` bigint unsigned NOT NULL,
	`lang_tag_id` bigint unsigned NOT NULL,
	CONSTRAINT `quiz_lang_tags_quiz_id_lang_tag_id_pk` PRIMARY KEY(`quiz_id`,`lang_tag_id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` serial AUTO_INCREMENT,
	`quiz_id` bigint unsigned NOT NULL,
	`question_id` bigint unsigned NOT NULL,
	CONSTRAINT `quiz_questions_quiz_id_question_id_pk` PRIMARY KEY(`quiz_id`,`question_id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_tags` (
	`quiz_id` bigint unsigned NOT NULL,
	`tag_id` bigint unsigned NOT NULL,
	CONSTRAINT `quiz_tags_quiz_id_tag_id_pk` PRIMARY KEY(`quiz_id`,`tag_id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`language` varchar(10),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `explanation_templates` ADD CONSTRAINT `explanation_templates_question_id_question_templates_id_fk` FOREIGN KEY (`question_id`) REFERENCES `question_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_lang_tags` ADD CONSTRAINT `question_lang_tags_question_id_question_templates_id_fk` FOREIGN KEY (`question_id`) REFERENCES `question_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_lang_tags` ADD CONSTRAINT `question_lang_tags_lang_tag_id_lang_tags_id_fk` FOREIGN KEY (`lang_tag_id`) REFERENCES `lang_tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_tags` ADD CONSTRAINT `question_tags_question_id_question_templates_id_fk` FOREIGN KEY (`question_id`) REFERENCES `question_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_tags` ADD CONSTRAINT `question_tags_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_templates` ADD CONSTRAINT `question_templates_quiz_id_quiz_templates_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quiz_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_lang_tags` ADD CONSTRAINT `quiz_lang_tags_quiz_id_quiz_templates_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quiz_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_lang_tags` ADD CONSTRAINT `quiz_lang_tags_lang_tag_id_lang_tags_id_fk` FOREIGN KEY (`lang_tag_id`) REFERENCES `lang_tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_quiz_id_quiz_templates_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quiz_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_question_id_question_templates_id_fk` FOREIGN KEY (`question_id`) REFERENCES `question_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_tags` ADD CONSTRAINT `quiz_tags_quiz_id_quiz_templates_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quiz_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_tags` ADD CONSTRAINT `quiz_tags_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;