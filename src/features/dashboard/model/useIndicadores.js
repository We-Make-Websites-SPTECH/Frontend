import { useCallback, useEffect, useState } from 'react'
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

  const carregar = useCallback(async () => {
    setCarregando(true)

    try {
      const resposta = await buscarIndicadores()
      setIndicadores(resposta)
    } catch (erro) {
      console.error('Não foi possível carregar os indicadores.', erro)
      setIndicadores(criarIndicadoresVazios())
    } finally {
      setCarregando(false)
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
    recarregar: carregar,
  }
}
