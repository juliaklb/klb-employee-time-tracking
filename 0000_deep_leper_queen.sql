CREATE TABLE `time_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timesheet_id` integer NOT NULL,
	`work_date` text NOT NULL,
	`status` text NOT NULL,
	`hours` real DEFAULT 0 NOT NULL,
	`lieu_used` real DEFAULT 0 NOT NULL,
	`lieu_accrued` real DEFAULT 0 NOT NULL,
	`travel` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `timesheets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_email` text NOT NULL,
	`period_start` text NOT NULL,
	`week` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`submitted_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `timesheet_employee_period_week` ON `timesheets` (`employee_email`,`period_start`,`week`);--> statement-breakpoint
CREATE TABLE `users` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'employee' NOT NULL,
	`created_at` integer NOT NULL
);
