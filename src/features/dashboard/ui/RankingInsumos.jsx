import { formatarValor } from '../model/formato'
import styles from './graficos.module.css'

function RankingInsumos({ grupos = [] }) {
  if (!grupos.length) {
    return (
      <div className={styles.graficoVazio}>
        Sem dados no período.
      </div>
    )
  }

  return (
    <div className={styles.colunasRanking}>
      {grupos.map((grupo) => (
        <section className={styles.colunaRanking} key={grupo.unidade}>
          <h3>{grupo.titulo}</h3>

          <ol className={styles.listaRanking}>
            {grupo.itens.map((item, indice) => {
              const quantidade = Number(item.quantidadeConsumida) || 0
              const largura = grupo.maior > 0
                ? Math.max(4, quantidade / grupo.maior * 100)
                : 0

              return (
                <li className={styles.itemRanking} key={item.insumoId ?? item.nome}>
                  <span className={styles.posicao}>{indice + 1}.</span>
                  <span className={styles.nome} title={item.nome}>{item.nome}</span>
                  <strong className={styles.valor}>
                    {formatarValor(quantidade, grupo.unidade)}
                  </strong>
                  <span className={styles.trilha}>
                    <span style={{ width: `${largura}%` }} />
                  </span>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}

export default RankingInsumos
