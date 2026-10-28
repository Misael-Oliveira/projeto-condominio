import { mysqlTable, varchar, int } from "drizzle-orm/mysql-core";

// ---------------------------------------------------------------
// Tabela: areas_comuns
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
