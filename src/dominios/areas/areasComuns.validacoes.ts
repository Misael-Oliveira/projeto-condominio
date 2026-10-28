import { Corpo, validarTextos } from '../../compartilhado/validacoes'

// ---------------------------------------------------------------------
// Área comum: nome e regras (textos), capacidade (número) e status
// ---------------------------------------------------------------------
export function validarAreaComum(corpo: Corpo, parcial: boolean): string | null {
  const erroTextos = validarTextos(corpo, { nome: 100, regras: 500 }, parcial)
  if (erroTextos) return erroTextos

  const { capacidade, status } = corpo

  if (capacidade === undefined) {
    if (!parcial) return 'O campo capacidade é obrigatório.'
  } else if (typeof capacidade !== 'number' || !Number.isInteger(capacidade) || capacidade < 1 || capacidade > 10000) {
    return 'O campo capacidade deve ser um número inteiro entre 1 e 10000.'
  }

  if (status !== undefined && status !== 'ativa' && status !== 'inativa') {
    return "O campo status deve ser 'ativa' ou 'inativa'."
  }

  return null
}
