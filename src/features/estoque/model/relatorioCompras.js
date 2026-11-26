const CABECALHO = [
  'Fornecedor',
  'Contato',
  'Insumo',
  'Saldo',
  'Limite',
  'Unidade',
  'Sugestão de compra',
]

function hojeISO() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

// Numero no padrao brasileiro, sem separador de milhar, para o Excel
// interpretar como numero (ex.: 5000,5).
function formatarNumero(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    useGrouping: false,
    maximumFractionDigits: 3,
  })
}

function escapar(valor) {
  return `"${String(valor ?? '').replace(/"/g, '""')}"`
}

export function sugestaoDeCompra(item) {
  const limite = Number(item?.limite) || 0
  const saldo = Number(item?.saldo) || 0

  return Math.max(0, Math.ceil(limite * 2 - saldo))
}

export function gerarRelatorioCompras(itens) {
  const ordenados = [...itens].sort((a, b) => {
    const fornecedorA = (a.fornecedor || '').trim()
    const fornecedorB = (b.fornecedor || '').trim()

    // Itens sem fornecedor ficam no final.
    if (!fornecedorA && fornecedorB) {
      return 1
    }

    if (fornecedorA && !fornecedorB) {
      return -1
    }

    return fornecedorA.localeCompare(fornecedorB, 'pt-BR')
      || String(a.nome).localeCompare(String(b.nome), 'pt-BR')
  })

  const linhas = ordenados.map((item) => [
    item.fornecedor || '',
    item.contato || '',
    item.nome,
    formatarNumero(item.saldo),
    formatarNumero(item.limite),
    item.unidade,
    formatarNumero(sugestaoDeCompra(item)),
  ])

  return `\uFEFF${[CABECALHO, ...linhas]
    .map((linha) => linha.map(escapar).join(';'))
    .join('\r\n')}`
}

export function baixarRelatorioCompras(itens) {
  if (!itens.length) {
    return false
  }

  const conteudo = gerarRelatorioCompras(itens)
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `relatorio-compras-${hojeISO()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)

  return true
}
