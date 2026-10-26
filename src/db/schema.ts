import { mysqlTable, varchar, int } from "drizzle-orm/mysql-core";

// ---------------------------------------------------------------
// Tabela 1: visitantes
// Pessoa externa que visita o condomínio (não faz login).
// ---------------------------------------------------------------
export const visitantes = mysqlTable("visitantes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  // .unique() = o próprio banco impede dois visitantes com o mesmo documento
  documento: varchar("documento", { length: 30 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
});

// ---------------------------------------------------------------
// Tabela 2: areas_comuns
// Salão de festas, churrasqueira, quadra etc.
// ---------------------------------------------------------------
export const areasComuns = mysqlTable("areas_comuns", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  capacidade: int("capacidade").notNull(),
  regras: varchar("regras", { length: 500 }).notNull(),
  // 'ativa' ou 'inativa'. Se não for informado, vira 'ativa'.
  status: varchar("status", { length: 20 }).notNull().default("ativa"),
});
