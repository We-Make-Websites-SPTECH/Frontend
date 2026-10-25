import { useState } from 'react'
import styles from '../../../pages/vendas/style.module.css'

function ModalReceita({ venda, item, estoque, aoFechar, aoSalvar }) {
  const [receita, setReceita] = useState(
    item?.receita.map((ingrediente) => ({ ...ingrediente })) || [],
  )
  const [quantidade, setQuantidade] = useState('1')
  const [insumoId, setInsumoId] = useState('')
  const [quantidadeIngrediente, setQuantidadeIngrediente] = useState('')

  const quantidadeJaAlterada = (venda.variacoes || []).reduce(
    (soma, variacao) => soma + variacao.quantidade,
    0,
  )
  const quantidadeDisponivel = venda.quantidade - quantidadeJaAlterada
  const insumosDisponiveis = estoque.filter((insumo) => (
    insumo.ativo && insumo.categoria !== 'Bebidas'
  ))

  function alterarQuantidadeIngrediente(id, valor) {
    setReceita((atual) => atual.map((ingrediente) => (
      ingrediente.insumoId === id
        ? { ...ingrediente, quantidade: valor }
        : ingrediente
    )))
  }

  function removerIngrediente(id) {
    setReceita((atual) => atual.filter((ingrediente) => ingrediente.insumoId !== id))
  }

  function adicionarIngrediente() {
    const id = Number(insumoId)
    const quantidadeNova = Number(quantidadeIngrediente)

    if (!id || quantidadeNova <= 0) {
      return
    }

    setReceita((atual) => {
      const ingredienteExistente = atual.some((ingrediente) => ingrediente.insumoId === id)

      if (ingredienteExistente) {
        return atual.map((ingrediente) => (
          ingrediente.insumoId === id
            ? { ...ingrediente, quantidade: quantidadeNova }
            : ingrediente
        ))
      }

      return [...atual, { insumoId: id, quantidade: quantidadeNova }]
    })
    setQuantidadeIngrediente('')
  }

  function aplicarAlteracao() {
    const quantidadeAlterada = Number(quantidade)

    if (
      !Number.isInteger(quantidadeAlterada)
      || quantidadeAlterada < 1
      || quantidadeAlterada > quantidadeDisponivel
    ) {
      return
    }

    aoSalvar({
      quantidade: quantidadeAlterada,
      receita: receita.map((ingrediente) => ({
        ...ingrediente,
        quantidade: Number(ingrediente.quantidade),
      })),
    })
  }

  function fecharAoClicarNoFundo(evento) {
    if (evento.target === evento.currentTarget) {
      aoFechar()
    }
  }

  return (
    <div className={styles.fundoModal} onMouseDown={fecharAoClicarNoFundo}>
      <div className={styles.modal}>
        <button
          className={styles.fecharModal}
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
        >
          ×
        </button>

        <h2>Alterar ingredientes</h2>
        <p>{item?.nome} · {venda.quantidade} unidades vendidas</p>

        <label className={styles.campo} htmlFor="quantidade-com-receita-alterada">
          Unidades com esta alteração
          <input
            id="quantidade-com-receita-alterada"
            type="number"
            min="1"
            max={quantidadeDisponivel}
            value={quantidade}
            onChange={(evento) => setQuantidade(evento.target.value)}
          />
        </label>

        <div className={styles.listaIngredientes}>
          {receita.map((ingrediente) => {
            const insumo = estoque.find((produto) => (
              produto.id === ingrediente.insumoId
            ))

            return (
              <div key={ingrediente.insumoId}>
                <span>{insumo?.nome}</span>
                <input
                  aria-label={`Quantidade de ${insumo?.nome || 'ingrediente'}`}
                  type="number"
                  min="0"
                  step="any"
                  value={ingrediente.quantidade}
                  onChange={(evento) => alterarQuantidadeIngrediente(
                    ingrediente.insumoId,
                    evento.target.value,
                  )}
                />
                <small>{insumo?.unidade}</small>
                <button
                  type="button"
                  onClick={() => removerIngrediente(ingrediente.insumoId)}
                >
                  Remover
                </button>
              </div>
            )
          })}
        </div>

        <div className={styles.adicionarVenda}>
          <select
            aria-label="Adicionar ingrediente"
            value={insumoId}
            onChange={(evento) => setInsumoId(evento.target.value)}
          >
            <option value="">Adicionar ingrediente</option>
            {insumosDisponiveis.map((insumo) => (
              <option value={insumo.id} key={insumo.id}>
                {insumo.nome}
              </option>
            ))}
          </select>
          <input
            aria-label="Quantidade do ingrediente"
            type="number"
            min="0.01"
            step="any"
            placeholder="Qtd."
            value={quantidadeIngrediente}
            onChange={(evento) => setQuantidadeIngrediente(evento.target.value)}
          />
          <button
            className={styles.botaoSecundario}
            type="button"
            onClick={adicionarIngrediente}
          >
            Adicionar
          </button>
        </div>

        <button
          className={styles.botaoPrimario}
          type="button"
          onClick={aplicarAlteracao}
        >
          Aplicar alteração
        </button>
      </div>
    </div>
  )
}

export { ModalReceita }
