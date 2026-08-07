ALTER TABLE `authors` ADD `api_key_hash` varchar(64);--> statement-breakpoint
ALTER TABLE `authors` ADD `api_key_prefix` varchar(12);--> statement-breakpoint
ALTER TABLE `authors` ADD `api_key_revoked_at` timestamp DEFAULT NULL;