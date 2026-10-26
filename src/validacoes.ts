// =====================================================================
// VALIDAÇÕES
// Antes de salvar qualquer coisa, a API confere se os dados enviados
// estão corretos. Cada função devolve:
//   - um TEXTO com a mensagem de erro, se algo estiver errado; ou
//   - null, se estiver tudo certo.
//
// "parcial = false"  -> usado no POST e no PUT (todos os campos obrigatórios)
// "parcial = true"   -> usado no PATCH (só confere os campos que vieram)
// =====================================================================

// "Corpo" é o JSON que o cliente mandou: nomes de campos com valores de qualquer tipo.
export type Corpo = Record<string, unknown>

// Confere se o valor é um texto que não está vazio.
// O "valor is string" avisa ao TypeScript: se der true, pode tratar como texto.
function ehTexto(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.trim() !== ''
}

// Confere vários campos de texto de uma vez.
// "limites" diz o nome de cada campo e quantas letras ele aceita no máximo.
function validarTextos(corpo: Corpo, limites: Record<string, number>, parcial: boolean): string | null {
  for (const [campo, maximo] of Object.entries(limites)) {
    const valor = corpo[campo]

    if (valor === undefined) {
      // o campo não veio: só é problema se NÃO for PATCH
      if (!parcial) return `O campo ${campo} é obrigatório.`
    } else if (!ehTexto(valor)) {
      return `O campo ${campo} deve ser um texto não vazio.`
    } else if (valor.trim().length > maximo) {
      return `O campo ${campo} deve ter no máximo ${maximo} caracteres.`
    }
  }
  return null
}

// ---------------------------------------------------------------------
// Visitante: nome, documento e telefone (todos textos)
// ---------------------------------------------------------------------
export function validarVisitante(corpo: Corpo, parcial: boolean): string | null {
  return validarTextos(corpo, { nome: 255, documento: 30, telefone: 20 }, parcial)
}

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
