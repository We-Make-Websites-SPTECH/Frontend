import { useState } from 'react'
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react'
import { useEstoque } from '../features/estoque/model/useEstoque.jsx'
import { useCardapio } from '../features/cardapio/model/useCardapio.jsx'
import { useVendas } from '../features/vendas/model/useVendas'
import { ModalReceita } from '../features/vendas/ui/ModalReceita'
import CardapioPage from '../pages/cardapioPage'
import DashboardPage from '../pages/dashboardPage'
import EstoquePage from '../pages/estoquePage'
import LoginPage from '../pages/loginPage'
import VendasPage from '../pages/vendasPage'
import styles from './app.module.css'

function App() {
  const [pagina, setPagina] = useState('estoque')
  const [escuro, setEscuro] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  const estoqueModel = useEstoque()
  const cardapioModel = useCardapio({ avisar: estoqueModel.avisar })
  const vendasModel = useVendas({
    itens: cardapioModel.itens,
    aoBaixarEstoque: estoqueModel.baixarConsumo,
    avisar: estoqueModel.avisar,
  })

  if (!estoqueModel.usuarioLogado) {
    return <LoginPage aoEntrar={estoqueModel.entrar} />
  }

  function navegarPara(novaPagina) {
    setPagina(novaPagina)
    setMenuAberto(false)
  }

  return (
    <div className={`${styles.aplicativo} ${escuro ? styles.modoEscuro : ''}`}>
      <button
        className={styles.botaoMenu}
        onClick={() => setMenuAberto(!menuAberto)}
        aria-label="Abrir menu"
      >
        {menuAberto ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`${styles.menuLateral} ${menuAberto ? styles.menuAberto : ''}`}>
        <div className={styles.logo}>Primarella</div>
        <small className={styles.rotuloMenu}>OPERAÇÃO</small>

        <button
          className={pagina === 'estoque' ? styles.itemAtivo : ''}
          onClick={() => navegarPara('estoque')}
        >
          Estoque
        </button>
        <button
          className={pagina === 'cardapio' ? styles.itemAtivo : ''}
          onClick={() => navegarPara('cardapio')}
        >
          Cardápio
        </button>
        <button
          className={pagina === 'vendas' ? styles.itemAtivo : ''}
          onClick={() => navegarPara('vendas')}
        >
          Registrar vendas
        </button>
        <button
          className={pagina === 'dashboard' ? styles.itemAtivo : ''}
          onClick={() => navegarPara('dashboard')}
        >
          Indicadores
        </button>

        <div className={styles.perfil}>
          <span>MC</span>
          <div>
            <b>Mariana Costa</b>
            <small>Administradora</small>
          </div>
        </div>
        <button className={styles.botaoSair} onClick={estoqueModel.sair}>
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <main className={styles.principal}>
        <header className={styles.barraSuperior}>
          <span>Controle de estoque</span>
          <button
            className={styles.botaoTema}
            onClick={() => setEscuro(!escuro)}
            aria-label="Alternar tema"
          >
            {escuro ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {pagina === 'estoque' && <EstoquePage {...estoqueModel} />}
        {pagina === 'cardapio' && (
          <CardapioPage
            {...cardapioModel}
            estoque={estoqueModel.estoque}
          />
        )}
        {pagina === 'vendas' && (
          <VendasPage
            {...vendasModel}
            estoque={estoqueModel.estoque}
            itens={cardapioModel.itens}
          />
        )}
        {pagina === 'dashboard' && <DashboardPage />}
      </main>

      {estoqueModel.painel && (
        <PainelFormulario
          painel={estoqueModel.painel}
          fechar={estoqueModel.fecharPainel}
        />
      )}
      {cardapioModel.painel && (
        <PainelFormulario
          painel={cardapioModel.painel}
          fechar={cardapioModel.fecharPainel}
        />
      )}

      {vendasModel.itemModal !== null && (
        <ModalReceita
          venda={vendasModel.lista[vendasModel.itemModal]}
          item={cardapioModel.itens.find((item) => (
            item.id === vendasModel.lista[vendasModel.itemModal]?.itemId
          ))}
          estoque={estoqueModel.estoque}
          aoFechar={() => vendasModel.setItemModal(null)}
          aoSalvar={vendasModel.salvarVariacao}
        />
      )}

      {estoqueModel.mensagem && (
        <div className={styles.notificacao}>{estoqueModel.mensagem}</div>
      )}
    </div>
  )
}

function PainelFormulario({ painel, fechar }) {
  return (
    <div
      className={styles.fundoPainel}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          fechar()
        }
      }}
    >
      <aside className={styles.painel}>
        <div className={styles.tituloPainel}>
          <h2>{painel.titulo}</h2>
          <button onClick={fechar} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        {painel.conteudo}
      </aside>
    </div>
  )
}

export default App
