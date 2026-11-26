import { Clock } from 'lucide-react'
import { formatar } from '../../../shared/lib/formatar'
import { historicoMock } from '../model/historicoMock'
import styles from '../../../pages/estoque/style.module.css'

const formatoData = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function sinalDoTipo(tipo) {
  if (tipo === 'Entrada') {
    return '+'
  }

  if (tipo === 'Saída') {
    return '−'
  }

  return '='
}

function ItemHistorico({ item, oculto = false }) {
  return (
    <span
      className={`${styles.historicoItem} ${oculto ? styles.historicoCopia : ''}`}
      aria-hidden={oculto || undefined}
    >
      <b>{item.usuario}</b>{' '}
      <span className={styles.historicoAcao}>{item.tipo}</span>{' '}
      {item.insumo}{' '}
      <span className={styles.historicoDetalhe}>
        {sinalDoTipo(item.tipo)}
        {formatar(item.quantidade)} {item.unidade} · {item.motivo} ·{' '}
        {formatoData.format(new Date(item.dataHora))}
      </span>
    </span>
  )
}

function HistoricoMovimentacoes() {
  if (!historicoMock.length) {
    return null
  }

  return (
    <section
      className={styles.historico}
      aria-label="Histórico recente de movimentações de estoque"
    >
      <span className={styles.historicoTitulo}>
        <Clock size={15} />
        Histórico
      </span>
      <div className={styles.historicoJanela} tabIndex={0}>
        <div
          className={styles.historicoTrilho}
          style={{ animationDuration: `${historicoMock.length * 7}s` }}
        >
          {historicoMock.map((item) => (
            <ItemHistorico key={item.id} item={item} />
          ))}
          {historicoMock.map((item) => (
            <ItemHistorico key={`copia-${item.id}`} item={item} oculto />
          ))}
        </div>
      </div>
    </section>
  )
}

export { HistoricoMovimentacoes }
