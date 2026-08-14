CREATE TABLE `ad_campaigns` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`sponsorId` int NOT NULL,
	`categoryId` int,
	`campaignName` varchar(255) NOT NULL,
	`planType` varchar(50) NOT NULL DEFAULT 'CITY',
	`targetCountry` varchar(100) NOT NULL DEFAULT 'Brasil',
	`targetState` varchar(100),
	`targetCity` varchar(100),
	`status` varchar(50) NOT NULL DEFAULT 'PENDING',
	`startAt` timestamp,
	`endAt` timestamp,
	`budget` decimal(10,2) NOT NULL DEFAULT '0.00',
	`impressionLimit` int NOT NULL DEFAULT 10000,
	`impressionsCount` int NOT NULL DEFAULT 0,
	`clicksCount` int NOT NULL DEFAULT 0,
	`frequencyCapPerDay` int NOT NULL DEFAULT 5,
	`priority` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ad_categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `ad_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `ad_clicks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`creativeId` int NOT NULL,
	`slotCode` varchar(100) NOT NULL,
	`userId` int,
	`sessionId` varchar(100),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ad_creatives` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text NOT NULL,
	`destinationUrl` varchar(500),
	`ctaText` varchar(50) NOT NULL DEFAULT 'Saiba Mais',
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_creatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ad_impressions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`creativeId` int NOT NULL,
	`slotCode` varchar(100) NOT NULL,
	`userId` int,
	`sessionId` varchar(100),
	`userState` varchar(100),
	`userCity` varchar(100),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_impressions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ad_slots` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`slotCode` varchar(100) NOT NULL,
	`position` int NOT NULL,
	`page` varchar(100) NOT NULL DEFAULT 'simulator',
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_slots_id` PRIMARY KEY(`id`),
	CONSTRAINT `ad_slots_slotCode_unique` UNIQUE(`slotCode`)
);
