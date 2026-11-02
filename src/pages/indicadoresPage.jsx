import { AlertTriangle, Info, Package, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  agruparRanking,
  formatarPeriodo,
  formatarValor,
  pivotarSemanas,
  rotuloUnidade,
  totalPorUnidade,
  unidadesDe,
} from '../features/dashboard/model/formato'
import GraficoBarras from '../features/dashboard/ui/GraficoBarras'
import GraficoRosca from '../features/dashboard/ui/GraficoRosca'
import RankingInsumos from '../features/dashboard/ui/RankingInsumos'
import styles from './indicadores/style.module.css'

function valorTotal(valor, unidade) {
  if (valor === null || valor === undefined || !unidade) {
    return '—'
  }

  return formatarValor(valor, unidade)
}

function TituloCartao({ icone, titulo }) {
  return (
    <div className={styles.tituloPrincipal}>
      <span className={styles.icone}>{icone}</span>
      <h2>{titulo}</h2>
    </div>
  )
}

function SeletorUnidade({ unidades, atual, aoSelecionar }) {
  if (unidades.length < 2) {
    return null
  }

  return (
    <div className={styles.seletorUnidade} role="group" aria-label="Unidade de medida">
      {unidades.map((unidade) => (
        <button
          key={unidade}
          type="button"
          className={unidade === atual ? styles.unidadeAtiva : ''}
          onClick={() => aoSelecionar(unidade)}
        >
          {rotuloUnidade(unidade)}
        </button>
      ))}
    </div>
  )
}

function Indicadores({ indicadores, carregando, tema }) {
  const {
    dataInicio,
    dataFim,
    insumosMaisConsumidos,
    entradasSaidas,
    perdasQuebras,
    insumosStatus,
  } = indicadores

  const [unidadeEntradas, setUnidadeEntradas] = useState('')
  const [unidadePerdas, setUnidadePerdas] = useState('')

  const gruposRanking = useMemo(
    () => agruparRanking(insumosMaisConsumidos),
    [insumosMaisConsumidos],
  )

  const unidadesEntradas = useMemo(
    () => unidadesDe(entradasSaidas.movimentacoes),
    [entradasSaidas.movimentacoes],
  )
  const unidadesPerdas = useMemo(
    () => unidadesDe(perdasQuebras),
    [perdasQuebras],
  )

  const unidadeEntradasAtual = unidadesEntradas.includes(unidadeEntradas)
    ? unidadeEntradas
    : unidadesEntradas[0]
  const unidadePerdasAtual = unidadesPerdas.includes(unidadePerdas)
    ? unidadePerdas
    : unidadesPerdas[0]

  const semanasEntradas = useMemo(
    () => pivotarSemanas(entradasSaidas.movimentacoes, unidadeEntradasAtual),
    [entradasSaidas.movimentacoes, unidadeEntradasAtual],
  )

  const rotulosEntradas = useMemo(
    () => semanasEntradas.map((semana) => semana.semana),
    [semanasEntradas],
  )

  const seriesEntradas = useMemo(
    () => ([
      {
        rotulo: 'Entradas',
        cor: 'verde',
        valores: semanasEntradas.map((semana) => semana.ENTRADA),
      },
      {
        rotulo: 'Saídas',
        cor: 'vermelho',
        valores: semanasEntradas.map((semana) => semana.SAIDA),
      },
    ]),
    [semanasEntradas],
  )

  const totalEntradas = totalPorUnidade(entradasSaidas.totalEntradas, unidadeEntradasAtual)
  const totalSaidas = totalPorUnidade(entradasSaidas.totalSaidas, unidadeEntradasAtual)
  const totalEntradasTexto = valorTotal(totalEntradas, unidadeEntradasAtual)
  const totalSaidasTexto = valorTotal(totalSaidas, unidadeEntradasAtual)

  const perdasDaUnidade = useMemo(
    () => perdasQuebras.filter((perda) => perda.unidadeMedida === unidadePerdasAtual),
    [perdasQuebras, unidadePerdasAtual],
  )

  const rotulosPerdas = useMemo(
    () => perdasDaUnidade.map((perda) => perda.semana),
    [perdasDaUnidade],
  )

  const seriesPerdas = useMemo(
    () => ([
      {
        rotulo: 'Perdas',
        cor: 'vermelho',
        valores: perdasDaUnidade.map((perda) => Number(perda.quantidade) || 0),
      },
    ]),
    [perdasDaUnidade],
  )

  const totalPerdas = useMemo(
    () => perdasDaUnidade.reduce(
      (soma, perda) => soma + (Number(perda.quantidade) || 0),
      0,
    ),
    [perdasDaUnidade],
  )

  const semResposta = !dataInicio || !dataFim
  const unidadePerdasExibicao = unidadePerdasAtual
    || unidadeEntradasAtual
    || gruposRanking[0]?.unidade
  const totalPerdasExibicao = semResposta ? null : totalPerdas
  const totalPerdasTexto = valorTotal(totalPerdasExibicao, unidadePerdasExibicao)

  return (
    <section className={styles.conteudo}>
      <header className={styles.cabecalhoPagina}>
        <small>OPERAÇÃO / INDICADORES</small>
        <h1>Indicadores</h1>
        <p>
          {carregando
            ? 'Carregando indicadores...'
            : formatarPeriodo(dataInicio, dataFim)}
        </p>
      </header>

      <div className={styles.grade}>
        <article className={styles.cartao}>
          <div className={styles.tituloCartao}>
            <TituloCartao
              icone={<Package size={18} />}
              titulo="Insumos mais consumidos"
            />
          </div>
          <RankingInsumos grupos={gruposRanking} />
        </article>

        <article className={styles.cartao}>
          <div className={styles.tituloCartao}>
            <TituloCartao
              icone={<TrendingUp size={18} />}
              titulo="Entradas x saídas"
            />
            <div className={styles.resumos}>
              <div>
                <small>Total Entradas</small>
                <strong className={totalEntradasTexto === '—' ? styles.semValor : styles.verde}>
                  {totalEntradasTexto}
                </strong>
              </div>
              <div>
                <small>Total Saídas</small>
                <strong className={totalSaidasTexto === '—' ? styles.semValor : styles.vermelho}>
                  {totalSaidasTexto}
                </strong>
              </div>
            </div>
          </div>

          <div className={styles.linhaFerramentas}>
            <div className={styles.legenda}>
              <span>
                <i className={`${styles.ponto} ${styles.pontoVerde}`} />
                Entradas
              </span>
              <span>
                <i className={`${styles.ponto} ${styles.pontoVermelho}`} />
                Saídas
              </span>
            </div>
            <SeletorUnidade
              unidades={unidadesEntradas}
              atual={unidadeEntradasAtual}
              aoSelecionar={setUnidadeEntradas}
            />
          </div>

          <GraficoBarras
            rotulos={rotulosEntradas}
            series={seriesEntradas}
            tema={tema}
            altura={190}
            ariaLabel="Entradas e saídas por semana"
          />
        </article>

        <article className={styles.cartao}>
          <div className={styles.tituloCartao}>
            <TituloCartao
              icone={<AlertTriangle size={18} />}
              titulo="Perdas por quebras"
            />
            <SeletorUnidade
              unidades={unidadesPerdas}
              atual={unidadePerdasAtual}
              aoSelecionar={setUnidadePerdas}
            />
          </div>

          <div className={styles.perdaTotal}>
            <strong className={totalPerdasTexto === '—' ? styles.semValor : ''}>
              {totalPerdasTexto}
            </strong>
            <span>Total de perdas no período</span>
          </div>

          <GraficoBarras
            rotulos={rotulosPerdas}
            series={seriesPerdas}
            tema={tema}
            altura={160}
            ariaLabel="Perdas por quebra por semana"
          />

          <div className={styles.notaRodape}>
            <Info size={14} />
            Motivo: quebra
          </div>
        </article>

        <article className={styles.cartao}>
          <div className={styles.tituloCartao}>
            <TituloCartao
              icone={<Package size={18} />}
              titulo="Insumos ativos x inativos"
            />
          </div>

          <div className={styles.statusConteudo}>
            <GraficoRosca
              ativos={insumosStatus.ativos}
              inativos={insumosStatus.inativos}
              percentual={insumosStatus.percentualAtivos}
              tema={tema}
            />

            <div className={styles.legendaStatus}>
              <div className={styles.linhaStatus}>
                <span>
                  <i className={`${styles.ponto} ${styles.pontoVerde}`} />
                  Ativos
                </span>
                <strong>{insumosStatus.ativos}</strong>
              </div>
              <div className={styles.linhaStatus}>
                <span>
                  <i className={`${styles.ponto} ${styles.pontoVermelho}`} />
                  Inativos
                </span>
                <strong>{insumosStatus.inativos}</strong>
              </div>
              <div className={`${styles.linhaStatus} ${styles.linhaTotal}`}>
                <span>Total</span>
                <strong>{insumosStatus.total}</strong>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

export default Indicadores
