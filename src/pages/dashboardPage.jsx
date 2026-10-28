import { Boxes, PackageCheck, TrendingUp } from 'lucide-react'
import { formatar } from '../shared/lib/formatar'
import {
  insumosAtivosMock,
  maisConsumidosMock,
  periodoMock,
  produtosRegistradosMock,
} from '../features/dashboard/model/dashboard.mock'
import styles from './dashboard/style.module.css'

function Dashboard() {
  return (
    <section className={styles.conteudo}>
      <div className={styles.cabecalhoPagina}>
        <div>
          <small>OPERAÇÃO / INDICADORES</small>
          <h1>Indicadores</h1>
          <p>Período: {periodoMock} · dados de exemplo</p>
        </div>
      </div>

      <div className={styles.grade}>
        <CartaoInsumosAtivos dados={insumosAtivosMock} />
        <CartaoProdutosRegistrados dados={produtosRegistradosMock} />
        <CartaoMaisConsumidos dados={maisConsumidosMock} />
      </div>
    </section>
  )
}

function TituloCartao({ icone, titulo, porQueImporta }) {
  return (
    <div className={styles.tituloCartao}>
      <span className={styles.icone}>{icone}</span>
      <div>
        <h2>{titulo}</h2>
        <small>{porQueImporta}</small>
      </div>
    </div>
  )
}

function CartaoInsumosAtivos({ dados }) {
  const inativos = dados.cadastrados - dados.ativos
  const percentual = Math.round((dados.ativos / dados.cadastrados) * 100)
  const maior = Math.max(...dados.porCategoria.map((c) => c.quantidade))

  return (
    <div className={styles.cartao}>
      <TituloCartao
        icone={<Boxes size={18} />}
        titulo="Total de insumos ativos"
        porQueImporta="Visão geral do estoque gerenciado."
      />

      <div className={styles.kpi}>
        <b>{formatar(dados.ativos)}</b>
        <span>de {formatar(dados.cadastrados)} cadastrados</span>
      </div>

      <div
        className={styles.barraProgresso}
        role="img"
        aria-label={`${percentual}% dos cadastros estão ativos`}
      >
        <div style={{ width: `${percentual}%` }} />
      </div>
      <div className={styles.legendaProgresso}>
        <span>{percentual}% ativos</span>
        <span>{inativos} inativos</span>
      </div>

      <h3 className={styles.subtitulo}>Ativos por categoria</h3>
      <div className={styles.lista}>
        {dados.porCategoria.map((c) => (
          <div className={styles.linhaBarra} key={c.categoria}>
            <span>{c.categoria}</span>
            <div className={styles.trilho}>
              <div style={{ width: `${(c.quantidade / maior) * 100}%` }} />
            </div>
            <b>{c.quantidade}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

function CartaoProdutosRegistrados({ dados }) {
  const pctTxt = Math.round((dados.txt / dados.total) * 100)
  const pctManual = 100 - pctTxt
  const maior = Math.max(...dados.porSemana.map((s) => s.quantidade))

  return (
    <div className={styles.cartao}>
      <TituloCartao
        icone={<PackageCheck size={18} />}
        titulo="Produtos registrados no período"
        porQueImporta="Mostra o volume operacional da pizzaria."
      />

      <div className={styles.kpi}>
        <b>{formatar(dados.total)}</b>
        <span>produtos lançados no período</span>
      </div>

      <div
        className={styles.barraDividida}
        role="img"
        aria-label={`${pctManual}% manual, ${pctTxt}% via TXT`}
      >
        <div className={styles.segManual} style={{ width: `${pctManual}%` }} />
        <div className={styles.segTxt} style={{ width: `${pctTxt}%` }} />
      </div>
      <div className={styles.legendaProgresso}>
        <span><i className={styles.pontoManual} /> Manual · {formatar(dados.manual)}</span>
        <span><i className={styles.pontoTxt} /> Via TXT · {formatar(dados.txt)}</span>
      </div>

      <h3 className={styles.subtitulo}>Por semana</h3>
      <div className={styles.colunas}>
        {dados.porSemana.map((s) => (
          <div key={s.semana}>
            <b>{s.quantidade}</b>
            <div className={styles.coluna}>
              <div style={{ height: `${(s.quantidade / maior) * 100}%` }} />
            </div>
            <span>{s.semana}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CartaoMaisConsumidos({ dados }) {
  return (
    <div className={`${styles.cartao} ${styles.cartaoLargo}`}>
      <TituloCartao
        icone={<TrendingUp size={18} />}
        titulo="Insumos mais consumidos"
        porQueImporta="Ajuda no planejamento de reposição."
      />

      <div className={styles.doisRankings}>
        <Ranking titulo="Em gramas (g)" unidade="g" itens={dados.g} />
        <Ranking titulo="Em unidades (un)" unidade="un" itens={dados.un} />
      </div>
    </div>
  )
}

function Ranking({ titulo, unidade, itens }) {
  const ordenados = [...itens].sort((a, b) => b.consumo - a.consumo)
  const maior = ordenados[0]?.consumo || 1

  return (
    <div>
      <h3 className={styles.subtitulo}>{titulo}</h3>
      <div className={styles.lista}>
        {ordenados.map((item, indice) => (
          <div className={styles.linhaRanking} key={item.nome}>
            <div className={styles.rotuloRanking}>
              <span>{indice + 1}. {item.nome}</span>
              <b>{formatar(item.consumo)} {unidade}</b>
            </div>
            <div className={styles.trilho}>
              <div style={{ width: `${(item.consumo / maior) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
