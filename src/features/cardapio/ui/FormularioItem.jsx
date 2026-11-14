import { useEffect, useState } from 'react'
import { formatar } from '../../../shared/lib/formatar'
import styles from '../../../shared/ui/formulario.module.css'

const tiposItem = { TRADICIONAL: 'Tradicional', TREM: 'Trem', BEIRUTE: 'Beirute' }

function FormularioItem({ dados, estoque, aoSalvar }) {
  const [nome, setNome] = useState(dados?.nome || '')
  const [tipo, setTipo] = useState(dados?.tipo || 'TRADICIONAL')
  const [tamanho, setTamanho] = useState(dados?.tamanho || 35)
  const [receita, setReceita] = useState(dados?.receita || [])
  const [insumoId, setInsumoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [erro, setErro] = useState('')
  const [produtoPendente, setProdutoPendente] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (dados) {
      setReceita((dados.receita || []).map((ingrediente) => ({ ...ingrediente })))
    }
  }, [dados])

  const ingredientesDisponiveis = estoque.filter((item) => item.ativo)


  function adicionarIngrediente() {
    const id = Number(insumoId)
    const qtd = Number(quantidade)

    if (!ingredientesDisponiveis.some((item) => item.id === id) || !Number.isFinite(qtd)
      || qtd <= 0 || Math.abs(qtd * 1000 - Math.round(qtd * 1000)) > 1e-7) {
      setErro('Selecione um insumo ativo e informe uma quantidade positiva com até 3 casas decimais.')
      return
    }

    setReceita((atual) => {
      const ingredienteExistente = atual.some((item) => item.insumoId === id)

      if (ingredienteExistente) {
        return atual.map((item) => (
          item.insumoId === id
            ? { ...item, quantidade: qtd }
            : item
        ))
      }

      return [...atual, { insumoId: id, quantidade: qtd }]
    })
    setQuantidade('')
    setErro('')
  }

  function removerIngrediente(insumoIdRemovido) {
    setReceita((atual) => atual.filter((ingrediente) => (
      ingrediente.insumoId !== insumoIdRemovido
    )))
    setErro('')
  }

  async function enviar(evento) {
    evento.preventDefault()

    if (!receita.length) {
      setErro('Adicione pelo menos um ingrediente à receita.')
      return
    }

    if (receita.some((ingrediente) => !ingredientesDisponiveis.some((item) => item.id === ingrediente.insumoId))) {
      setErro('Remova os ingredientes inativos antes de salvar a receita.')
      return
    }

    setErro('')
    setEnviando(true)
    const pendente = await aoSalvar({
      ...dados,
      nome,
      tipo,
      tamanho: Number(tamanho),
      ativo: dados?.ativo !== false,
      receita,
      receitaAnterior: dados?.receita || [],
    }, produtoPendente)
    if (pendente) setProdutoPendente(pendente)
    setEnviando(false)
  }

  return (
    <form className={styles.formulario} onSubmit={enviar}>
      <label htmlFor="nome-item">
        Nome do item
        <input
          id="nome-item"
          required
          maxLength={255}
          disabled={Boolean(produtoPendente) || enviando}
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          placeholder="Ex.: Calabresa"
        />
      </label>

      <label htmlFor="tipo-item">
        Tipo
        <select
          id="tipo-item"
          disabled={Boolean(produtoPendente) || enviando}
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value)}
        >
          {Object.entries(tiposItem).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
      </label>

      <label htmlFor="tamanho-item">
        Tamanho (cm)
        <input
          id="tamanho-item"
          type="number"
          min="1"
          step="1"
          required
          disabled={Boolean(produtoPendente) || enviando}
          value={tamanho}
          onChange={(evento) => setTamanho(evento.target.value)}
        />
      </label>

      <p className={styles.ajuda}>
        Informe a quantidade de cada ingrediente usada em uma pizza.
      </p>

      <div className={styles.adicionarReceita}>
        <select
          aria-label="Insumo"
          value={insumoId}
          onChange={(evento) => setInsumoId(evento.target.value)}
        >
          <option value="">Insumo</option>
          {ingredientesDisponiveis.map((item) => (
            <option value={item.id} key={item.id}>{item.nome}</option>
          ))}
        </select>
        <input
          aria-label="Quantidade do ingrediente"
          type="number"
          min="0.001"
          step="0.001"
          placeholder="Qtd."
          value={quantidade}
          onChange={(evento) => setQuantidade(evento.target.value)}
        />
        <button
          className={styles.botaoSecundario}
          type="button"
          onClick={adicionarIngrediente}
        >
          Adicionar
        </button>
      </div>

      <div className={styles.listaReceita}>
        {receita.map((ingrediente) => {
          const insumo = estoque.find((item) => item.id === ingrediente.insumoId)

          return (
            <div key={ingrediente.insumoId}>
              <span>{insumo?.nome || 'Insumo'}{insumo && !insumo.ativo ? ' (inativo)' : ''}</span>
              <b>{formatar(ingrediente.quantidade)} {insumo?.unidade}</b>
              <button
                type="button"
                aria-label={`Remover ${insumo?.nome || 'ingrediente'}`}
                onClick={() => removerIngrediente(ingrediente.insumoId)}
              >
                ×
              </button>
            </div>
          )
        })}
        {!receita.length && <p>Nenhum ingrediente adicionado.</p>}
      </div>

      {erro && <p className={styles.erro}>{erro}</p>}

      {produtoPendente && <p className={styles.ajuda}>Produto salvo. Corrija a receita e tente novamente; o produto não será duplicado.</p>}
      <button className={styles.botaoPrimario} type="submit" disabled={enviando}>
        {enviando ? 'Salvando...' : produtoPendente ? 'Tentar salvar receita' : 'Salvar item'}
      </button>
    </form>
  )
}

export default FormularioItem
