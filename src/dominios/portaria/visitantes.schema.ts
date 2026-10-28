import { mysqlTable, varchar } from "drizzle-orm/mysql-core";

// ---------------------------------------------------------------
// Tabela: visitantes
// Pessoa externa que visita o condomínio (não faz login).
// ---------------------------------------------------------------
export const visitantes = mysqlTable("visitantes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  // .unique() = o próprio banco impede dois visitantes com o mesmo documento
  documento: varchar("documento", { length: 30 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
});
