// Dados mockados do dashboard. Substituir por chamadas à API quando o backend estiver pronto.
export const periodoMock = '01/10/2026 a 28/10/2026'

export const insumosAtivosMock = {
  ativos: 42,
  cadastrados: 48,
  porCategoria: [
    { categoria: 'Hortifrúti', quantidade: 9 },
    { categoria: 'Laticínios', quantidade: 7 },
    { categoria: 'Proteínas', quantidade: 7 },
    { categoria: 'Secos', quantidade: 6 },
    { categoria: 'Bebidas', quantidade: 6 },
    { categoria: 'Conservas', quantidade: 4 },
    { categoria: 'Outros', quantidade: 3 },
  ],
}

export const maisConsumidosMock = {
  g: [
    { nome: 'Mussarela', consumo: 38500 },
    { nome: 'Farinha', consumo: 31200 },
    { nome: 'Calabresa', consumo: 14800 },
    { nome: 'Molho de tomate', consumo: 12400 },
    { nome: 'Cebola', consumo: 6300 },
  ],
  un: [
    { nome: 'Coca-Cola 2L', consumo: 96 },
    { nome: 'Guaraná 2L', consumo: 71 },
    { nome: 'Caixa de pizza G', consumo: 64 },
    { nome: 'Caixa de pizza M', consumo: 52 },
    { nome: 'Suco de laranja 1L', consumo: 28 },
  ],
}

export const produtosRegistradosMock = {
  total: 312,
  manual: 118,
  txt: 194,
  porSemana: [
    { semana: 'Sem 1', quantidade: 74 },
    { semana: 'Sem 2', quantidade: 81 },
    { semana: 'Sem 3', quantidade: 69 },
    { semana: 'Sem 4', quantidade: 88 },
  ],
}
