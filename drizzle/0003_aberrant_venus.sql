CREATE TABLE `icf_works` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(50) NOT NULL,
	`mediaUrl` text NOT NULL,
	`thumbnailUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `icf_works_id` PRIMARY KEY(`id`)
);
