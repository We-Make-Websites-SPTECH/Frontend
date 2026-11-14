import { useState } from 'react'
import styles from '../../../shared/ui/formulario.module.css'

function FormularioInsumo({ dados, aoSalvar }) {
  const [formulario, setFormulario] = useState(dados ? { ...dados } : {
    nome: '',
    unidade: 'g',
    saldo: 0,
    limite: 0,
    perda: 0,
    ativo: true,
  })

  function alterar(campo, valor) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }))
  }

  function enviar(evento) {
    evento.preventDefault()

    aoSalvar({
      ...formulario,
      // Perda inteira entre 0 e 99, conforme o contrato.
      perda: Math.min(99, Math.max(0, Math.round(Number(formulario.perda || 0)))),
      // O backend aplica a perda sobre o saldo bruto.
      saldo: Number(formulario.saldo),
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

      <label htmlFor="unidade-insumo">
        Unidade
        <select
          id="unidade-insumo"
          value={formulario.unidade}
          onChange={(evento) => alterar('unidade', evento.target.value)}
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
            step="any"
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
          step="any"
          value={formulario.limite}
          onChange={(evento) => alterar('limite', evento.target.value)}
        />
      </label>

      <label htmlFor="perda-insumo">
        Perda estimada (%) · opcional
        <input
          id="perda-insumo"
          type="number"
          min="0"
          max="99"
          step="1"
          value={formulario.perda}
          onChange={(evento) => alterar('perda', evento.target.value)}
        />
        <small>
          O percentual é aplicado pelo servidor sobre o saldo inicial e as
          próximas entradas.
        </small>
      </label>

      <button className={styles.botaoPrimario} type="submit">
        Salvar insumo
      </button>
    </form>
  )
}

export default FormularioInsumo
