import { ArrowRightLeft, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatar } from '../shared/lib/formatar'
import styles from './estoque/style.module.css'

const filtrosEstoque = [
  'Todos',
  'Abaixo do limite',
  'Dentro do limite',
  'Desativados',
]

function Estoque({ estoque, abaixoDoLimite, abrirMovimentacao, abrirNovoInsumo, editarInsumo }) {
  const [pesquisa, setPesquisa] = useState('')
  const [filtro, setFiltro] = useState('Todos')

  const insumosFiltrados = useMemo(() => (
    estoque
      .filter((item) => item.nome.toLowerCase().includes(pesquisa.toLowerCase()))
      .filter((item) => {
        if (filtro === 'Abaixo do limite') {
          return item.ativo && item.saldo < item.limite
        }
        if (filtro === 'Dentro do limite') {
          return item.ativo && item.saldo >= item.limite
        }
        if (filtro === 'Desativados') {
          return !item.ativo
        }
        return true
      })
  ), [estoque, pesquisa, filtro])

  function statusDoInsumo(item) {
    if (!item.ativo) {
      return { classe: styles.statusDesativado, texto: 'Desativado' }
    }
    if (item.saldo < item.limite) {
      return { classe: styles.statusBaixo, texto: 'Estoque baixo' }
    }
    return { classe: styles.statusNormal, texto: 'Normal' }
  }

  return (
    <section className={styles.conteudo}>
      <div className={styles.cabecalhoPagina}>
        <div>
          <small>OPERAÇÃO / ESTOQUE</small>
          <h1>Estoque</h1>
          <p>Acompanhe seus insumos e mantenha as compras organizadas.</p>
        </div>
        <div className={styles.acoesCabecalho}>
          <button className={styles.botaoSecundario} onClick={abrirMovimentacao}>
            <ArrowRightLeft size={17} />
            Entrada / saída
          </button>
          <button className={styles.botaoPrimario} onClick={abrirNovoInsumo}>
            <Plus size={17} />
            Novo insumo
          </button>
        </div>
      </div>

      <div className={styles.indicadores}>
        <div>
          <small>Abaixo do limite</small>
          <strong>{abaixoDoLimite.length} insumos</strong>
          <span>precisam de atenção</span>
        </div>
        <div>
          <small>Mais saídas</small>
          <strong>Calabresa · 1.240 g</strong>
          <span>no período demonstrativo</span>
        </div>
        <div>
          <small>Item mais vendido</small>
          <strong>Calabresa · 35 cm</strong>
          <span>28 unidades vendidas</span>
        </div>
      </div>

      <div className={styles.cartao}>
        <div className={styles.tituloCartao}>
          <div>
            <h2>Seus insumos</h2>
            <small>{estoque.length} cadastrados</small>
          </div>
          <span>Unidades de consumo</span>
        </div>

        <div className={styles.ferramentas}>
          <div className={styles.pesquisa}>
            <Search size={17} />
            <input
              placeholder="Pesquisar insumo..."
              value={pesquisa}
              onChange={(evento) => setPesquisa(evento.target.value)}
            />
          </div>
          <div className={styles.filtros}>
            {filtrosEstoque.map((opcao) => (
              <button
                key={opcao}
                className={filtro === opcao ? styles.filtroAtivo : ''}
                onClick={() => setFiltro(opcao)}
              >
                {opcao}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tabelaResponsiva}>
          <table>
            <thead>
              <tr>
                <th>INSUMO</th>
                <th>UNIDADE</th>
                <th>SALDO ATUAL</th>
                <th>LIMITE</th>
                <th>STATUS</th>
                <th>AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {insumosFiltrados.map((item) => {
                const status = statusDoInsumo(item)
                const nivel = Math.min(
                  100,
                  Math.max(4, item.saldo / Math.max(item.limite * 2, 1) * 100),
                )

                return (
                  <tr key={item.id}>
                    <td>
                      <b>{item.nome}</b>
                      <small>{item.categoria}</small>
                    </td>
                    <td>{item.unidade}</td>
                    <td>
                      <b>{formatar(item.saldo)} {item.unidade}</b>
                      <div className={styles.barraNivel}>
                        <span style={{ width: `${nivel}%` }} />
                      </div>
                    </td>
                    <td>{formatar(item.limite)} {item.unidade}</td>
                    <td>
                      <span className={status.classe}>● {status.texto}</span>
                    </td>
                    <td>
                      <button
                        className={styles.botaoTexto}
                        onClick={() => editarInsumo(item)}
                      >
                        Editar dados
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!insumosFiltrados.length && (
            <div className={styles.vazio}>Nenhum insumo encontrado.</div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Estoque
