export async function listarItensCardapio() {
  const resposta = await fetch('http://localhost:8080/produto')

  if (!resposta.ok) {
    throw new Error('Erro ao buscar produtos')
  }

  return await resposta.json()
}

export async function salvarItemCardapio(item) {
  const usuarioId = localStorage.getItem('usuarioId')

  const url = item.id
    ? `http://localhost:8080/produto/${item.id}`
    : 'http://localhost:8080/produto'

  const dadosProduto = item.id
    ? {
        nome: item.nome,
        ativo: item.ativo,
        tipo: item.tipo.toUpperCase(),
        tamanho: Number(item.tamanho)
      }
    : {
        nome: item.nome,
        tipo: item.tipo.toUpperCase(),
        tamanho: Number(item.tamanho)
      }

  const resposta = await fetch(url, {
    method: item.id ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Usuario-Id': usuarioId
    },
    body: JSON.stringify(dadosProduto)
  })

  if (!resposta.ok) {
    throw new Error('Erro ao cadastrar produto')
  }

  return await resposta.json()
}
