import { Corpo, validarTextos } from '../../compartilhado/validacoes'

// ---------------------------------------------------------------------
// Visitante: nome, documento e telefone (todos textos)
// ---------------------------------------------------------------------
export function validarVisitante(corpo: Corpo, parcial: boolean): string | null {
  return validarTextos(corpo, { nome: 255, documento: 30, telefone: 20 }, parcial)
}
