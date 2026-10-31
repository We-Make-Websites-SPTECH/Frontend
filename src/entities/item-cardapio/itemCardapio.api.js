export async function listarItensCardapio() {
  const resposta = await fetch('http://localhost:8080/produto')

  if(!resposta.ok) {
    throw new Error('Erro ao buscar produtos')
  }

  return await resposta.json()

  
}

export async function salvarItemCardapio(item) {
  return Promise.resolve({ ...item, id: item.id || Date.now() })
  // Substituir por POST/PUT da API.
}
