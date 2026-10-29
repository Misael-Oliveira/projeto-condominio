import 'dotenv/config'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { APIError } from 'better-auth/api'
import { db } from '../db'

// Configuração do login. O Better Auth lê BETTER_AUTH_SECRET e
// BETTER_AUTH_URL do arquivo .env sozinho.
export const auth = betterAuth({
  // Usa o mesmo banco e o mesmo Drizzle do resto da API
  database: drizzleAdapter(db, { provider: 'mysql' }),

  // Login com e-mail e senha (a senha é guardada em hash, nunca em texto puro)
  emailAndPassword: { enabled: true },

  // Campos do nosso projeto na tabela user (arquivo 02)
  user: {
    additionalFields: {
      telefone: { type: 'string', required: false },
      // input: false = quem se cadastra NÃO pode escolher o próprio status
      status: { type: 'string', required: true, defaultValue: 'ativo', input: false },
    },
  },

  databaseHooks: {
    session: {
      create: {
        // Roda antes de criar a sessão (ou seja, no momento do login)
        before: async (sessao, contexto) => {
          if (!contexto) return { data: sessao }

          const usuario = await contexto.context.adapter.findOne<{ status?: string }>({
            model: 'user',
            where: [{ field: 'id', value: sessao.userId }],
          })

          // Regra do arquivo 01: conta inativa ou bloqueada não autentica
          if (usuario && usuario.status && usuario.status !== 'ativo') {
            throw new APIError('FORBIDDEN', {
              message: 'Conta inativa ou bloqueada. Procure o administrador.',
            })
          }
          return { data: sessao }
        },
      },
    },
  },
})