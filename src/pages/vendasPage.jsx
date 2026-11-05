import { useEffect, useRef, useState } from 'react'
import { FileText, FileUp, X } from 'lucide-react'
import { formatar } from '../shared/lib/formatar'
import { unidadeDaApi } from '../shared/lib/unidades'
import styles from './vendas/style.module.css'

const rotulosStatus = {
  PREVIA: 'Prévia', PROCESSANDO: 'Processando', CONCLUIDO: 'Concluído',
  PENDENTE: 'Pendente', PROCESSADA: 'Processada', INVALIDA: 'Inválida',
}

function Vendas({ itens, lista, setLista, data, setData, itemId, setItemId, quantidade, setQuantidade,
  arquivo, setArquivo, registro, linhas, variacoes, personalizacaoIncerta, setItemModal, registros, detalhes, setDetalhes,
  erro, ocupado, mensagemStatus, confirmacaoIniciada, podeRepetir, resultados, adicionar, preparar, confirmar, consultarAtual,
  novo, verDetalhes, atualizarVariacoes, atualizarHistorico }) {
  const disponiveis = itens.filter((item) => item.ativo && item.receita?.length)
  const [buscaItem, setBuscaItem] = useState(() => {
    const selecionado = disponiveis.find((item) => String(item.id) === itemId)
    return selecionado ? `${selecionado.nome} · ${selecionado.tamanho} cm` : ''
  })
  const [listaAberta, setListaAberta] = useState(false)
  const [indiceAtivo, setIndiceAtivo] = useState(-1)
  const [confirmarDescarte, setConfirmarDescarte] = useState(false)
  const buscaRef = useRef(null)
  const modalDescarteRef = useRef(null)
  const botaoNovoRef = useRef(null)
  const sugestoes = itemId ? disponiveis : disponiveis.filter((item) => (
    item.nome.toLocaleLowerCase('pt-BR').includes(buscaItem.toLocaleLowerCase('pt-BR').trim())
  ))

  useEffect(() => {
    function fecharFora(evento) {
      if (buscaRef.current && !buscaRef.current.contains(evento.target)) {
        setListaAberta(false)
      }
    }
    document.addEventListener('mousedown', fecharFora)
    return () => document.removeEventListener('mousedown', fecharFora)
  }, [])

  useEffect(() => {
    if (!confirmarDescarte) return
    const modal = modalDescarteRef.current
    const botoes = modal.querySelectorAll('button:not(:disabled)')
    botoes[0]?.focus()
    function lidarComTeclado(evento) {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        setConfirmarDescarte(false)
      } else if (evento.key === 'Tab' && botoes.length) {
        if (evento.shiftKey && document.activeElement === botoes[0]) {
          evento.preventDefault()
          botoes[botoes.length - 1].focus()
        } else if (!evento.shiftKey && document.activeElement === botoes[botoes.length - 1]) {
          evento.preventDefault()
          botoes[0].focus()
        }
      }
    }
    document.addEventListener('keydown', lidarComTeclado)
    return () => {
      document.removeEventListener('keydown', lidarComTeclado)
      botaoNovoRef.current?.focus()
    }
  }, [confirmarDescarte])

  function selecionarItem(item) {
    setItemId(String(item.id))
    setBuscaItem(`${item.nome} · ${item.tamanho} cm`)
    setListaAberta(false)
    setIndiceAtivo(-1)
  }

  function pressionarTecla(evento) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      setListaAberta(true)
      if (!sugestoes.length) return
      setIndiceAtivo((atual) => evento.key === 'ArrowDown'
        ? Math.min(atual + 1, sugestoes.length - 1)
        : atual <= 0 ? sugestoes.length - 1 : atual - 1)
    } else if (evento.key === 'Enter' && listaAberta && indiceAtivo >= 0 && sugestoes[indiceAtivo]) {
      evento.preventDefault()
      selecionarItem(sugestoes[indiceAtivo])
    } else if (evento.key === 'Escape') {
      setListaAberta(false)
      setIndiceAtivo(-1)
    }
  }
  const pendentes = linhas.filter((linha) => linha.status === 'PENDENTE')
  const consumo = new Map()
  pendentes.forEach((linha) => (linha.consumo || []).forEach((ingrediente) => {
    const anterior = consumo.get(ingrediente.insumoId)
    consumo.set(ingrediente.insumoId, { ...ingrediente, total: (anterior?.total || 0) + Number(ingrediente.previsto || 0) })
  }))

  return (
    <section className={styles.conteudo}>
      <div className={styles.cabecalhoPagina}><div><small>OPERAÇÃO / REGISTRAR VENDAS</small><h1>Registrar vendas</h1></div></div>
      {erro && <p className={styles.erro} role="alert">{erro}</p>}
      <div className={styles.gradeVendas}>
        <div className={styles.cartao}>
          <div className={styles.tituloCartao}><div><h2>{registro ? 'Prévia do lançamento' : 'Lançar vendas'}</h2><small>{registro ? 'Confira os itens e os avisos antes de confirmar.' : 'A prévia não altera o estoque.'}</small></div></div>
          {!registro ? (
            <>
              <label className={styles.campo} htmlFor="data-vendas">Dia dos pedidos
                <input id="data-vendas" type="date" value={data} max={new Date().toLocaleDateString('en-CA')} onChange={(e) => setData(e.target.value)} disabled={ocupado} />
              </label>
              <label className={styles.arquivoTxt} htmlFor="arquivo-vendas"><FileUp size={20} aria-hidden="true" /><span><b>{arquivo ? 'Trocar arquivo TXT' : 'Importar arquivo TXT'}</b><small>Formato: ID;NOME;QUANTIDADE (máximo 1 MiB)</small></span>
                <input id="arquivo-vendas" type="file" accept=".txt,text/plain" disabled={ocupado} onChange={(e) => setArquivo(e.target.files?.[0] || null)} />
              </label>
              {arquivo && <div className={styles.arquivoSelecionado}>
                <FileText size={18} aria-hidden="true" />
                <div><small>Arquivo selecionado</small><strong>{arquivo.name}</strong></div>
                <button type="button" disabled={ocupado} onClick={() => {
                  setArquivo(null)
                  const input = document.getElementById('arquivo-vendas')
                  if (input) input.value = ''
                }}><X size={15} aria-hidden="true" /> Remover arquivo</button>
              </div>}
              <div className={styles.separadorLancamento}><span>ou adicione itens manualmente</span></div>
              <div className={styles.adicionarVenda}>
                <div className={`${styles.campo} ${styles.buscaItem}`} ref={buscaRef}>
                  <label htmlFor="item-vendido">Item do cardápio</label>
                  <input
                    id="item-vendido"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={listaAberta}
                    aria-controls="sugestoes-itens-venda"
                    aria-activedescendant={listaAberta && indiceAtivo >= 0 && sugestoes[indiceAtivo] ? `sugestao-item-${sugestoes[indiceAtivo].id}` : undefined}
                    autoComplete="off"
                    placeholder="Digite ou selecione um item"
                    value={buscaItem}
                    disabled={ocupado || Boolean(arquivo)}
                    onFocus={() => { setListaAberta(true); setIndiceAtivo(-1) }}
                    onChange={(evento) => { setBuscaItem(evento.target.value); setItemId(''); setIndiceAtivo(-1); setListaAberta(true) }}
                    onKeyDown={pressionarTecla}
                    onBlur={(evento) => {
                      if (!evento.currentTarget.parentElement.contains(evento.relatedTarget)) setListaAberta(false)
                    }}
                  />
                  {listaAberta && (
                    <div className={styles.sugestoesItens} id="sugestoes-itens-venda" role="listbox" aria-label="Itens disponíveis">
                      {sugestoes.length ? sugestoes.map((item, indice) => (
                        <button
                          type="button"
                          role="option"
                          id={`sugestao-item-${item.id}`}
                          aria-selected={String(item.id) === itemId}
                          className={indice === indiceAtivo ? styles.sugestaoAtiva : ''}
                          key={item.id}
                          onMouseDown={(evento) => evento.preventDefault()}
                          onClick={() => selecionarItem(item)}
                        >
                          {item.nome} · {item.tamanho} cm
                        </button>
                      )) : <p>Nenhum item encontrado.</p>}
                    </div>
                  )}
                </div>
                <label className={styles.campo}>Quantidade<input type="number" min="1" step="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} disabled={ocupado || Boolean(arquivo)} /></label>
                <button className={styles.botaoSecundario} type="button" onClick={adicionar} disabled={ocupado || Boolean(arquivo)}>Adicionar</button>
              </div>
              <div className={styles.itensAdicionados}>
                <h3>Itens adicionados</h3>
                <ul role="region" aria-label="Itens adicionados ao lançamento" tabIndex={0}>
                  {!lista.length && <li className={styles.itensAdicionadosVazio}>Nenhum item adicionado.</li>}
                  {lista.map((linha, indice) => {
                  const item = itens.find((produto) => produto.id === linha.produtoId)
                  return <li key={indice}>
                    <div><strong>{item?.nome || `Item ${linha.produtoId}`}</strong><span>{item?.tamanho ? `${item.tamanho} cm · ` : ''}{linha.quantidade} un.</span></div>
                    <button className={styles.botaoTexto} type="button" disabled={ocupado} aria-label={`Remover ${item?.nome || 'item'} da linha ${indice + 1}`} onClick={() => setLista((atual) => atual.filter((_, i) => i !== indice))}>Remover</button>
                  </li>
                  })}
                </ul>
              </div>
              {arquivo && lista.length > 0 && <p>O arquivo será usado no lugar da lista manual.</p>}
              <div className={styles.acoesPrevia}><button className={styles.botaoPrimario} type="button" disabled={ocupado || (!arquivo && !lista.length)} onClick={preparar}>{ocupado ? 'Preparando...' : 'Preparar prévia'}</button></div>
            </>
          ) : (
            <>
              <div className={styles.cabecalhoPrevia}>
                <div><strong>Registro #{registro.id}</strong><span>{registro.origem === 'MANUAL' ? 'Lançamento manual' : registro.origem === 'TXT' ? 'Importação TXT' : registro.origem}</span></div>
                <span className={styles.statusPrevia}>{rotulosStatus[registro.status] || registro.status}</span>
              </div>
              <h3 className={styles.tituloItensPrevia}>Itens do lançamento</h3>
              {!linhas.length && <div className={styles.vazio}>Nenhuma linha carregada. Use “Atualizar status” para tentar novamente.</div>}
              <div className={styles.itensPrevia} role="region" aria-label="Itens do lançamento" tabIndex={0}>
                {linhas.map((linha) => {
                  const resultado = resultados.find((item) => item.linhaId === linha.id)
                  return (
                    <article className={styles.itemPrevia} key={linha.id}>
                      <div className={styles.cabecalhoItemPrevia}>
                        <div><small>Linha {linha.numeroLinha}</small><h4>{linha.nome || 'Item inválido'}</h4><span>{linha.quantidade == null ? 'Quantidade não informada' : `${linha.quantidade} un.`}</span></div>
                        <span className={`${styles.statusPrevia} ${linha.status === 'INVALIDA' ? styles.statusInvalido : linha.status === 'PROCESSADA' ? styles.statusProcessado : ''}`}>
                          {rotulosStatus[linha.status] || linha.status}
                        </span>
                      </div>
                      {linha.erroMensagem && <p className={styles.alertaPrevia} role="alert">{linha.erroMensagem}</p>}
                      {resultado?.erroMensagem && resultado.erroMensagem !== linha.erroMensagem && <p className={styles.alertaPrevia} role="alert">{resultado.erroMensagem}</p>}
                      {personalizacaoIncerta[linha.id] && <div className={styles.alertaPrevia} role="alert">Alteração não confirmada. <button type="button" className={styles.botaoTexto} disabled={ocupado} onClick={() => atualizarVariacoes(linha.id, variacoes[linha.id] || [])}>Reaplicar alteração</button></div>}
                      {(variacoes[linha.id] || []).map((grupo, indice) => <div className={styles.variacaoPrevia} key={indice}><span>{grupo.quantidade} un. com ingredientes alterados</span><button type="button" className={styles.botaoTexto} disabled={ocupado || confirmacaoIniciada} onClick={() => atualizarVariacoes(linha.id, variacoes[linha.id].filter((_, i) => i !== indice))}>Remover alteração</button></div>)}
                      {(linha.consumo || []).length > 0 && (
                        <div className={styles.consumoItemPrevia}>
                          <strong>Ingredientes</strong>
                          {(linha.consumo || []).map((insumo) => <div className={styles.ingredientePrevia} key={insumo.insumoId}>
                            <div><span>{insumo.nome}</span><span>{insumo.efetivado == null ? 'Previsto' : 'Efetivado'}: <b>{formatar(insumo.efetivado == null ? insumo.previsto : insumo.efetivado)} {unidadeDaApi(insumo.unidadeMedida)}</b></span></div>
                            {insumo.aviso && <p className={styles.alertaPrevia}>{insumo.aviso}</p>}
                          </div>)}
                        </div>
                      )}
                      {linha.status === 'PENDENTE' && !confirmacaoIniciada && <button type="button" className={styles.botaoTexto} disabled={ocupado} onClick={() => setItemModal(linha.id)}>Alterar ingredientes</button>}
                    </article>
                  )
                })}
              </div>
              {resultados.filter((resultado) => resultado.erroMensagem && !linhas.some((linha) => linha.id === resultado.linhaId)).map((resultado) => <p className={styles.alertaPrevia} key={resultado.linhaId} role="alert">Linha #{resultado.linhaId}: {resultado.erroMensagem}</p>)}
              {mensagemStatus && <p className={styles.mensagemStatus} role="status">{mensagemStatus}</p>}
              <div className={styles.acoesRodape}>
                <button className={styles.botaoSecundario} type="button" disabled={ocupado} onClick={consultarAtual}>{ocupado ? 'Aguarde...' : 'Atualizar status'}</button>
                {registro.status !== 'CONCLUIDO' && <button className={styles.botaoPrimario} type="button" disabled={ocupado || Object.values(personalizacaoIncerta).some(Boolean) || (confirmacaoIniciada ? !podeRepetir : !pendentes.length)} onClick={confirmar}>{confirmacaoIniciada ? 'Repetir confirmação' : 'Confirmar e baixar estoque'}</button>}
                <button ref={botaoNovoRef} className={styles.botaoSecundario} type="button" disabled={ocupado || (confirmacaoIniciada && registro.status !== 'CONCLUIDO')} onClick={() => { if (registro.status === 'CONCLUIDO') novo(); else setConfirmarDescarte(true) }}>Novo lançamento</button>
              </div>
            </>
          )}
        </div>
        <div className={styles.cartao}><div className={styles.tituloCartao}><div><h2>Consumo previsto</h2><small>Total das linhas válidas pendentes.</small></div></div>
          {consumo.size > 0 ? <div className={styles.listaConsumo}>{[...consumo.values()].map((insumo) => <div key={insumo.insumoId}><span>{insumo.nome}</span><b>{formatar(insumo.total)} {unidadeDaApi(insumo.unidadeMedida)}</b></div>)}</div> : <div className={styles.vazio}>Nenhum consumo previsto.</div>}
          <div className={styles.avisoBaixa}>O estoque só é baixado após a confirmação. A quantidade efetivada pode ser menor se o saldo for insuficiente.</div>
        </div>
      </div>
      <div className={styles.cartao}>
        <div className={styles.cabecalhoHistorico}><div><h2>Histórico</h2><small>Registros concluídos</small></div><button type="button" className={styles.botaoSecundario} disabled={ocupado} onClick={atualizarHistorico}>Atualizar</button></div>
        {!registros.length ? <div className={styles.vazio}>Nenhum registro concluído.</div> : (
          <ul className={styles.listaHistorico}>
            {registros.map((item) => <li key={item.id}>
              <div className={styles.identificacaoHistorico}><strong>Registro #{item.id}</strong><span>{item.origem === 'MANUAL' ? 'Lançamento manual' : item.origem === 'TXT' ? 'Importação TXT' : item.origem} · {item.dataReferencia ? item.dataReferencia.split('-').reverse().join('/') : 'Data não informada'}</span></div>
              <span className={`${styles.statusPrevia} ${styles.statusProcessado}`}>{rotulosStatus[item.status] || item.status}</span>
              <button type="button" className={styles.botaoTexto} disabled={ocupado} onClick={() => verDetalhes(item)}>Detalhes</button>
            </li>)}
          </ul>
        )}
      </div>
      {confirmarDescarte && (
        <div className={styles.fundoModal} onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setConfirmarDescarte(false)
        }}>
          <div ref={modalDescarteRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-descartar-previa" aria-describedby="descricao-descartar-previa">
            <h2 id="titulo-descartar-previa">Descartar esta prévia?</h2>
            <p id="descricao-descartar-previa">Os itens e alterações desta prévia serão descartados da tela. Nenhuma baixa será realizada.</p>
            <div className={styles.acoesRodape}>
              <button className={styles.botaoSecundario} type="button" onClick={() => setConfirmarDescarte(false)}>Cancelar</button>
              <button className={styles.botaoPrimario} type="button" onClick={() => { setConfirmarDescarte(false); novo() }}>Descartar prévia</button>
            </div>
          </div>
        </div>
      )}
      {detalhes && (
        <div className={styles.fundoModal} onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) setDetalhes(null)
        }}>
          <div className={`${styles.modal} ${styles.modalDetalhes}`} role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes-registro">
            <header className={styles.cabecalhoDetalhes}>
              <button type="button" className={styles.fecharModal} onClick={() => setDetalhes(null)} aria-label="Fechar">×</button>
              <small>HISTÓRICO DE LANÇAMENTOS</small>
              <h2 id="titulo-detalhes-registro">Registro #{detalhes.id}</h2>
              <div className={styles.resumoDetalhes}>
                <span>{detalhes.origem === 'MANUAL' ? 'Lançamento manual' : detalhes.origem === 'TXT' ? 'Importação TXT' : detalhes.origem}</span>
                <span>{detalhes.dataReferencia ? detalhes.dataReferencia.split('-').reverse().join('/') : 'Data não informada'}</span>
                <span className={`${styles.statusPrevia} ${detalhes.status === 'CONCLUIDO' ? styles.statusProcessado : ''}`}>{rotulosStatus[detalhes.status] || detalhes.status}</span>
              </div>
            </header>
            <div className={styles.corpoDetalhes} tabIndex={0} role="region" aria-label="Itens do registro">
              <h3>Itens do lançamento</h3>
              {!detalhes.linhas.length && <p className={styles.vazio}>Nenhum item encontrado neste registro.</p>}
              <div className={styles.itensDetalhes}>
                {detalhes.linhas.map((linha) => (
                  <article className={styles.itemPrevia} key={linha.id}>
                    <div className={styles.cabecalhoItemPrevia}>
                      <div><small>Linha {linha.numeroLinha}</small><h4>{linha.nome || 'Item inválido'}</h4><span>{linha.quantidade == null ? 'Quantidade não informada' : `${linha.quantidade} un.`}</span></div>
                      <span className={`${styles.statusPrevia} ${linha.status === 'INVALIDA' ? styles.statusInvalido : linha.status === 'PROCESSADA' ? styles.statusProcessado : ''}`}>{rotulosStatus[linha.status] || linha.status}</span>
                    </div>
                    {linha.erroMensagem && <p className={styles.alertaPrevia}>{linha.erroMensagem}</p>}
                    {(linha.consumo || []).length > 0 && (
                      <div className={styles.consumoItemPrevia}>
                        <strong>Consumo efetivado</strong>
                        {linha.consumo.map((insumo) => (
                          <div className={styles.ingredientePrevia} key={insumo.insumoId}>
                            <div><span>{insumo.nome}</span><b>{insumo.efetivado == null ? 'Não efetivado' : `${formatar(insumo.efetivado)} ${unidadeDaApi(insumo.unidadeMedida)}`}</b></div>
                            {insumo.aviso && <p className={styles.alertaPrevia}>{insumo.aviso}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Vendas
