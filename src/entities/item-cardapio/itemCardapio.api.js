import { itensCardapioIniciais } from './itemCardapio.model'

export async function listarItensCardapio() {
  return Promise.resolve(itensCardapioIniciais.map((item) => ({ ...item, receita: [...item.receita] })))
  // Substituir por GET /itens-cardapio quando a API estiver pronta.
}

export async function salvarItemCardapio(item) {
  return Promise.resolve({ ...item, id: item.id || Date.now() })
  // Substituir por POST/PUT da API.
}
