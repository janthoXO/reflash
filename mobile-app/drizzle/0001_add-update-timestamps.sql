PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_flashcards` (
	`id` integer PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`dueAt` integer DEFAULT 0 NOT NULL,
	`unitId` integer NOT NULL,
	`updatedAt` integer DEFAULT 0 NOT NULL,
	`deletedAt` integer,
	FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_flashcards`("id", "question", "answer", "dueAt", "unitId", "updatedAt", "deletedAt") SELECT "id", "question", "answer", "dueAt", "unitId", "updatedAt", "deletedAt" FROM `flashcards`;--> statement-breakpoint
DROP TABLE `flashcards`;--> statement-breakpoint
ALTER TABLE `__new_flashcards` RENAME TO `flashcards`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `courses` ADD `updatedAt` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `deletedAt` integer;--> statement-breakpoint
ALTER TABLE `units` ADD `updatedAt` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `units` ADD `deletedAt` integer;