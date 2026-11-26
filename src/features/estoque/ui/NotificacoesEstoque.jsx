import { useEffect, useRef } from 'react'
import { Download } from 'lucide-react'
import { formatar } from '../../../shared/lib/formatar'
import styles from '../../../pages/estoque/style.module.css'

function NotificacoesEstoque({ itens, aoFechar, aoVerEstoque, aoExportar }) {
  const modalRef = useRef(null)
  const fecharRef = useRef(aoFechar)

  useEffect(() => {
    fecharRef.current = aoFechar
  })

  useEffect(() => {
    const anterior = document.activeElement
    const modal = modalRef.current

    if (!modal) {
      return undefined
    }

    const focaveis = modal.querySelectorAll(
      'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
    )
    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]
    const overflowAnterior = document.body.style.overflow

    primeiro?.focus()
    document.body.style.overflow = 'hidden'

    function aoTeclar(evento) {
      if (evento.key === 'Escape') {
        evento.stopPropagation()
        fecharRef.current?.()
        return
      }

      if (evento.key !== 'Tab' || !focaveis.length) {
        return
      }

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)

    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowAnterior

      if (anterior instanceof HTMLElement) {
        anterior.focus()
      }
    }
  }, [])

  function fecharAoClicarNoFundo(evento) {
    if (evento.target === evento.currentTarget) {
      aoFechar()
    }
  }

  const quantidade = itens.length
  const textoItens = quantidade === 1 ? '1 item está' : `${quantidade} itens estão`

  return (
    <div className={styles.fundoModal} onMouseDown={fecharAoClicarNoFundo}>
      <div
        className={styles.modalNotificacoes}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-notificacoes"
        ref={modalRef}
      >
        <button
          className={styles.fecharModal}
          type="button"
          onClick={aoFechar}
          aria-label="Fechar notificações"
        >
          ×
        </button>

        <h2 id="titulo-notificacoes">Estoque abaixo do limite</h2>
        <p className={styles.resumoNotificacoes}>
          {quantidade
            ? `${textoItens} abaixo do limite mínimo definido.`
            : 'Nenhum item abaixo do limite mínimo.'}
        </p>

        {quantidade > 0 && (
          <ul className={styles.listaNotificacoes}>
            {itens.map((item) => (
              <li key={item.id}>
                <div className={styles.notificacaoTopo}>
                  <b>{item.nome}</b>
                  <span className={styles.statusBaixo}>● Estoque baixo</span>
                </div>
                <p>
                  Saldo <b>{formatar(item.saldo)} {item.unidade}</b>
                  {' · '}
                  Limite {formatar(item.limite)} {item.unidade}
                </p>
                {(item.fornecedor || item.contato) && (
                  <p className={styles.fornecedorNotificacao}>
                    {item.fornecedor && (
                      <>Fornecedor: <b>{item.fornecedor}</b></>
                    )}
                    {item.fornecedor && item.contato && ' · '}
                    {item.contato}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.acoesNotificacoes}>
          <button
            className={styles.botaoSecundario}
            type="button"
            onClick={aoVerEstoque}
          >
            Ver no estoque
          </button>
          {quantidade > 0 && (
            <button
              className={styles.botaoPrimario}
              type="button"
              onClick={aoExportar}
            >
              <Download size={17} />
              Exportar relatório
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export { NotificacoesEstoque }
