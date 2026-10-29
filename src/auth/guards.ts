import type { FastifyReply, FastifyRequest } from 'fastify'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from './auth'

// Tipo do usuário logado (o Better Auth já inclui telefone e status)
export type UsuarioLogado = typeof auth.$Infer.Session.user

// Avisa o TypeScript que o request pode carregar o usuário logado
declare module 'fastify' {
  interface FastifyRequest {
    usuarioLogado?: UsuarioLogado
  }
}

// Escolhe o nome da ação para manter o formato { acao, message } do projeto
function descobrirAcao(request: FastifyRequest): string {
  switch (request.method) {
    case 'POST':
      return 'Criar'
    case 'PUT':
      return 'Atualizar (Completo)'
    case 'PATCH':
      return 'Atualizar (Parcial)'
    case 'DELETE':
      return 'Deletar'
    default:
      return 'Ler'
  }
}

// Use como preHandler nas rotas que exigem login:
//   app.get('/algo', { preHandler: exigirLogin }, async (request, reply) => { ... })
export async function exigirLogin(request: FastifyRequest, reply: FastifyReply) {
  const acao = descobrirAcao(request)

  // 1) existe alguém logado? (o Better Auth lê o cookie da sessão)
  const sessao = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
  if (!sessao) {
    return reply.status(401).send({ acao, message: 'Você precisa estar logado.' })
  }

  // 2) a conta está ativa? (confere de novo a cada pedido, caso tenha sido bloqueada depois)
  if (sessao.user.status !== 'ativo') {
    return reply.status(403).send({ acao, message: 'Conta inativa ou bloqueada. Procure o administrador.' })
  }

  // 3) guarda o usuário para as rotas usarem
  request.usuarioLogado = sessao.user
}