import { useEffect, useState } from 'react'
import { listarItensCardapio, salvarProduto, salvarReceita } from '../../../entities/item-cardapio/itemCardapio.api'
import FormularioItem from '../ui/FormularioItem'

export function useCardapio({ avisar }) {
  const [itens, setItens] = useState([])
  const [painel, setPainel] = useState(null)

  useEffect(() => {
    listarItensCardapio().then(setItens).catch((erro) => {
      console.error('Não foi possível carregar o cardápio.', erro)
      avisar('Não foi possível carregar produtos e receitas. Tente novamente.')
    })
  }, [])

  function fecharPainel() { setPainel(null) }

  function abrirNovoItem(estoque) {
    setPainel({ titulo: 'Novo item', conteudo: <FormularioItem estoque={estoque} aoSalvar={salvarItem} /> })
  }

  function editarItem(item, estoque) {
    setPainel({ titulo: 'Editar item', conteudo: <FormularioItem dados={item} estoque={estoque} aoSalvar={salvarItem} /> })
  }

  function atualizarLista(item) {
    setItens((lista) => lista.some((existente) => existente.id === item.id)
      ? lista.map((existente) => existente.id === item.id ? item : existente)
      : [...lista, item])
  }

  async function salvarItem(dados, produtoPendente) {
    let produto = produtoPendente
    try {
      if (!produto) produto = await salvarProduto(dados)
    } catch (erro) {
      avisar(erro.message || 'Não foi possível salvar o produto.')
      return null
    }

    try {
      const receita = await salvarReceita(produto.id, dados.receita, produtoPendente ? null : dados.temReceita ?? false)
      atualizarLista({ ...produto, receita, temReceita: true })
      avisar(dados.id ? 'Item atualizado.' : 'Item cadastrado.')
      fecharPainel()
      return null
    } catch (erro) {
      // Não apresentar a receita pretendida como se tivesse sido gravada.
      atualizarLista({ ...produto, receita: dados.receitaAnterior || [], temReceita: null })
      const mensagens = { 400: 'Confira os ingredientes e suas quantidades.', 404: 'Produto ou insumo não encontrado.', 409: 'Verifique se todos os insumos estão ativos.' }
      avisar(`Produto salvo, mas a receita falhou. ${mensagens[erro.status] || erro.message || 'Tente novamente.'}`)
      return produto
    }
  }

  async function alternarAtivo(item) {
    try {
      const produto = await salvarProduto({ ...item, ativo: !item.ativo })
      atualizarLista({ ...item, ...produto })
      avisar(produto.ativo ? 'Item reativado.' : 'Item desativado.')
    } catch (erro) {
      avisar(erro.message || 'Não foi possível alterar o status do item.')
    }
  }

  return { itens, painel, fecharPainel, abrirNovoItem, editarItem, alternarAtivo }
}
