import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { visitantes } from '../db/schema'
import { Corpo, validarVisitante } from '../validacoes'

// Molde dos dados que o cliente envia (o "?" significa "pode não vir", usado no PATCH)
type DadosVisitante = { nome?: string; documento?: string; telefone?: string }

// Esta função recebe o "app" e cria nele as 6 rotas dos visitantes.
export function registrarRotasVisitantes(app: FastifyInstance) {

  // ===================== L - LISTAR =====================
  // GET /visitantes
  app.get('/visitantes', async () => {
    const dados = await db.select().from(visitantes)

    return {
      acao: 'Listar',
      message: 'Retornando a lista de todos os visitantes',
      dados
    }
  })

  // ===================== R - LER UM =====================
  // GET /visitantes/:id
  app.get('/visitantes/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const [visitante] = await db
      .select()
      .from(visitantes)
      .where(eq(visitantes.id, id))

    if (!visitante) {
      return reply.status(404).send({
        acao: 'Ler',
        message: `Visitante com ID: ${id} não encontrado.`
      })
    }

    return {
      acao: 'Ler',
      message: `Retornando os detalhes do visitante com ID: ${id}`,
      dados: visitante
    }
  })

  // ===================== C - CRIAR =====================
  // POST /visitantes
  app.post('/visitantes', async (request, reply) => {
    const corpo = (request.body ?? {}) as Corpo

    // 1) os dados estão corretos?
    const erro = validarVisitante(corpo, false)
    if (erro) {
      return reply.status(400).send({ acao: 'Criar', message: erro })
    }

    const { nome, documento, telefone } = corpo as Required<DadosVisitante>

    // 2) já existe um visitante com este documento?
    const [jaExiste] = await db
      .select()
      .from(visitantes)
      .where(eq(visitantes.documento, documento.trim()))

    if (jaExiste) {
      return reply.status(409).send({
        acao: 'Criar',
        message: `O documento ${documento.trim()} já está cadastrado.`
      })
    }

    // 3) cria a ficha com um id novo e grava no banco
    const novoVisitante = {
      id: randomUUID(),
      nome: nome.trim(),
      documento: documento.trim(),
      telefone: telefone.trim()
    }

    await db.insert(visitantes).values(novoVisitante)

    return reply.status(201).send({
      acao: 'Criar',
      message: `Visitante ${novoVisitante.nome} criado com sucesso!`,
      dados: novoVisitante
    })
  })

  // ===================== U - ATUALIZAR TUDO (PUT) =====================
  // PUT /visitantes/:id  -> troca TODOS os campos
  app.put('/visitantes/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const corpo = (request.body ?? {}) as Corpo

    // 1) o visitante existe?
    const [existente] = await db
      .select()
      .from(visitantes)
      .where(eq(visitantes.id, id))

    if (!existente) {
      return reply.status(404).send({
        acao: 'Atualizar (Completo)',
        message: `Visitante com ID: ${id} não encontrado.`
      })
    }

    // 2) os dados estão corretos? (no PUT, todos são obrigatórios)
    const erro = validarVisitante(corpo, false)
    if (erro) {
      return reply.status(400).send({ acao: 'Atualizar (Completo)', message: erro })
    }

    const { nome, documento, telefone } = corpo as Required<DadosVisitante>
    const dados = {
      nome: nome.trim(),
      documento: documento.trim(),
      telefone: telefone.trim()
    }

    // 3) o documento já pertence a OUTRO visitante?
    const [dono] = await db
      .select()
      .from(visitantes)
      .where(eq(visitantes.documento, dados.documento))

    if (dono && dono.id !== id) {
      return reply.status(409).send({
        acao: 'Atualizar (Completo)',
        message: `O documento ${dados.documento} já está cadastrado em outro visitante.`
      })
    }

    // 4) atualiza no banco
    await db.update(visitantes).set(dados).where(eq(visitantes.id, id))

    return {
      acao: 'Atualizar (Completo)',
      message: `Todos os dados do visitante ${id} foram substituídos.`,
      dados: { id, ...dados }
    }
  })

  // ===================== U - ATUALIZAR PARTE (PATCH) =====================
  // PATCH /visitantes/:id  -> troca SÓ os campos enviados
  app.patch('/visitantes/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const corpo = (request.body ?? {}) as Corpo

    // 1) o visitante existe?
    const [existente] = await db
      .select()
      .from(visitantes)
      .where(eq(visitantes.id, id))

    if (!existente) {
      return reply.status(404).send({
        acao: 'Atualizar (Parcial)',
        message: `Visitante com ID: ${id} não encontrado.`
      })
    }

    // 2) os campos enviados estão corretos? (no PATCH, só confere os que vieram)
    const erro = validarVisitante(corpo, true)
    if (erro) {
      return reply.status(400).send({ acao: 'Atualizar (Parcial)', message: erro })
    }

    // 3) separa só os campos que vieram
    const { nome, documento, telefone } = corpo as DadosVisitante
    const dados: DadosVisitante = {}
    if (nome !== undefined) dados.nome = nome.trim()
    if (documento !== undefined) dados.documento = documento.trim()
    if (telefone !== undefined) dados.telefone = telefone.trim()

    if (Object.keys(dados).length === 0) {
      return reply.status(400).send({
        acao: 'Atualizar (Parcial)',
        message: 'Envie ao menos um campo: nome, documento ou telefone.'
      })
    }

    // 4) o novo documento já pertence a OUTRO visitante?
    if (dados.documento !== undefined) {
      const [dono] = await db
        .select()
        .from(visitantes)
        .where(eq(visitantes.documento, dados.documento))

      if (dono && dono.id !== id) {
        return reply.status(409).send({
          acao: 'Atualizar (Parcial)',
          message: `O documento ${dados.documento} já está cadastrado em outro visitante.`
        })
      }
    }

    // 5) atualiza no banco
    await db.update(visitantes).set(dados).where(eq(visitantes.id, id))

    return {
      acao: 'Atualizar (Parcial)',
      message: `Apenas os campos enviados do visitante ${id} foram alterados.`,
      dados: { ...existente, ...dados }
    }
  })

  // ===================== D - DELETAR =====================
  // DELETE /visitantes/:id
  app.delete('/visitantes/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const [existente] = await db
      .select()
      .from(visitantes)
      .where(eq(visitantes.id, id))

    if (!existente) {
      return reply.status(404).send({
        acao: 'Deletar',
        message: `Visitante com ID: ${id} não encontrado.`
      })
    }

    await db.delete(visitantes).where(eq(visitantes.id, id))

    return {
      acao: 'Deletar',
      message: `Visitante ${id} foi removido do sistema.`,
      dados: existente
    }
  })
}
