CREATE TABLE `claim_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claim_id` integer NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_email` text NOT NULL,
	`claim_type` text NOT NULL,
	`period_start` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`purpose` text DEFAULT '' NOT NULL,
	`payload` text NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`advance` real DEFAULT 0 NOT NULL,
	`amount_payable` real DEFAULT 0 NOT NULL,
	`submitted_at` integer,
	`updated_at` integer NOT NULL
);
