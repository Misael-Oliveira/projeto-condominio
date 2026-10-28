CREATE TABLE `visitantes` (
	`id` varchar(36) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`documento` varchar(30) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	CONSTRAINT `visitantes_id` PRIMARY KEY(`id`),
	CONSTRAINT `visitantes_documento_unique` UNIQUE(`documento`)
);
--> statement-breakpoint
CREATE TABLE `areas_comuns` (
	`id` varchar(36) NOT NULL,
	`nome` varchar(100) NOT NULL,
	`capacidade` int NOT NULL,
	`regras` varchar(500) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'ativa',
	CONSTRAINT `areas_comuns_id` PRIMARY KEY(`id`)
);
