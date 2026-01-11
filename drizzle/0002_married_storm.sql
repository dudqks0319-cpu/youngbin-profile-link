ALTER TABLE `links` ADD `icon` varchar(50);--> statement-breakpoint
ALTER TABLE `links` ADD `backgroundColor` varchar(50);--> statement-breakpoint
ALTER TABLE `links` ADD `textColor` varchar(50);--> statement-breakpoint
ALTER TABLE `profiles` ADD `backgroundImageUrl` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `backgroundColor` varchar(50);--> statement-breakpoint
ALTER TABLE `profiles` ADD `socialLinks` json;