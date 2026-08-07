ALTER TABLE `question_templates` ADD `content_hash` varchar(64);--> statement-breakpoint
CREATE INDEX `question_templates_author_content_hash_idx` ON `question_templates` (`author_id`,`content_hash`);