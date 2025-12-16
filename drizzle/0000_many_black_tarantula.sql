CREATE TABLE `places` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`type` text NOT NULL,
	`query` text NOT NULL,
	`thumbnail` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wishes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item` text NOT NULL,
	`fulfilled` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
