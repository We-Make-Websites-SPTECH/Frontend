import { useEffect, useState } from 'react'
import { formatar } from '../../../shared/lib/formatar'
import styles from '../../../shared/ui/formulario.module.css'

const tiposItem = ['Tradicional', 'Trem', 'Beirute']

function FormularioItem({ dados, estoque, aoSalvar }) {
  const [nome, setNome] = useState(dados?.nome || '')
  const [tipo, setTipo] = useState(dados?.tipo || 'Tradicional')
  const [tamanho, setTamanho] = useState(dados?.tamanho || 35)
  const [receita, setReceita] = useState(dados?.receita || [])
  const [insumoId, setInsumoId] = useState('')
  const [quantidade, setQuantidade] = useState('')

  useEffect(() => {
    if (dados) {
      setReceita(dados.receita.map((ingrediente) => ({ ...ingrediente })))
    }
  }, [dados])

  const ingredientesDisponiveis = estoque.filter((item) => (
    item.ativo && item.categoria !== 'Bebidas'
  ))


  function adicionarIngrediente() {
    const id = Number(insumoId)
    const qtd = Number(quantidade)

    if (!id || qtd <= 0) {
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
  }

  function removerIngrediente(insumoIdRemovido) {
    setReceita((atual) => atual.filter((ingrediente) => (
      ingrediente.insumoId !== insumoIdRemovido
    )))
  }

  function enviar(evento) {
    evento.preventDefault()
    aoSalvar({
      ...dados,
      nome,
      tipo,
      tamanho: Number(tamanho),
      ativo: true,
      receita,
    })
  }

  return (
    <form className={styles.formulario} onSubmit={enviar}>
      <label htmlFor="nome-item">
        Nome do item
        <input
          id="nome-item"
          required
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          placeholder="Ex.: Calabresa"
        />
      </label>

      <label htmlFor="tipo-item">
        Tipo
        <select
          id="tipo-item"
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value)}
        >
          {tiposItem.map((opcao) => (
            <option key={opcao} value={opcao}>{opcao}</option>
          ))}
        </select>
      </label>

      <label htmlFor="tamanho-item">
        Tamanho (cm)
        <input
          id="tamanho-item"
          type="number"
          min="1"
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
          min="0.01"
          step="any"
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
              <span>{insumo?.nome || 'Insumo'}</span>
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

      <button className={styles.botaoPrimario} type="submit">
        Salvar item
      </button>
    </form>
  )
}

export default FormularioItem
