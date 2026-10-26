import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { areasComuns } from '../db/schema'
import { Corpo, validarAreaComum } from '../validacoes'

// Molde dos dados que o cliente envia (o "?" significa "pode não vir")
type DadosArea = { nome?: string; capacidade?: number; regras?: string; status?: string }

// Esta função recebe o "app" e cria nele as 6 rotas das áreas comuns.
export function registrarRotasAreasComuns(app: FastifyInstance) {

  // ===================== L - LISTAR =====================
  // GET /areas-comuns
  app.get('/areas-comuns', async () => {
    const dados = await db.select().from(areasComuns)

    return {
      acao: 'Listar',
      message: 'Retornando a lista de todas as áreas comuns',
      dados
    }
  })

  // ===================== R - LER UMA =====================
  // GET /areas-comuns/:id
  app.get('/areas-comuns/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const [area] = await db
      .select()
      .from(areasComuns)
      .where(eq(areasComuns.id, id))

    if (!area) {
      return reply.status(404).send({
        acao: 'Ler',
        message: `Área comum com ID: ${id} não encontrada.`
      })
    }

    return {
      acao: 'Ler',
      message: `Retornando os detalhes da área comum com ID: ${id}`,
      dados: area
    }
  })

  // ===================== C - CRIAR =====================
  // POST /areas-comuns
  app.post('/areas-comuns', async (request, reply) => {
    const corpo = (request.body ?? {}) as Corpo

    // 1) os dados estão corretos?
    const erro = validarAreaComum(corpo, false)
    if (erro) {
      return reply.status(400).send({ acao: 'Criar', message: erro })
    }

    const { nome, capacidade, regras, status } = corpo as {
      nome: string
      capacidade: number
      regras: string
      status?: string
    }

    // 2) cria a ficha com um id novo (se não vier status, usa 'ativa') e grava
    const novaArea = {
      id: randomUUID(),
      nome: nome.trim(),
      capacidade,
      regras: regras.trim(),
      status: status ?? 'ativa'
    }

    await db.insert(areasComuns).values(novaArea)

    return reply.status(201).send({
      acao: 'Criar',
      message: `Área comum ${novaArea.nome} criada com sucesso!`,
      dados: novaArea
    })
  })

  // ===================== U - ATUALIZAR TUDO (PUT) =====================
  // PUT /areas-comuns/:id  -> troca TODOS os campos
  app.put('/areas-comuns/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const corpo = (request.body ?? {}) as Corpo

    // 1) a área existe?
    const [existente] = await db
      .select()
      .from(areasComuns)
      .where(eq(areasComuns.id, id))

    if (!existente) {
      return reply.status(404).send({
        acao: 'Atualizar (Completo)',
        message: `Área comum com ID: ${id} não encontrada.`
      })
    }

    // 2) os dados estão corretos? (no PUT, nome, capacidade e regras são obrigatórios)
    const erro = validarAreaComum(corpo, false)
    if (erro) {
      return reply.status(400).send({ acao: 'Atualizar (Completo)', message: erro })
    }

    const { nome, capacidade, regras, status } = corpo as {
      nome: string
      capacidade: number
      regras: string
      status?: string
    }

    const dados = {
      nome: nome.trim(),
      capacidade,
      regras: regras.trim(),
      status: status ?? 'ativa'
    }

    // 3) atualiza no banco
    await db.update(areasComuns).set(dados).where(eq(areasComuns.id, id))

    return {
      acao: 'Atualizar (Completo)',
      message: `Todos os dados da área comum ${id} foram substituídos.`,
      dados: { id, ...dados }
    }
  })

  // ===================== U - ATUALIZAR PARTE (PATCH) =====================
  // PATCH /areas-comuns/:id  -> troca SÓ os campos enviados
  app.patch('/areas-comuns/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const corpo = (request.body ?? {}) as Corpo

    // 1) a área existe?
    const [existente] = await db
      .select()
      .from(areasComuns)
      .where(eq(areasComuns.id, id))

    if (!existente) {
      return reply.status(404).send({
        acao: 'Atualizar (Parcial)',
        message: `Área comum com ID: ${id} não encontrada.`
      })
    }

    // 2) os campos enviados estão corretos? (só confere os que vieram)
    const erro = validarAreaComum(corpo, true)
    if (erro) {
      return reply.status(400).send({ acao: 'Atualizar (Parcial)', message: erro })
    }

    // 3) separa só os campos que vieram
    const { nome, capacidade, regras, status } = corpo as DadosArea
    const dados: DadosArea = {}
    if (nome !== undefined) dados.nome = nome.trim()
    if (capacidade !== undefined) dados.capacidade = capacidade
    if (regras !== undefined) dados.regras = regras.trim()
    if (status !== undefined) dados.status = status

    if (Object.keys(dados).length === 0) {
      return reply.status(400).send({
        acao: 'Atualizar (Parcial)',
        message: 'Envie ao menos um campo: nome, capacidade, regras ou status.'
      })
    }

    // 4) atualiza no banco
    await db.update(areasComuns).set(dados).where(eq(areasComuns.id, id))

    return {
      acao: 'Atualizar (Parcial)',
      message: `Apenas os campos enviados da área comum ${id} foram alterados.`,
      dados: { ...existente, ...dados }
    }
  })

  // ===================== D - DELETAR =====================
  // DELETE /areas-comuns/:id
  app.delete('/areas-comuns/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const [existente] = await db
      .select()
      .from(areasComuns)
      .where(eq(areasComuns.id, id))

    if (!existente) {
      return reply.status(404).send({
        acao: 'Deletar',
        message: `Área comum com ID: ${id} não encontrada.`
      })
    }

    await db.delete(areasComuns).where(eq(areasComuns.id, id))

    return {
      acao: 'Deletar',
      message: `Área comum ${id} foi removida do sistema.`,
      dados: existente
    }
  })
}
