import { useState } from 'react'
import styles from '../../../shared/ui/formulario.module.css'

const categoriasInsumo = [
  'Proteínas',
  'Laticínios',
  'Hortifrúti',
  'Bebidas',
  'Secos',
  'Outros',
]

function FormularioInsumo({ dados, aoSalvar }) {
  const [formulario, setFormulario] = useState(dados ? { ...dados } : {
    nome: '',
    categoria: 'Outros',
    unidade: 'g',
    saldo: 0,
    limite: 0,
    fornecedor: '',
    perda: 0,
    ativo: true,
  })

  function alterar(campo, valor) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }))
  }

  function trocarCategoria(evento) {
    const categoria = evento.target.value
    alterar('categoria', categoria)

    if (categoria === 'Bebidas') {
      alterar('perda', 0)
    }
  }

  function trocarUnidade(evento) {
    const unidade = evento.target.value
    alterar('unidade', unidade)

    if (unidade !== 'g') {
      alterar('perda', 0)
    }
  }

  function enviar(evento) {
    evento.preventDefault()

    const perda = formulario.categoria === 'Bebidas' || formulario.unidade !== 'g'
      ? 0
      : Number(formulario.perda || 0)
    const saldoBruto = Number(formulario.saldo)
    const saldoInicial = dados
      ? saldoBruto
      : saldoBruto * (1 - perda / 100)

    aoSalvar({
      ...formulario,
      perda,
      saldo: saldoInicial,
      limite: Number(formulario.limite),
    })
  }

  return (
    <form className={styles.formulario} onSubmit={enviar}>
      <label htmlFor="nome-insumo">
        Nome do insumo
        <input
          id="nome-insumo"
          required
          value={formulario.nome}
          onChange={(evento) => alterar('nome', evento.target.value)}
          placeholder="Ex.: Calabresa"
        />
      </label>

      <label htmlFor="categoria-insumo">
        Categoria
        <select
          id="categoria-insumo"
          value={formulario.categoria}
          onChange={trocarCategoria}
        >
          {categoriasInsumo.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="unidade-insumo">
        Unidade
        <select
          id="unidade-insumo"
          value={formulario.unidade}
          onChange={trocarUnidade}
        >
          <option value="g">Gramas (g)</option>
          <option value="un">Unidade (un)</option>
        </select>
      </label>

      {!dados && (
        <label htmlFor="saldo-inicial">
          Saldo inicial
          <input
            id="saldo-inicial"
            type="number"
            min="0"
            value={formulario.saldo}
            onChange={(evento) => alterar('saldo', evento.target.value)}
          />
        </label>
      )}

      <label htmlFor="limite-insumo">
        Estoque mínimo
        <input
          id="limite-insumo"
          type="number"
          min="0"
          value={formulario.limite}
          onChange={(evento) => alterar('limite', evento.target.value)}
        />
      </label>

      <label htmlFor="fornecedor-insumo">
        Fornecedor (opcional)
        <input
          id="fornecedor-insumo"
          value={formulario.fornecedor}
          onChange={(evento) => alterar('fornecedor', evento.target.value)}
          placeholder="Nome do fornecedor"
        />
      </label>

      {formulario.categoria !== 'Bebidas' && formulario.unidade === 'g' && (
        <label htmlFor="perda-insumo">
          Perda estimada (%) · opcional
          <input
            id="perda-insumo"
            type="number"
            min="0"
            max="100"
            value={formulario.perda}
            onChange={(evento) => alterar('perda', evento.target.value)}
          />
          <small>
            O percentual será descontado do saldo inicial e das próximas entradas.
          </small>
        </label>
      )}

      {dados && (
        <label className={styles.caixaSelecao} htmlFor="insumo-ativo">
          <input
            id="insumo-ativo"
            type="checkbox"
            checked={formulario.ativo}
            onChange={(evento) => alterar('ativo', evento.target.checked)}
          />
          Insumo ativo
        </label>
      )}

      <button className={styles.botaoPrimario} type="submit">
        Salvar insumo
      </button>
    </form>
  )
}

export default FormularioInsumo
