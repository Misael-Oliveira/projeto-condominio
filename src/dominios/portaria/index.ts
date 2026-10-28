import { FastifyInstance } from 'fastify'
import { registrarRotasVisitantes } from './visitantes.rotas'

// Registra todas as rotas do domínio Portaria.
// (veiculos, autorizacoes_visitante etc. serão acrescentados aqui depois)
export function registrarRotasPortaria(app: FastifyInstance) {
  registrarRotasVisitantes(app)
}
