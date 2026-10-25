import { useEffect, useMemo, useState } from 'react'
import {
  estornarVenda,
  listarRegistrosVenda,
  registrarVenda,
} from '../../../entities/registro-venda/registroVenda.api'

function calcularConsumo(lista, itens) {
  const consumo = {}

  function acumularReceita(receita, quantidade) {
    receita.forEach((ingrediente) => {
      const atual = consumo[ingrediente.insumoId] || 0
      consumo[ingrediente.insumoId] = atual + Number(ingrediente.quantidade) * quantidade
    })
  }

  lista.forEach((venda) => {
    const item = itens.find((produto) => produto.id === venda.itemId)
    const variacoes = venda.variacoes || []
    const quantidadeVariada = variacoes.reduce(
      (soma, variacao) => soma + variacao.quantidade,
      0,
    )

    if (item) {
      acumularReceita(item.receita, venda.quantidade - quantidadeVariada)
    }

    variacoes.forEach((variacao) => {
      acumularReceita(variacao.receita, variacao.quantidade)
    })
  })

  return consumo
}

function acumularVenda(lista, itemId, quantidade) {
  const vendaExistente = lista.find((venda) => venda.itemId === itemId)

  if (!vendaExistente) {
    return [...lista, { itemId, quantidade, variacoes: [] }]
  }

  return lista.map((venda) => (
    venda.itemId === itemId
      ? { ...venda, quantidade: venda.quantidade + quantidade }
      : venda
  ))
}

export function useVendas({ itens, aoBaixarEstoque, avisar }) {
  const [registros, setRegistros] = useState([])
  const [lista, setLista] = useState([])
  const [data, setData] = useState(new Date().toLocaleDateString('en-CA'))
  const [itemId, setItemId] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [arquivo, setArquivo] = useState('')
  const [erroArquivo, setErroArquivo] = useState('')
  const [registroSelecionado, setRegistroSelecionado] = useState(null)
  const [confirmarEstorno, setConfirmarEstorno] = useState(null)
  const [itemModal, setItemModal] = useState(null)

  useEffect(() => {
    listarRegistrosVenda().then(setRegistros)
  }, [])

  const consumo = useMemo(
    () => calcularConsumo(lista, itens),
    [lista, itens],
  )
  const itensAtivos = itens.filter((item) => item.ativo && item.receita.length)

  function adicionar(idSelecionado, quantidadeInformada) {
    const id = Number(idSelecionado || itensAtivos[0]?.id)
    const qtd = Number(quantidadeInformada)

    if (!id || !Number.isInteger(qtd) || qtd <= 0) {
      return
    }

    setLista((atual) => acumularVenda(atual, id, qtd))
    setItemId(String(id))
  }

  function converterLinhaTxt(linha, indice, linhasImportadas) {
    const colunas = linha.split(';').map((valor) => valor.trim())

    if (indice === 0 && /^id$/i.test(colunas[0])) {
      return
    }

    const idItem = Number(colunas[0])
    const quantidadeVenda = Number(colunas[2])
    const item = itensAtivos.find((produto) => (
      produto.id === idItem
      && produto.nome.toLowerCase() === colunas[1]?.toLowerCase()
    ))

    const linhaInvalida = colunas.length !== 3
      || !item
      || !Number.isInteger(quantidadeVenda)
      || quantidadeVenda < 1

    if (linhaInvalida) {
      throw new Error(`Confira a linha ${indice + 1}: use ID; NOME; QUANTIDADE.`)
    }

    linhasImportadas.push({
      itemId: item.id,
      quantidade: quantidadeVenda,
      variacoes: [],
    })
  }

  async function importarArquivo(evento) {
    const arquivoSelecionado = evento.target.files?.[0]

    if (!arquivoSelecionado) {
      return
    }

    setErroArquivo('')
    setArquivo(arquivoSelecionado.name)

    try {
      const texto = await arquivoSelecionado.text()
      const linhas = texto.split(/\r?\n/).filter((linha) => linha.trim())
      const importadas = []

      linhas.forEach((linha, indice) => {
        converterLinhaTxt(linha, indice, importadas)
      })

      if (!importadas.length) {
        throw new Error('O arquivo não possui itens válidos.')
      }

      const listaAgrupada = importadas.reduce((atual, venda) => (
        acumularVenda(atual, venda.itemId, venda.quantidade)
      ), [])

      setLista(listaAgrupada)
    } catch (erro) {
      setErroArquivo(erro.message || 'Não foi possível ler o arquivo.')
    }

    evento.target.value = ''
  }

  async function confirmar() {
    if (!lista.length || !data) {
      return
    }

    const registro = await registrarVenda({
      data,
      itens: lista,
      consumo,
      status: 'Concluída',
    })

    aoBaixarEstoque(consumo)
    setRegistros((atuais) => [registro, ...atuais])
    setLista([])
    setArquivo('')
    avisar('Vendas registradas e estoque atualizado.')
  }

  async function estornar(registro) {
    const salvo = await estornarVenda(registro.id)

    if (!salvo) {
      return
    }

    aoBaixarEstoque(registro.consumo, true)
    setRegistros((atuais) => atuais.map((item) => (
      item.id === registro.id ? salvo : item
    )))
    avisar('Registro estornado e estoque restaurado.')
  }

  function salvarVariacao(variacao) {
    setLista((atual) => atual.map((venda, indice) => {
      if (indice !== itemModal) {
        return venda
      }

      return {
        ...venda,
        variacoes: [...(venda.variacoes || []), variacao],
      }
    }))
    setItemModal(null)
  }

  function removerVariacao(itemIndice, variacaoIndice) {
  setLista((atual) => atual.map((venda, indice) => {
    if (indice !== itemIndice) {
      return venda
    }

    return {
      ...venda,
      variacoes: venda.variacoes.filter((_, posicao) => (
        posicao !== variacaoIndice
      )),
    }
  }))
}

  return {
    registros,
    lista,
    setLista,
    data,
    setData,
    itemId,
    setItemId,
    quantidade,
    setQuantidade,
    consumo,
    arquivo,
    erroArquivo,
    registroSelecionado,
    setRegistroSelecionado,
    confirmarEstorno,
    setConfirmarEstorno,
    itemModal,
    setItemModal,
    importarArquivo,
    adicionar,
    confirmar,
    estornar,
    salvarVariacao,
    removerVariacao,
  }
}
