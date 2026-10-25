import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import styles from './cardapio/style.module.css'

const filtrosCardapio = ['Todos', 'Tradicional', 'Trem', 'Beirute']

function Cardapio({ itens, abrirNovoItem, editarItem, estoque }) {
  const [pesquisa, setPesquisa] = useState('')
  const [filtro, setFiltro] = useState('Todos')

  const itensFiltrados = useMemo(() => (
    itens
      .filter((item) => item.nome.toLowerCase().includes(pesquisa.toLowerCase()))
      .filter((item) => filtro === 'Todos' || item.tipo === filtro)
  ), [itens, pesquisa, filtro])

  return (
    <section className={styles.conteudo}>
      <div className={styles.cabecalhoPagina}>
        <div>
          <small>OPERAÇÃO / CARDÁPIO</small>
          <h1>Cardápio</h1>
          <p>
            Associe ingredientes aos itens para calcular a saída de estoque pelas vendas.
          </p>
        </div>
        <button className={styles.botaoPrimario} onClick={() => abrirNovoItem(estoque)}>
          <Plus size={17} />
          Novo item
        </button>
      </div>

      <div className={styles.cartao}>
        <div className={styles.tituloCartao}>
          <div>
            <h2>Itens cadastrados</h2>
            <small>{itens.length} itens</small>
          </div>
        </div>

        <div className={styles.ferramentas}>
          <div className={styles.pesquisa}>
            <Search size={17} />
            <input
              placeholder="Pesquisar item..."
              value={pesquisa}
              onChange={(evento) => setPesquisa(evento.target.value)}
            />
          </div>
          <div className={styles.filtros}>
            {filtrosCardapio.map((opcao) => (
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
                <th>ITEM</th>
                <th>TAMANHO</th>
                <th>TIPO</th>
                <th>INGREDIENTES</th>
                <th>STATUS</th>
                <th>AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b>{item.nome}</b>
                    <small>Código {item.id}</small>
                  </td>
                  <td>{item.tamanho} cm</td>
                  <td>{item.tipo}</td>
                  <td>{item.receita.length} ingredientes</td>
                  <td>
                    <span className={styles.statusNormal}>
                      ● {item.ativo ? 'Ativo' : 'Desativado'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.botaoTexto}
                      onClick={() => editarItem(item, estoque)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!itensFiltrados.length && (
            <div className={styles.vazio}>Nenhum item encontrado.</div>
          )}
        </div>

        {itens.length > 0 && (
          <div className={styles.dica}>
            As quantidades da receita são calculadas por unidade vendida.
          </div>
        )}
      </div>

      <div className={styles.cartaoInfo}>
        <b>Como funciona?</b>
        <p>
          Cadastre a quantidade de cada ingrediente usada em uma pizza. Ao registrar vendas,
          o sistema calcula o consumo previsto para atualizar o estoque.
        </p>
      </div>
    </section>
  )
}

export default Cardapio
