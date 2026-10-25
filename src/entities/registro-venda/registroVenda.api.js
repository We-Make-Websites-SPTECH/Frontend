let registrosMockados = []

export async function registrarVenda(registro) {
  const salvo = { ...registro, id: Date.now(), status: 'Concluída' }
  registrosMockados = [salvo, ...registrosMockados]
  return Promise.resolve(salvo)
  // Substituir pelo POST de vendas e baixa de estoque.
}

export async function listarRegistrosVenda() {
  return Promise.resolve([...registrosMockados])
  // Substituir por GET /vendas quando a API estiver pronta.
}

export async function estornarVenda(id) {
  const registro = registrosMockados.find((item) => item.id === id)
  if (!registro || registro.status === 'Estornada') return null
  registro.status = 'Estornada'
  return Promise.resolve(registro)
  // Substituir por PATCH/DELETE da API.
}
