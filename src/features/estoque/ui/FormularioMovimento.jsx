import { useEffect, useRef, useState } from 'react'
import { formatar } from '../../../shared/lib/formatar'
import styles from '../../../shared/ui/formulario.module.css'

const tiposMovimento = ['Entrada', 'Saída']

function FormularioMovimento({ estoque, aoSalvar }) {
  const [tipo, setTipo] = useState('Entrada')
  const [insumoId, setInsumoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [justificativa, setJustificativa] = useState('')
  const [busca, setBusca] = useState('')
  const [listaAberta, setListaAberta] = useState(false)
  const autocompleteRef = useRef(null)

  const insumoSelecionado = estoque.find((item) => item.id === Number(insumoId))
  const insumosFiltrados = estoque.filter((item) => (
    item.ativo && item.nome.toLowerCase().includes(busca.toLowerCase())
  ))

  useEffect(() => {
    function fecharAoClicarFora(evento) {
      const clicouFora = autocompleteRef.current
        && !autocompleteRef.current.contains(evento.target)

      if (clicouFora) {
        setListaAberta(false)
      }
    }

    document.addEventListener('mousedown', fecharAoClicarFora)

    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora)
    }
  }, [])

  function trocarTipo(novoTipo) {
    setTipo(novoTipo)
    setListaAberta(false)
  }

  function buscarInsumo(evento) {
    setBusca(evento.target.value)
    setInsumoId('')
    setListaAberta(true)
  }

  function selecionarInsumo(insumo) {
    setInsumoId(String(insumo.id))
    setBusca(insumo.nome)
    setListaAberta(false)
  }

  function enviar(evento) {
    evento.preventDefault()

    if (!insumoId || Number(quantidade) <= 0) {
      return
    }

    aoSalvar({
      tipo,
      insumoId: Number(insumoId),
      quantidade: Number(quantidade),
      justificativa,
    })
  }

  return (
    <form className={styles.formulario} onSubmit={enviar}>
      <div className={styles.abasTipo}>
        {tiposMovimento.map((opcao) => (
          <button
            type="button"
            key={opcao}
            className={tipo === opcao ? styles.abaSelecionada : ''}
            onClick={() => trocarTipo(opcao)}
          >
            {opcao}
          </button>
        ))}
      </div>

      <div className={styles.campoFormulario}>
        <label htmlFor="insumo-movimento">Insumo</label>
        <div className={styles.autocomplete} ref={autocompleteRef}>
          <input
            id="insumo-movimento"
            required
            value={insumoSelecionado?.nome || busca}
            placeholder="Digite para buscar..."
            onFocus={() => setListaAberta(true)}
            onChange={buscarInsumo}
            autoComplete="off"
          />

          {listaAberta && (
            <div className={styles.sugestoes}>
              {insumosFiltrados.length > 0 ? (
                insumosFiltrados.map((insumo) => (
                  <button
                    type="button"
                    key={insumo.id}
                    onClick={() => selecionarInsumo(insumo)}
                  >
                    <span>{insumo.nome}</span>
                    <small>
                      Saldo {formatar(insumo.saldo)} {insumo.unidade}
                    </small>
                  </button>
                ))
              ) : (
                <p className={styles.semResultados}>Nenhum insumo encontrado.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <label htmlFor="quantidade-movimento">
        Quantidade
        <input
          id="quantidade-movimento"
          required
          type="number"
          min="0.01"
          step="any"
          value={quantidade}
          onChange={(evento) => setQuantidade(evento.target.value)}
        />
      </label>

      {tipo === 'Saída' && (
        <label htmlFor="justificativa-movimento">
          Justificativa (opcional)
          <textarea
            id="justificativa-movimento"
            value={justificativa}
            onChange={(evento) => setJustificativa(evento.target.value)}
            placeholder="Descreva o motivo da saída"
          />
        </label>
      )}

      <button className={styles.botaoPrimario} type="submit">
        Confirmar {tipo.toLowerCase()}
      </button>
    </form>
  )
}

export default FormularioMovimento
