import { apiFetch } from '../../shared/lib/api'

export function prepararManual(dataReferencia, itens) {
  return apiFetch('/lancamentos/manuais/previa', {
    method: 'POST', body: JSON.stringify({ dataReferencia, itens }),
  })
}

export function importarTxt(arquivo, dataReferencia) {
  const corpo = new FormData()
  corpo.append('arquivo', arquivo)
  corpo.append('dataReferencia', dataReferencia)
  return apiFetch('/importacoes/txt', { method: 'POST', body: corpo })
}

export async function listarRegistrosVenda() {
  return (await apiFetch('/importacoes')) || []
}

export function consultarRegistro(id) { return apiFetch(`/importacoes/${id}`) }
export async function listarLinhas(id) { return (await apiFetch(`/importacoes/${id}/linhas`)) || [] }

function caminho(registro) {
  return registro.origem === 'MANUAL' ? `/lancamentos/manuais/${registro.id}` : `/importacoes/${registro.id}`
}

export function personalizarLinha(registro, linhaId, variacoes) {
  return apiFetch(`${caminho(registro)}/linhas/${linhaId}/ingredientes`, {
    method: 'PATCH', body: JSON.stringify({ variacoes }),
  })
}

export function confirmarRegistro(registro, linhas) {
  return apiFetch(`${caminho(registro)}/confirmar`, {
    method: 'POST', body: JSON.stringify({ linhas: linhas.map((linhaId) => ({ linhaId })) }),
  })
}
