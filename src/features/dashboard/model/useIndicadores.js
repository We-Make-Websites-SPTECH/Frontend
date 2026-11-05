import { useCallback, useEffect, useRef, useState } from 'react'
import { buscarIndicadores } from '../../../entities/dashboard/dashboard.api'

function criarIndicadoresVazios() {
  return {
    dataInicio: null,
    dataFim: null,
    insumosMaisConsumidos: [],
    entradasSaidas: {
      movimentacoes: [],
      totalEntradas: [],
      totalSaidas: [],
    },
    perdasQuebras: [],
    insumosStatus: {
      ativos: 0,
      inativos: 0,
      total: 0,
      percentualAtivos: 0,
      percentualInativos: 0,
    },
  }
}

export function useIndicadores(ativo = true) {
  const [indicadores, setIndicadores] = useState(criarIndicadoresVazios)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const ultimaRequisicao = useRef(0)

  const carregar = useCallback(async () => {
    const requisicao = ++ultimaRequisicao.current
    setCarregando(true)
    setErro('')

    try {
      const resposta = await buscarIndicadores()
      if (requisicao === ultimaRequisicao.current) setIndicadores(resposta)
    } catch (erro) {
      console.error('Não foi possível carregar os indicadores.', erro)
      if (requisicao === ultimaRequisicao.current) {
        setErro('Não foi possível carregar os indicadores. Tente novamente.')
      }
    } finally {
      if (requisicao === ultimaRequisicao.current) setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (ativo) {
      carregar()
    }
  }, [ativo, carregar])

  return {
    indicadores,
    carregando,
    erro,
    recarregar: carregar,
  }
}
