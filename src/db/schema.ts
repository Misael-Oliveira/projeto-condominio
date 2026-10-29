// Este arquivo só REEXPORTA as tabelas de cada domínio.
// O drizzle-kit (migrations) e o db/index.ts leem tudo por aqui.
// Ao criar uma tabela nova, acrescente uma linha abaixo.

// Identidade e Acesso (tabelas do Better Auth: user, session, account, verification)
export * from '../dominios/identidade/auth.schema'

// Portaria
export * from '../dominios/portaria/visitantes.schema'

// Áreas e Reservas
export * from '../dominios/areas/areasComuns.schema'
