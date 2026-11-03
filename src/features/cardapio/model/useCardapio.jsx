import { useEffect, useState } from 'react'
import {
  listarItensCardapio,
  salvarItemCardapio
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
  const editando = Boolean(dados.id)

  const salvo = await salvarItemCardapio(dados)

  setItens((lista) => {
    if (!editando) {
      return [...lista, {
        ...salvo,
        receita: dados.receita
      }]
    }

    return lista.map((item) => (
      item.id === salvo.id
        ? {
            ...salvo,
            receita: dados.receita
          }
        : item
    ))
  })

  avisar(editando ? 'Item atualizado.' : 'Item cadastrado.')
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
