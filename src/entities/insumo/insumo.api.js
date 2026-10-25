import { insumosIniciais } from './insumo.model'

// Os métodos estão separados para facilitar a troca dos mocks pela API.
export async function listarInsumos() {
  return Promise.resolve(insumosIniciais.map((item) => ({ ...item })))
  // const resposta = await fetch(API_URL)
  // if (!resposta.ok) throw new Error('Não foi possível carregar os insumos.')
  // return resposta.json()
}

export async function salvarInsumo(insumo) {
  return Promise.resolve({ ...insumo, id: insumo.id || Date.now() })
  // const resposta = await fetch(insumo.id ? `${API_URL}/${insumo.id}` : API_URL, {
  //   method: insumo.id ? 'PUT' : 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(insumo),
  // })
  // if (!resposta.ok) throw new Error('Não foi possível salvar o insumo.')
  // return resposta.json()
}

export async function registrarMovimentacao(movimentacao) {
  return Promise.resolve({ ...movimentacao, id: Date.now() })
  // Aqui poderá entrar o POST da movimentação quando a API estiver disponível.
}
