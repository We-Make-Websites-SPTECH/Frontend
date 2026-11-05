import { apiFetch } from '../../shared/lib/api'

function normalizarIngredientes(receita) {
  return (receita?.ingredientes || []).map((ingrediente) => ({
    insumoId: ingrediente.insumo.id,
    quantidade: Number(ingrediente.quantidade),
  }))
}

export async function listarItensCardapio() {
  const [produtos, receitas] = await Promise.all([
    apiFetch('/produto'),
    apiFetch('/receita'),
  ])
  const receitasPorProduto = new Map((receitas || []).map((receita) => [
    receita.produto.id,
    normalizarIngredientes(receita),
  ]))

  return (produtos || []).map((produto) => ({
    ...produto,
    receita: receitasPorProduto.get(produto.id) || [],
    temReceita: receitasPorProduto.has(produto.id),
  }))
}

export async function salvarProduto(item) {
  const editando = Boolean(item.id)
  const produtos = (await apiFetch('/produto')) || []
  const comparador = new Intl.Collator('pt-BR', { sensitivity: 'base' })
  const duplicado = produtos.some((produto) => (
    Number(produto.id) !== Number(item.id)
    && Number(produto.tamanho) === Number(item.tamanho)
    && comparador.compare(String(produto.nome).trimEnd(), String(item.nome).trimEnd()) === 0
  ))

  if (duplicado) {
    throw new Error('Já existe um item cadastrado com esse nome e tamanho.')
  }

  return apiFetch(editando ? `/produto/${item.id}` : '/produto', {
    method: editando ? 'PUT' : 'POST',
    body: JSON.stringify({
      nome: item.nome,
      tipo: String(item.tipo).toUpperCase(),
      tamanho: Number(item.tamanho),
      ...(editando ? { ativo: item.ativo !== false } : {}),
    }),
  })
}

export async function salvarReceita(produtoId, receita, temReceita) {
  const ingredientes = receita.map((ingrediente) => ({
    insumoId: Number(ingrediente.insumoId),
    quantidade: Number(ingrediente.quantidade),
  }))
  if (!ingredientes.length || new Set(ingredientes.map((i) => i.insumoId)).size !== ingredientes.length
    || ingredientes.some((i) => !Number.isInteger(i.insumoId) || i.insumoId <= 0
      || !Number.isFinite(i.quantidade) || i.quantidade <= 0
      || Math.abs(i.quantidade * 1000 - Math.round(i.quantidade * 1000)) > 1e-7)) {
    throw new Error('Informe ingredientes distintos e quantidades positivas com até 3 casas decimais.')
  }

  // Uma falha de rede pode ter ocorrido após o servidor gravar a receita.
  // Consulte antes de repetir para escolher POST ou PUT com segurança.
  if (temReceita === null) {
    try {
      await apiFetch(`/receita/${produtoId}`)
      temReceita = true
    } catch (erro) {
      if (erro.status !== 404) throw erro
      temReceita = false
    }
  }

  const resposta = await apiFetch(temReceita ? `/receita/${produtoId}` : '/receita', {
    method: temReceita ? 'PUT' : 'POST',
    body: JSON.stringify(temReceita ? { ingredientes } : { produtoId, ingredientes }),
  })
  return resposta ? normalizarIngredientes(resposta) : ingredientes
}
