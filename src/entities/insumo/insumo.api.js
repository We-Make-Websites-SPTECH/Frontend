import { apiFetch } from '../../shared/lib/api'
import { unidadeDaApi } from '../../shared/lib/unidades'

// O estoque minimo ainda nao faz parte do contrato do backend,
// entao ele fica guardado localmente por insumo.
const CHAVE_METADADOS = 'wmw:insumos:metadados'

function paraNumero(valor, padrao = 0) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : padrao
}

let metadadosSanitizados = false

function lerMetadados() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_METADADOS) || '{}')
    const metadados = dados && typeof dados === 'object' ? dados : {}

    if (!metadadosSanitizados) {
      metadadosSanitizados = true
      let alterou = false

      // Versões antigas gravavam categoria/fornecedor; mantém apenas o limite.
      Object.keys(metadados).forEach((id) => {
        const registro = metadados[id] || {}
        const limpo = { limite: paraNumero(registro.limite) }

        if (
          registro.categoria !== undefined
          || registro.fornecedor !== undefined
          || Object.keys(registro).length !== 1
        ) {
          metadados[id] = limpo
          alterou = true
        }
      })

      if (alterou) {
        localStorage.setItem(CHAVE_METADADOS, JSON.stringify(metadados))
      }
    }

    return metadados
  } catch {
    return {}
  }
}

function gravarMetadados(id, insumo) {
  if (id === null || id === undefined) {
    return
  }

  const metadados = lerMetadados()

  // Sobrescreve o registro inteiro para descartar categoria/fornecedor
  // gravados por versoes antigas do front.
  metadados[id] = {
    limite: paraNumero(insumo.limite),
  }

  localStorage.setItem(CHAVE_METADADOS, JSON.stringify(metadados))
}

function paraInsumo(dto) {
  const metadados = lerMetadados()[dto.id] || {}

  return {
    id: dto.id,
    nome: dto.nome,
    unidade: unidadeDaApi(dto.unidadeMedida),
    saldo: paraNumero(dto.saldo),
    perda: paraNumero(dto.percentualPerda),
    ativo: dto.ativo !== false,
    limite: paraNumero(metadados.limite),
  }
}

export async function listarInsumos() {
  const insumos = (await apiFetch('/insumo')) || []

  return insumos.map(paraInsumo)
}

export async function salvarInsumo(insumo) {
  const dadosBase = {
    nome: insumo.nome,
    unidadeMedida: insumo.unidade,
    percentualPerda: Math.round(paraNumero(insumo.perda)),
  }

  const resposta = insumo.id
    ? await apiFetch(`/insumo/${insumo.id}`, {
        method: 'PUT',
        body: JSON.stringify(dadosBase),
      })
    : await apiFetch('/insumo', {
        method: 'POST',
        body: JSON.stringify({
          ...dadosBase,
          // O backend aplica a perda sobre o saldo bruto.
          saldoInicial: paraNumero(insumo.saldo),
        }),
      })

  gravarMetadados(resposta.id, insumo)

  return paraInsumo(resposta)
}

function motivoDaApi(motivo) {
  return String(motivo || 'Outro').toUpperCase()
}

export async function registrarMovimentacao(movimentacao) {
  const observacao = movimentacao.justificativa?.trim() || null

  if (movimentacao.tipo === 'Ajuste') {
    return apiFetch('/estoque/ajustes', {
      method: 'POST',
      body: JSON.stringify({
        insumoId: movimentacao.insumoId,
        novoSaldo: paraNumero(movimentacao.novoSaldo),
        observacao,
      }),
    })
  }

  if (movimentacao.tipo === 'Entrada') {
    return apiFetch('/estoque/entradas', {
      method: 'POST',
      body: JSON.stringify({
        insumoId: movimentacao.insumoId,
        quantidadeBruta: paraNumero(movimentacao.quantidade),
        motivo: motivoDaApi(movimentacao.motivo || 'Compra'),
        observacao,
      }),
    })
  }

  return apiFetch('/estoque/saidas', {
    method: 'POST',
    body: JSON.stringify({
      insumoId: movimentacao.insumoId,
      quantidade: paraNumero(movimentacao.quantidade),
      motivo: motivoDaApi(movimentacao.motivo || 'Quebra'),
      observacao,
    }),
  })
}

export async function desativarInsumo(id) {
  await apiFetch(`/insumo/${id}`, { method: 'DELETE' })
}

export async function listarMovimentacoes(id) {
  return apiFetch(`/insumo/${id}/movimentacoes`)
}
