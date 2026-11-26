import { useEffect, useRef, useState } from 'react'
import { Bell, LogOut, Menu, Moon, Sun, X } from 'lucide-react'
import { useEstoque } from '../features/estoque/model/useEstoque.jsx'
import { marcarNotificado, precisaNotificar } from '../features/estoque/model/notificacaoDiaria'
import { baixarRelatorioCompras } from '../features/estoque/model/relatorioCompras'
import { NotificacoesEstoque } from '../features/estoque/ui/NotificacoesEstoque'
import { useCardapio } from '../features/cardapio/model/useCardapio.jsx'
import { useVendas } from '../features/vendas/model/useVendas'
import { useIndicadores } from '../features/dashboard/model/useIndicadores'
import { ModalReceita } from '../features/vendas/ui/ModalReceita'
import CardapioPage from '../pages/cardapioPage'
import EstoquePage from '../pages/estoquePage'
import IndicadoresPage from '../pages/indicadoresPage'
import LoginPage from '../pages/loginPage'
import VendasPage from '../pages/vendasPage'
import { formatarNome } from '../shared/lib/formatar'
import styles from './app.module.css'

function iniciaisDoNome(nome) {
  const partes = nome.split(' ').filter(Boolean)

  if (!partes.length) {
    return 'US'
  }

  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''

  return `${primeira}${ultima}`.toUpperCase()
}

function lerUsuarioSalvo() {
  const logado = localStorage.getItem('usuarioLogado') === 'true'
  const id = Number(localStorage.getItem('usuarioId'))
  const nome = localStorage.getItem('usuarioNome') || ''

  if (!logado || !Number.isInteger(id) || id <= 0) {
    return null
  }

  return { id, nome }
}

function lerTemaInicial() {
  const salvo = localStorage.getItem('tema')

  if (salvo === 'escuro') {
    return true
  }

  if (salvo === 'claro') {
    return false
  }

  return Boolean(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches)
}

function App() {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo)

  function entrar(dados) {
    localStorage.setItem('usuarioLogado', 'true')
    localStorage.setItem('usuarioId', dados.id)
    localStorage.setItem('usuarioNome', dados.nome)
    setUsuario({ id: dados.id, nome: dados.nome })
  }

  function sair() {
    localStorage.removeItem('usuarioLogado')
    localStorage.removeItem('usuarioId')
    localStorage.removeItem('usuarioNome')
    setUsuario(null)
  }

  if (!usuario) {
    return <LoginPage aoEntrar={entrar} />
  }

  return <Painel usuario={usuario} aoSair={sair} />
}

function Painel({ usuario, aoSair }) {
  const [pagina, setPagina] = useState('estoque')
  const [escuro, setEscuro] = useState(lerTemaInicial)
  const [menuAberto, setMenuAberto] = useState(false)
  const [filtroEstoque, setFiltroEstoque] = useState('Todos')
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false)
  const notificacaoVerificada = useRef(false)

  useEffect(() => {
    localStorage.setItem('tema', escuro ? 'escuro' : 'claro')
    document.documentElement.classList.toggle('tema-escuro', escuro)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', escuro ? '#10191d' : '#f0eee4')
  }, [escuro])

  const indicadoresModel = useIndicadores(
    pagina === 'indicadores' || pagina === 'estoque',
  )
  const estoqueModel = useEstoque({ aoAtualizarIndicadores: indicadoresModel.recarregar })
  const cardapioModel = useCardapio({ avisar: estoqueModel.avisar })
  const vendasModel = useVendas({
    itens: cardapioModel.itens,
    aoAtualizarEstoque: estoqueModel.carregarEstoque,
    aoAtualizarIndicadores: indicadoresModel.recarregar,
    ativo: pagina === 'vendas',
  })

  const nomeExibido = formatarNome(usuario.nome) || 'Usuário'

  // Aviso de estoque baixo: uma vez por usuario por dia, apos o estoque carregar.
  useEffect(() => {
    if (!estoqueModel.carregado || notificacaoVerificada.current) {
      return
    }

    notificacaoVerificada.current = true

    if (!precisaNotificar(usuario.id)) {
      return
    }

    marcarNotificado(usuario.id)

    if (estoqueModel.abaixoDoLimite.length > 0) {
      setNotificacoesAbertas(true)
    }
  }, [estoqueModel.carregado, estoqueModel.abaixoDoLimite, usuario.id])

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
          className={pagina === 'indicadores' ? styles.itemAtivo : ''}
          onClick={() => navegarPara('indicadores')}
        >
          Indicadores
        </button>

        <div className={styles.perfil}>
          <span>{iniciaisDoNome(nomeExibido)}</span>
          <div>
            <b>{nomeExibido}</b>
          </div>
        </div>
        <button className={styles.botaoSair} onClick={aoSair}>
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <main className={styles.principal}>
        <header className={styles.barraSuperior}>
          <span>Controle de estoque</span>
          <div className={styles.acoesTopo}>
            <button
              className={styles.botaoNotificacao}
              type="button"
              onClick={() => setNotificacoesAbertas(true)}
              aria-label={
                estoqueModel.abaixoDoLimite.length
                  ? `Notificações: ${estoqueModel.abaixoDoLimite.length} itens abaixo do limite`
                  : 'Notificações de estoque'
              }
              aria-haspopup="dialog"
              title="Notificações de estoque"
            >
              <Bell size={18} />
              {estoqueModel.abaixoDoLimite.length > 0 && (
                <span className={styles.contadorNotificacao} aria-hidden="true">
                  {estoqueModel.abaixoDoLimite.length}
                </span>
              )}
            </button>
            <button
              className={styles.botaoTema}
              onClick={() => setEscuro(!escuro)}
              aria-label="Tema escuro"
              aria-pressed={escuro}
              title={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
            >
              {escuro ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {pagina === 'estoque' && (
          <EstoquePage
            {...estoqueModel}
            filtro={filtroEstoque}
            setFiltro={setFiltroEstoque}
            indicadores={indicadoresModel.indicadores}
            carregandoIndicadores={indicadoresModel.carregando}
            erroIndicadores={indicadoresModel.erro}
            recarregarIndicadores={indicadoresModel.recarregar}
          />
        )}
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
        {pagina === 'indicadores' && (
          <IndicadoresPage
            {...indicadoresModel}
            tema={escuro ? 'escuro' : 'claro'}
          />
        )}
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

      {vendasModel.itemModal !== null && vendasModel.linhas.some((linha) => linha.id === vendasModel.itemModal) && (
        <ModalReceita
          venda={{
            ...vendasModel.linhas.find((linha) => linha.id === vendasModel.itemModal),
            variacoes: vendasModel.variacoes[vendasModel.itemModal] || [],
          }}
          item={cardapioModel.itens.find((item) => (
            item.id === vendasModel.linhas.find((linha) => linha.id === vendasModel.itemModal)?.produtoId
          ))}
          estoque={estoqueModel.estoque}
          aoFechar={() => vendasModel.setItemModal(null)}
          aoSalvar={(variacao) => vendasModel.atualizarVariacoes(
            vendasModel.itemModal,
            [...(vendasModel.variacoes[vendasModel.itemModal] || []), variacao],
          )}
        />
      )}

      {notificacoesAbertas && (
        <NotificacoesEstoque
          itens={estoqueModel.abaixoDoLimite}
          aoFechar={() => setNotificacoesAbertas(false)}
          aoVerEstoque={() => {
            setNotificacoesAbertas(false)
            setFiltroEstoque('Abaixo do limite')
            setPagina('estoque')
          }}
          aoExportar={() => {
            if (baixarRelatorioCompras(estoqueModel.abaixoDoLimite)) {
              estoqueModel.avisar('Relatório de compras exportado.')
            }
          }}
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
