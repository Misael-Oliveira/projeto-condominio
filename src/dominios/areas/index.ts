import { FastifyInstance } from 'fastify'
import { registrarRotasAreasComuns } from './areasComuns.rotas'

// Registra todas as rotas do domínio Áreas e Reservas.
// (reservas será acrescentada aqui depois)
export function registrarRotasAreas(app: FastifyInstance) {
  registrarRotasAreasComuns(app)
}
