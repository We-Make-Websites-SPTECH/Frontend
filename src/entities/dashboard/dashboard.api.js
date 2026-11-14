const API_URL = 'http://localhost:8080/dashboard/indicadores'

export async function buscarIndicadores() {
  const resposta = await fetch(API_URL)

  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar os indicadores (${resposta.status}).`)
  }

  return resposta.json()
}
