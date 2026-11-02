const ORDEM_UNIDADES = ['GRAMA', 'UNIDADE']

const ROTULOS_UNIDADE = {
  GRAMA: 'g',
  UNIDADE: 'un',
}

const TITULOS_UNIDADE = {
  GRAMA: 'EM GRAMAS (G)',
  UNIDADE: 'EM UNIDADES (UN)',
}

export function rotuloUnidade(unidade) {
  return ROTULOS_UNIDADE[unidade] || String(unidade || '').toLowerCase()
}

export function tituloUnidade(unidade) {
  return TITULOS_UNIDADE[unidade] || `EM ${String(unidade || '').toUpperCase()}`
}

export function formatarNumero(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })
}

export function formatarValor(valor, unidade) {
  return `${formatarNumero(valor)} ${rotuloUnidade(unidade)}`
}

export function formatarData(data) {
  if (!data) {
    return ''
  }

  const [ano, mes, dia] = String(data).split('-')

  if (!ano || !mes || !dia) {
    return String(data)
  }

  return `${dia}/${mes}/${ano}`
}

export function formatarPeriodo(dataInicio, dataFim) {
  if (!dataInicio || !dataFim) {
    return 'Período indisponível'
  }

  return `Período: ${formatarData(dataInicio)} a ${formatarData(dataFim)}`
}

export function ordenarUnidades(unidades) {
  return [...unidades].sort((a, b) => {
    const posicaoA = ORDEM_UNIDADES.indexOf(a)
    const posicaoB = ORDEM_UNIDADES.indexOf(b)

    return (posicaoA === -1 ? ORDEM_UNIDADES.length : posicaoA)
      - (posicaoB === -1 ? ORDEM_UNIDADES.length : posicaoB)
  })
}

export function unidadesDe(itens) {
  if (!Array.isArray(itens)) {
    return []
  }

  const unidades = []

  itens.forEach((item) => {
    if (item?.unidadeMedida && !unidades.includes(item.unidadeMedida)) {
      unidades.push(item.unidadeMedida)
    }
  })

  return ordenarUnidades(unidades)
}

export function agruparRanking(itens) {
  if (!Array.isArray(itens) || !itens.length) {
    return []
  }

  const grupos = new Map()

  itens.forEach((item) => {
    const unidade = item.unidadeMedida || 'OUTRA'

    if (!grupos.has(unidade)) {
      grupos.set(unidade, [])
    }

    grupos.get(unidade).push(item)
  })

  return ordenarUnidades([...grupos.keys()]).map((unidade) => {
    const lista = grupos.get(unidade)
    const maior = lista.reduce(
      (atual, item) => Math.max(atual, Number(item.quantidadeConsumida) || 0),
      0,
    )

    return {
      unidade,
      titulo: tituloUnidade(unidade),
      itens: lista,
      maior,
    }
  })
}

export function pivotarSemanas(movimentacoes, unidade) {
  if (!unidade || !Array.isArray(movimentacoes)) {
    return []
  }

  const semanas = new Map()

  movimentacoes.forEach((movimentacao) => {
    if (movimentacao.unidadeMedida !== unidade) {
      return
    }

    const atual = semanas.get(movimentacao.semana)
      || { semana: movimentacao.semana, ENTRADA: 0, SAIDA: 0 }

    atual[movimentacao.tipo] = (atual[movimentacao.tipo] || 0)
      + Number(movimentacao.quantidade || 0)

    semanas.set(movimentacao.semana, atual)
  })

  return [...semanas.values()]
}

export function totalPorUnidade(totais, unidade) {
  if (!unidade || !Array.isArray(totais)) {
    return null
  }

  const item = totais.find((total) => total.unidadeMedida === unidade)

  return Number(item?.quantidade || 0)
}

export function calcularEscala(valorMaximo) {
  if (!valorMaximo || valorMaximo <= 0) {
    return { passo: 1, topo: 4 }
  }

  const candidatos = [3, 4, 5].map((divisoes) => {
    const bruto = valorMaximo / divisoes
    const potencia = 10 ** Math.floor(Math.log10(Math.max(bruto, 1)))
    const passo = [1, 2, 2.5, 5, 10]
      .map((multiplicador) => multiplicador * potencia)
      .find((candidato) => candidato >= bruto) || potencia * 10

    return { divisoes, passo, topo: passo * divisoes }
  })

  const melhor = candidatos
    .filter((candidato) => candidato.topo >= valorMaximo)
    .sort((a, b) => a.topo - b.topo || a.divisoes - b.divisoes)[0]

  return { passo: melhor.passo, topo: melhor.topo }
}

export function lerCores(elemento) {
  const estilo = elemento ? window.getComputedStyle(elemento) : null

  function ler(nome, padrao) {
    return estilo?.getPropertyValue(nome).trim() || padrao
  }

  return {
    verde: ler('--statusNormal', '#27815d'),
    vermelho: ler('--primaria', '#ae2f2b'),
    texto: ler('--texto', '#104547'),
    secundario: ler('--secundario', '#647b7b'),
    grade: ler('--borda', '#d1d5ca'),
    fundo: ler('--fundo', '#f0eee4'),
  }
}
