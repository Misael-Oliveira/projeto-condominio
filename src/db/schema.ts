// Este arquivo só REEXPORTA as tabelas de cada domínio.
// O drizzle-kit (migrations) e o db/index.ts leem tudo por aqui.
// Ao criar uma tabela nova, acrescente uma linha abaixo.

// Portaria
export * from '../dominios/portaria/visitantes.schema'

// Áreas e Reservas
export * from '../dominios/areas/areasComuns.schema'
