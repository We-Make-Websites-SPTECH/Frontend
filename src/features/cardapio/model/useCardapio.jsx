import { useEffect, useState } from 'react'
import {
  listarItensCardapio,
  salvarItemCardapio,
} from '../../../entities/item-cardapio/itemCardapio.api'
import FormularioItem from '../ui/FormularioItem'

export function useCardapio({ avisar }) {
  const [itens, setItens] = useState([])
  const [painel, setPainel] = useState(null)

  useEffect(() => {
    listarItensCardapio().then(setItens)
  }, [])

  function fecharPainel() {
    setPainel(null)
  }

  function abrirNovoItem(estoque) {
    setPainel({
      titulo: 'Novo item',
      conteudo: (
        <FormularioItem
          estoque={estoque}
          aoSalvar={salvarItem}
        />
      ),
    })
  }

  function editarItem(item, estoque) {
    setPainel({
      titulo: 'Editar item',
      conteudo: (
        <FormularioItem
          dados={item}
          estoque={estoque}
          aoSalvar={salvarItem}
        />
      ),
    })
  }

  async function salvarItem(dados) {
    const salvo = await salvarItemCardapio(dados)

    setItens((lista) => {
      if (!dados.id) {
        return [...lista, salvo]
      }

      return lista.map((item) => item.id === salvo.id ? salvo : item)
    })
    avisar(dados.id ? 'Item atualizado.' : 'Item cadastrado.')
    fecharPainel()
  }

  return {
    itens,
    painel,
    fecharPainel,
    abrirNovoItem,
    editarItem,
  }
}
