import { useEffect, useMemo, useState } from 'react'
import {
  desativarInsumo as desativarInsumoApi,
  listarInsumos,
  registrarMovimentacao,
  salvarInsumo,
} from '../../../entities/insumo/insumo.api'
import FormularioInsumo from '../ui/FormularioInsumo'
import FormularioMovimento from '../ui/FormularioMovimento'

export function useEstoque({ aoAtualizarIndicadores }) {
  const [estoque, setEstoque] = useState([])
  const [painel, setPainel] = useState(null)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('usuarioId')) {
      return
    }

    carregarEstoque().catch((erro) => {
      console.error('Não foi possível carregar o estoque.', erro)
      avisar(erro.message || 'Não foi possível carregar o estoque.')
    })
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

  async function carregarEstoque() {
    const lista = await listarInsumos()
    setEstoque(lista)
    return lista
  }

  function mensagemDoServidor(erro) {
    const generica = /^Erro \d+$/.test(erro.message || '')
    return generica ? '' : erro.message
  }

  async function salvarDadosInsumo(dados) {
    try {
      await salvarInsumo(dados)
      aoAtualizarIndicadores()
      await carregarEstoque()
      avisar(dados.id ? 'Insumo atualizado.' : 'Insumo cadastrado.')
      fecharPainel()
    } catch (erro) {
      console.error('Não foi possível salvar o insumo.', erro)

      const mensagens = {
        400: 'Dados inválidos. Verifique unidade, perda (0 a 99) e quantidades.',
        403: 'Usuário sem permissão para cadastrar insumos.',
        409: 'Não foi possível salvar: insumo já cadastrado, unidade bloqueada após movimentação ou insumo inativo.',
      }

      avisar(
        mensagemDoServidor(erro)
        || mensagens[erro.status]
        || 'Não foi possível salvar o insumo.',
      )
    }
  }

  async function movimentar(dados) {
    try {
      const resposta = await registrarMovimentacao(dados)
      aoAtualizarIndicadores()
      await carregarEstoque()

      const mensagemPadrao = {
        Entrada: 'Entrada registrada.',
        Saída: 'Saída registrada.',
        Ajuste: 'Ajuste registrado.',
      }[dados.tipo] || 'Movimentação registrada.'

      // O backend avisa quando a saída foi maior que o saldo disponível.
      avisar(resposta?.aviso || mensagemPadrao)
      fecharPainel()
    } catch (erro) {
      console.error('Não foi possível registrar a movimentação.', erro)

      const conflito = {
        Entrada: 'Não foi possível registrar: insumo inativo ou em conflito.',
        Saída: 'Não há saldo disponível para registrar a saída.',
        Ajuste: 'O novo saldo precisa ser diferente do saldo atual.',
      }

      const mensagens = {
        400: 'Valor ou motivo inválido para a movimentação.',
        403: 'Usuário sem permissão para movimentar o estoque.',
        404: 'Insumo não encontrado.',
        409: conflito[dados.tipo] || 'Movimentação em conflito.',
      }

      avisar(
        mensagemDoServidor(erro)
        || mensagens[erro.status]
        || 'Não foi possível registrar a movimentação.',
      )
    }
  }

  async function desativarInsumo(insumo) {
    try {
      await desativarInsumoApi(insumo.id)
      aoAtualizarIndicadores()
      await carregarEstoque()
      avisar(`${insumo.nome} foi desativado.`)
    } catch (erro) {
      console.error('Não foi possível desativar o insumo.', erro)
      avisar(erro.message || 'Não foi possível desativar o insumo.')
    }
  }

  return {
    estoque,
    abaixoDoLimite,
    painel,
    mensagem,
    fecharPainel,
    abrirNovoInsumo,
    editarInsumo,
    abrirMovimentacao,
    desativarInsumo,
    carregarEstoque,
    avisar,
  }
}
