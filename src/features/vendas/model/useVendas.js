import { useCallback, useEffect, useRef, useState } from 'react'
import { confirmarRegistro, consultarRegistro, importarTxt, listarLinhas, listarRegistrosVenda, personalizarLinha, prepararManual } from '../../../entities/registro-venda/registroVenda.api'

export function useVendas({ itens, aoAtualizarEstoque, aoAtualizarIndicadores, ativo }) {
  const [lista, setLista] = useState([])
  const [data, setData] = useState(new Date().toLocaleDateString('en-CA'))
  const [itemId, setItemId] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [arquivo, setArquivo] = useState(null)
  const [registro, setRegistro] = useState(null)
  const [linhas, setLinhas] = useState([])
  const [variacoes, setVariacoes] = useState({})
  const [personalizacaoIncerta, setPersonalizacaoIncerta] = useState({})
  const [itemModal, setItemModal] = useState(null)
  const [registros, setRegistros] = useState([])
  const [detalhes, setDetalhes] = useState(null)
  const [erro, setErro] = useState('')
  const [mensagemStatus, setMensagemStatus] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [confirmacaoIniciada, setConfirmacaoIniciada] = useState(false)
  const [podeRepetir, setPodeRepetir] = useState(false)
  const [resultados, setResultados] = useState([])
  const trava = useRef(false)
  const idsConfirmacao = useRef([])

  const carregarHistorico = useCallback(async () => {
    const listaRegistros = await listarRegistrosVenda()
    setRegistros(listaRegistros.filter((item) => item.status === 'CONCLUIDO'))
  }, [])

  useEffect(() => {
    if (ativo) carregarHistorico().catch(() => setErro('Não foi possível carregar o histórico.'))
  }, [ativo, carregarHistorico])

  async function executar(acao) {
    if (trava.current) return
    trava.current = true
    setOcupado(true)
    setErro('')
    setMensagemStatus('')
    try { await acao() } catch (falha) {
      setErro(falha.message || 'Não foi possível concluir a operação.')
    } finally { trava.current = false; setOcupado(false) }
  }

  function adicionar() {
    const id = Number(itemId)
    const qtd = Number(quantidade)
    if (!itens.some((item) => item.id === id && item.ativo && item.receita?.length) || !Number.isInteger(qtd) || qtd < 1) { setErro('Selecione um item disponível e informe uma quantidade inteira positiva.'); return }
    if (lista.length >= 100 && !lista.some((item) => item.produtoId === id)) { setErro('O lançamento aceita até 100 itens.'); return }
    setLista((atual) => atual.some((item) => item.produtoId === id)
      ? atual.map((item) => item.produtoId === id ? { ...item, quantidade: item.quantidade + qtd } : item)
      : [...atual, { produtoId: id, quantidade: qtd }])
    setErro('')
  }

  function preparar() {
    executar(async () => {
      if (!data || (!arquivo && !lista.length)) throw new Error('Informe a data e adicione itens ou um arquivo TXT.')
      if (arquivo) {
        const resumo = await importarTxt(arquivo, data)
        setRegistro(resumo)
        setLinhas([])
        setLinhas(await listarLinhas(resumo.id))
      } else {
        const previa = await prepararManual(data, lista)
        setRegistro(previa.registro)
        setLinhas(previa.linhas || [])
      }
      setVariacoes({})
      setPersonalizacaoIncerta({})
      setResultados([])
      setConfirmacaoIniciada(false)
      setPodeRepetir(false)
    })
  }

  function atualizarVariacoes(linhaId, grupos) {
    executar(async () => {
      let linha
      try {
        linha = await personalizarLinha(registro, linhaId, grupos.map((grupo) => ({
          unidades: grupo.quantidade,
          ingredientes: grupo.receita.map((ingrediente) => ({ insumoId: ingrediente.insumoId, quantidade: Number(ingrediente.quantidade) })),
        })))
      } catch (falha) {
        if (falha.status === 0) {
          setItemModal(null)
          setVariacoes((atuais) => ({ ...atuais, [linhaId]: grupos }))
          setPersonalizacaoIncerta((atuais) => ({ ...atuais, [linhaId]: true }))
          throw new Error('Não foi possível confirmar a alteração. Atualize o status e reaplique ou remova a alteração antes de confirmar.')
        }
        throw falha
      }
      setLinhas((atuais) => atuais.map((atual) => atual.id === linhaId ? linha : atual))
      setVariacoes((atuais) => ({ ...atuais, [linhaId]: grupos }))
      setPersonalizacaoIncerta((atuais) => ({ ...atuais, [linhaId]: false }))
      setItemModal(null)
    })
  }

  function confirmar() {
    executar(async () => {
      if (!confirmacaoIniciada) {
        idsConfirmacao.current = linhas.filter((linha) => linha.status === 'PENDENTE').map((linha) => linha.id)
      }
      if (!idsConfirmacao.current.length) throw new Error('Não há linhas pendentes para confirmar.')
      setConfirmacaoIniciada(true)
      setPodeRepetir(false)
      let resposta
      try {
        resposta = await confirmarRegistro(registro, idsConfirmacao.current)
        setResultados(resposta || [])
      } catch (falha) {
        try {
          const [resumo, atualizadas] = await Promise.all([consultarRegistro(registro.id), listarLinhas(registro.id)])
          setRegistro(resumo); setLinhas(atualizadas)
          setPodeRepetir(resumo.status === 'PREVIA')
          await Promise.allSettled([aoAtualizarEstoque(), aoAtualizarIndicadores(), carregarHistorico()])
          if (resumo.status === 'CONCLUIDO') return
        } catch { /* Mantém o mesmo ID para consulta ou nova tentativa. */ }
        throw new Error(`Não foi possível confirmar o registro #${registro.id}. Atualize o status antes de tentar novamente: ${falha.message}`)
      }
      await Promise.allSettled([aoAtualizarEstoque(), aoAtualizarIndicadores(), carregarHistorico()])
      const atualizadas = await listarLinhas(registro.id)
      setLinhas(atualizadas)
      setRegistro(await consultarRegistro(registro.id))
      await Promise.allSettled([aoAtualizarEstoque(), aoAtualizarIndicadores(), carregarHistorico()])
    })
  }

  function consultarAtual() {
    executar(async () => {
      const [resumo, atualizadas] = await Promise.all([consultarRegistro(registro.id), listarLinhas(registro.id)])
      setRegistro(resumo); setLinhas(atualizadas)
      setPodeRepetir(confirmacaoIniciada && resumo.status === 'PREVIA')
      if (confirmacaoIniciada) await Promise.allSettled([aoAtualizarEstoque(), aoAtualizarIndicadores(), carregarHistorico()])
      setMensagemStatus('Status e itens atualizados.')
    })
  }

  function novo() {
    setRegistro(null); setLinhas([]); setVariacoes({}); setPersonalizacaoIncerta({}); setLista([]); setArquivo(null)
    setResultados([]); setConfirmacaoIniciada(false); setPodeRepetir(false); idsConfirmacao.current = []; setErro(''); setMensagemStatus('')
  }

  function verDetalhes(resumo) {
    executar(async () => setDetalhes({ ...resumo, linhas: await listarLinhas(resumo.id) }))
  }

  function atualizarHistorico() { executar(carregarHistorico) }

  return { lista, setLista, data, setData, itemId, setItemId, quantidade, setQuantidade, arquivo, setArquivo, personalizacaoIncerta,
    registro, linhas, variacoes, itemModal, setItemModal, registros, detalhes, setDetalhes, erro, ocupado, mensagemStatus,
    confirmacaoIniciada, podeRepetir, resultados, adicionar, preparar, confirmar, consultarAtual, novo, verDetalhes,
    atualizarVariacoes, atualizarHistorico }
}
