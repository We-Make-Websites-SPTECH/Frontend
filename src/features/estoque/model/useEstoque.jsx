import { useEffect, useMemo, useState } from 'react'
import {
  listarInsumos,
  registrarMovimentacao,
  salvarInsumo,
} from '../../../entities/insumo/insumo.api'
import FormularioInsumo from '../ui/FormularioInsumo'
import FormularioMovimento from '../ui/FormularioMovimento'

export function useEstoque() {
  const [estoque, setEstoque] = useState([])
  const [painel, setPainel] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [usuarioLogado, setUsuarioLogado] = useState(
  localStorage.getItem('usuarioLogado') === 'true'
)

  useEffect(() => {
    listarInsumos().then(setEstoque)
  }, [])

  const abaixoDoLimite = useMemo(
    () => estoque.filter((item) => item.ativo && item.saldo < item.limite),
    [estoque],
  )

  function avisar(texto) {
    setMensagem(texto)
    window.setTimeout(() => setMensagem(''), 2600)
  }

  function fecharPainel() {
    setPainel(null)
  }

  function abrirNovoInsumo() {
    setPainel({
      titulo: 'Novo insumo',
      conteudo: (
        <FormularioInsumo
          aoSalvar={salvarDadosInsumo}
        />
      ),
    })
  }

  function editarInsumo(insumo) {
    setPainel({
      titulo: 'Editar insumo',
      conteudo: (
        <FormularioInsumo
          dados={insumo}
          aoSalvar={salvarDadosInsumo}
        />
      ),
    })
  }

  function abrirMovimentacao() {
    setPainel({
      titulo: 'Movimentar estoque',
      conteudo: (
        <FormularioMovimento
          estoque={estoque}
          aoSalvar={movimentar}
        />
      ),
    })
  }

  async function salvarDadosInsumo(dados) {
    const salvo = await salvarInsumo(dados)
    setEstoque((lista) => {
      if (!dados.id) {
        return [...lista, salvo]
      }

      return lista.map((item) => {
        if (item.id === salvo.id) {
          return { ...item, ...salvo }
        }

        return item
      })
    })
    avisar(dados.id ? 'Insumo atualizado.' : 'Insumo cadastrado.')
    fecharPainel()
  }

  async function movimentar(dados) {
    await registrarMovimentacao(dados)
    const insumo = estoque.find((item) => item.id === dados.insumoId)
    const perda = dados.tipo === 'Entrada'
      ? Number(insumo?.perda || 0)
      : 0
    const quantidadeComPerda = dados.quantidade * (1 - perda / 100)
    const valor = dados.tipo === 'Entrada'
      ? quantidadeComPerda
      : -dados.quantidade

    setEstoque((lista) => lista.map((item) => {
      if (item.id !== dados.insumoId) {
        return item
      }

      return {
        ...item,
        saldo: Math.max(0, item.saldo + valor),
      }
    }))
    avisar(`${dados.tipo} registrada com sucesso.`)
    fecharPainel()
  }

  function baixarConsumo(consumo, inverter = false) {
    setEstoque((lista) => lista.map((item) => {
      const quantidade = consumo[item.id] || 0
      const fator = inverter ? 1 : -1

      return {
        ...item,
        saldo: Math.max(0, item.saldo + quantidade * fator),
      }
    }))
  }

  return {
    estoque,
    abaixoDoLimite,
    painel,
    mensagem,
    usuarioLogado,
    entrar: () => setUsuarioLogado(true),
    sair: () => setUsuarioLogado(false),
    fecharPainel,
    abrirNovoInsumo,
    editarInsumo,
    abrirMovimentacao,
    baixarConsumo,
    avisar,
  }
}
