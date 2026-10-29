import type { FastifyInstance } from 'fastify'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from './auth'
import { exigirLogin } from './guards'

export function registrarRotasAuth(app: FastifyInstance) {
  // Rota "pega-tudo": o Better Auth cuida de cadastro, login, logout etc.
  // Aqui só repassamos o pedido para ele e devolvemos a resposta.
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`)
        const req = new Request(url.toString(), {
          method: request.method,
          headers: fromNodeHeaders(request.headers),
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        })

        const resposta = await auth.handler(req)
        reply.status(resposta.status)

        // Copia os cabeçalhos. Os cookies vão à parte, porque podem ser vários.
        // content-length e transfer-encoding o Fastify recalcula sozinho.
        resposta.headers.forEach((valor, chave) => {
          const nome = chave.toLowerCase()
          if (nome === 'set-cookie' || nome === 'content-length' || nome === 'transfer-encoding') return
          reply.header(chave, valor)
        })
        const cookies = resposta.headers.getSetCookie()
        if (cookies.length > 0) reply.header('set-cookie', cookies)

        let corpo = resposta.body ? await resposta.text() : null

        // Regra do projeto: nunca devolver token no corpo da resposta.
        // O login continua funcionando pelo cookie da sessão.
        if (corpo && (resposta.headers.get('content-type') ?? '').includes('application/json')) {
          try {
            const json = JSON.parse(corpo)
            if (json && typeof json === 'object' && 'token' in json) {
              delete json.token
              corpo = JSON.stringify(json)
            }
          } catch {
            // se não for JSON válido, devolve do jeito que veio
          }
        }

        return reply.send(corpo)
      } catch (erro) {
        app.log.error(erro)
        return reply.status(500).send({ acao: 'Autenticar', message: 'Erro interno na autenticação.' })
      }
    },
  })

  // Quem sou eu? Só funciona com login.
  app.get('/me', { preHandler: exigirLogin }, async (request, reply) => {
    const usuario = request.usuarioLogado!
    return reply.status(200).send({
      acao: 'Ler',
      message: 'Usuário logado.',
      // Só os campos que podem aparecer. Nunca senha, hash ou token.
      dados: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        emailVerified: usuario.emailVerified,
        telefone: usuario.telefone ?? null,
        status: usuario.status,
      },
    })
  })
}