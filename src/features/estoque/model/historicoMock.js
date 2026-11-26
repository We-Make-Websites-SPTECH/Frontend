// Dados ilustrativos ate o backend expor o historico de movimentacoes
// de todos os usuarios. Somente movimentacoes de estoque.
const agora = Date.now()

function horasAtras(horas) {
  return new Date(agora - horas * 60 * 60 * 1000).toISOString()
}

const historicoMock = [
  {
    id: 1,
    usuario: 'Mariana Costa',
    tipo: 'Entrada',
    insumo: 'Queijo muçarela',
    quantidade: 5000,
    unidade: 'g',
    motivo: 'Recebimento de fornecedor',
    dataHora: horasAtras(2),
  },
  {
    id: 2,
    usuario: 'Carlos Lima',
    tipo: 'Saída',
    insumo: 'Calabresa',
    quantidade: 200,
    unidade: 'g',
    motivo: 'Quebra',
    dataHora: horasAtras(3),
  },
  {
    id: 3,
    usuario: 'Ana Souza',
    tipo: 'Ajuste',
    insumo: 'Tomate',
    quantidade: 1800,
    unidade: 'g',
    motivo: 'Ajuste de inventário',
    dataHora: horasAtras(5),
  },
  {
    id: 4,
    usuario: 'Mariana Costa',
    tipo: 'Entrada',
    insumo: 'Massa',
    quantidade: 10000,
    unidade: 'g',
    motivo: 'Compra',
    dataHora: horasAtras(22),
  },
  {
    id: 5,
    usuario: 'Carlos Lima',
    tipo: 'Saída',
    insumo: 'Azeitona',
    quantidade: 150,
    unidade: 'g',
    motivo: 'Consumo interno',
    dataHora: horasAtras(26),
  },
  {
    id: 6,
    usuario: 'Ana Souza',
    tipo: 'Entrada',
    insumo: 'Coca-Cola 2L',
    quantidade: 24,
    unidade: 'un',
    motivo: 'Compra',
    dataHora: horasAtras(30),
  },
  {
    id: 7,
    usuario: 'Mariana Costa',
    tipo: 'Saída',
    insumo: 'Catupiry',
    quantidade: 400,
    unidade: 'g',
    motivo: 'Quebra',
    dataHora: horasAtras(46),
  },
  {
    id: 8,
    usuario: 'Carlos Lima',
    tipo: 'Ajuste',
    insumo: 'Chocolate',
    quantidade: 3000,
    unidade: 'g',
    motivo: 'Correção de saldo',
    dataHora: horasAtras(50),
  },
  {
    id: 9,
    usuario: 'Ana Souza',
    tipo: 'Entrada',
    insumo: 'Calabresa',
    quantidade: 2000,
    unidade: 'g',
    motivo: 'Recebimento de fornecedor',
    dataHora: horasAtras(70),
  },
  {
    id: 10,
    usuario: 'Mariana Costa',
    tipo: 'Saída',
    insumo: 'Queijo muçarela',
    quantidade: 800,
    unidade: 'g',
    motivo: 'Consumo interno',
    dataHora: horasAtras(74),
  },
]

export { historicoMock }
