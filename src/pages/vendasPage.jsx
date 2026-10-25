import { ClipboardList, FileUp } from 'lucide-react'
import { formatar } from '../shared/lib/formatar'
import styles from './vendas/style.module.css'

function Vendas({
  itens,
  estoque,
  registros,
  lista,
  setLista,
  data,
  setData,
  consumo,
  importarArquivo,
  arquivo,
  erroArquivo,
  adicionar,
  confirmar,
  estornar,
  itemModal,
  setItemModal,
  registroSelecionado,
  setRegistroSelecionado,
  confirmarEstorno,
  setConfirmarEstorno,
  itemId,
  setItemId,
  quantidade,
  setQuantidade,
  removerVariacao,
}) {
  const itensAtivos = itens.filter((item) => item.ativo && item.receita.length)

  function removerVenda(indiceRemovido) {
    setLista((atual) => atual.filter((_, indice) => indice !== indiceRemovido))
  }

  function fecharModalAoClicarNoFundo(evento, acaoFechar) {
    if (evento.target === evento.currentTarget) {
      acaoFechar()
    }
  }

  return (
    <section className={styles.conteudo}>
      <div className={styles.cabecalhoPagina}>
        <div>
          <small>OPERAÇÃO / REGISTRAR VENDAS</small>
          <h1>Registrar vendas</h1>
        </div>
      </div>

      <div className={styles.gradeVendas}>
        <div className={styles.cartao}>
          <div className={styles.tituloCartao}>
            <div>
              <h2>Lançar vendas</h2>
              <small>Adicione os itens vendidos neste dia.</small>
            </div>
          </div>

          <label className={styles.campo} htmlFor="data-vendas">
            Dia dos pedidos
            <input
              id="data-vendas"
              type="date"
              value={data}
              max={new Date().toLocaleDateString('en-CA')}
              onChange={(evento) => setData(evento.target.value)}
            />
          </label>

          <label className={styles.arquivoTxt} htmlFor="arquivo-vendas">
            <FileUp size={20} />
            <span>
              <b>Importar arquivo .TXT</b>
              <small>{arquivo || 'Formato: ID; NOME; QUANTIDADE'}</small>
            </span>
            <input
              id="arquivo-vendas"
              type="file"
              accept=".txt,text/plain"
              onChange={importarArquivo}
            />
          </label>
          {erroArquivo && <p className={styles.erro}>{erroArquivo}</p>}

          <div className={styles.adicionarVenda}>
            <label className={styles.campo} htmlFor="item-vendido">
              Item do cardápio
              <select
                id="item-vendido"
                value={itemId || String(itensAtivos[0]?.id || '')}
                onChange={(evento) => setItemId(evento.target.value)}
              >
                {itensAtivos.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.nome} · {item.tamanho} cm
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.campo} htmlFor="quantidade-vendida">
              Quantidade
              <input
                id="quantidade-vendida"
                type="number"
                min="1"
                step="1"
                value={quantidade}
                onChange={(evento) => setQuantidade(evento.target.value)}
              />
            </label>

            <button
              className={styles.botaoSecundario}
              type="button"
              onClick={() => adicionar(itemId, quantidade)}
            >
              Adicionar
            </button>
          </div>

          <TabelaVendas
            itens={itens}
            estoque={estoque}
            lista={lista}
            removerVenda={removerVenda}
            removerVariacao={removerVariacao}
            abrirAlteracao={setItemModal}
          />

          <div className={styles.acoesRodape}>
            <button
              className={styles.botaoSecundario}
              type="button"
              onClick={() => setLista([])}
              disabled={!lista.length}
            >
              Limpar lista
            </button>
            <button
              className={styles.botaoPrimario}
              type="button"
              onClick={confirmar}
              disabled={!lista.length}
            >
              Confirmar e baixar estoque
            </button>
          </div>
        </div>

        <ResumoConsumo consumo={consumo} estoque={estoque} />
      </div>

      <RegistrosRecentes
        registros={registros}
        itens={itens}
        estoque={estoque}
        aoVerDetalhes={setRegistroSelecionado}
        aoSolicitarEstorno={setConfirmarEstorno}
      />

      {confirmarEstorno && (
        <div
          className={styles.fundoModal}
          onMouseDown={(evento) => fecharModalAoClicarNoFundo(
            evento,
            () => setConfirmarEstorno(null),
          )}
        >
          <div className={styles.modal}>
            <button
              className={styles.fecharModal}
              type="button"
              onClick={() => setConfirmarEstorno(null)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2>Estornar registro?</h2>
            <p>O estoque consumido por este registro será restaurado.</p>
            <div className={styles.acoesRodape}>
              <button
                className={styles.botaoSecundario}
                type="button"
                onClick={() => setConfirmarEstorno(null)}
              >
                Cancelar
              </button>
              <button
                className={styles.botaoPrimario}
                type="button"
                onClick={() => {
                  estornar(confirmarEstorno)
                  setConfirmarEstorno(null)
                }}
              >
                Confirmar estorno
              </button>
            </div>
          </div>
        </div>
      )}

      {registroSelecionado && (
        <DetalhesRegistro
          registro={registroSelecionado}
          itens={itens}
          estoque={estoque}
          aoFechar={() => setRegistroSelecionado(null)}
          aoClicarNoFundo={fecharModalAoClicarNoFundo}
        />
      )}
    </section>
  )
}

function TabelaVendas({ itens, estoque, lista, removerVenda,removerVariacao, abrirAlteracao }) {
  if (!lista.length) {
    return <div className={styles.vazio}>Adicione um item para começar.</div>
  }

  return (
    <div className={styles.tabelaResponsiva}>
      <table>
        <thead>
          <tr>
            <th>ITEM</th>
            <th>QUANTIDADE</th>
            <th>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((venda, indice) => {
            const item = itens.find((produto) => produto.id === venda.itemId)

            return (
              <tr key={venda.itemId}>
                <td>
                  <b>{item?.nome}</b>
                  <small>{item?.tamanho} cm · {item?.tipo}</small>
                    {(venda.variacoes || []).map((variacao, posicao) => (
                      <div className={styles.badgeVariacao} key={posicao}>
                        <span>{descricaoVariacao(variacao, item, estoque)}</span>

                        <button
                          type="button"
                          aria-label="Remover alteração de ingredientes"
                          onClick={() => removerVariacao(indice, posicao)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </td>
                <td>{venda.quantidade}</td>
                <td className={styles.acoesItem}>
                  <button
                    className={styles.botaoTexto}
                    type="button"
                    onClick={() => abrirAlteracao(indice)}
                  >
                    Alterar
                  </button>
                  <button
                    className={styles.botaoTexto}
                    type="button"
                    onClick={() => removerVenda(indice)}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ResumoConsumo({ consumo, estoque }) {
  const consumos = Object.entries(consumo)

  return (
    <div className={styles.cartao}>
      <div className={styles.tituloCartao}>
        <div>
          <h2>Consumo previsto</h2>
          <small>Ingredientes necessários para os itens acima.</small>
        </div>
      </div>

      {consumos.length > 0 ? (
        <div className={styles.listaConsumo}>
          {consumos.map(([id, valor]) => {
            const insumo = estoque.find((item) => item.id === Number(id))

            return (
              <div key={id}>
                <span>{insumo?.nome || 'Insumo'}</span>
                <b>− {formatar(valor)} {insumo?.unidade}</b>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.vazio}>
          O consumo aparecerá aqui após adicionar as vendas.
        </div>
      )}

      <div className={styles.avisoBaixa}>
        A quantidade é calculada com base na receita cadastrada no cardápio.
      </div>
    </div>
  )
}

function RegistrosRecentes({ registros, itens, estoque, aoVerDetalhes, aoSolicitarEstorno }) {
  return (
    <div className={styles.cartao}>
      <div className={styles.tituloCartao}>
        <div>
          <h2>Registros recentes</h2>
          <small>{registros.length} registros</small>
        </div>
      </div>

      {registros.length > 0 ? (
        <div className={styles.tabelaResponsiva}>
          <table>
            <thead>
              <tr>
                <th>REGISTRO</th>
                <th>DIA</th>
                <th>ITENS</th>
                <th>STATUS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id}>
                  <td>#{registro.id}</td>
                  <td>{formatarData(registro.data)}</td>
                  <td>{registro.itens?.length || 0}</td>
                  <td>{registro.status}</td>
                  <td>
                    <button
                      className={styles.botaoTexto}
                      type="button"
                      onClick={() => aoVerDetalhes(registro)}
                    >
                      Detalhes
                    </button>
                    {registro.status !== 'Estornada' && (
                      <button
                        className={styles.botaoTexto}
                        type="button"
                        onClick={() => aoSolicitarEstorno(registro)}
                      >
                        Estornar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.vazio}>
          <ClipboardList size={22} />
          <span>Nenhum registro ainda. As vendas confirmadas ficarão disponíveis aqui.</span>
        </div>
      )}
    </div>
  )
}

function DetalhesRegistro({ registro, itens, estoque, aoFechar, aoClicarNoFundo }) {
  return (
    <div
      className={styles.fundoModal}
      onMouseDown={(evento) => aoClicarNoFundo(evento, aoFechar)}
    >
      <div className={styles.modal}>
        <button
          className={styles.fecharModal}
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2>Registro de venda</h2>
        <p>Data: {formatarData(registro.data)}</p>
        <p>Status: {registro.status}</p>

        {registro.itens?.map((venda, indice) => {
          const item = itens.find((produto) => produto.id === venda.itemId)
          return (
            <p key={`${venda.itemId}-${indice}`}>
              {item?.nome} · {venda.quantidade} unidade(s)
            </p>
          )
        })}

        <h3>Baixa de estoque</h3>
        {Object.entries(registro.consumo || {}).map(([id, valor]) => {
          const insumo = estoque.find((item) => item.id === Number(id))
          return <p key={id}>{insumo?.nome}: {formatar(valor)}</p>
        })}
      </div>
    </div>
  )
}

function formatarData(data) {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')
}

function descricaoVariacao(variacao, item, estoque) {
  const receitaBase = item?.receita || []
  const ingredientesAlterados = variacao.receita || []
  const partes = []

  receitaBase.forEach((ingredienteBase) => {
    const ingredienteAtual = ingredientesAlterados.find((ingrediente) => (
      ingrediente.insumoId === ingredienteBase.insumoId
    ))
    const insumo = estoque.find((produto) => (
      produto.id === ingredienteBase.insumoId
    ))
    const quantidadeAtual = Number(ingredienteAtual?.quantidade || 0)
    const diferenca = quantidadeAtual - Number(ingredienteBase.quantidade)
    const nomeInsumo = insumo?.nome?.toLowerCase() || 'ingrediente'

    if (quantidadeAtual === 0) {
      partes.push(`sem ${nomeInsumo}`)
    } else if (diferenca > 0) {
      partes.push(
        `mais ${formatar(diferenca)} ${insumo?.unidade || ''} de ${nomeInsumo}`,
      )
    } else if (diferenca < 0) {
      partes.push(
        `menos ${formatar(Math.abs(diferenca))} ${insumo?.unidade || ''} de ${nomeInsumo}`,
      )
    }
  })

  ingredientesAlterados.forEach((ingredienteAtual) => {
    const jaExistia = receitaBase.some((ingrediente) => (
      ingrediente.insumoId === ingredienteAtual.insumoId
    ))

    if (!jaExistia && Number(ingredienteAtual.quantidade) > 0) {
      const insumo = estoque.find((produto) => (
        produto.id === ingredienteAtual.insumoId
      ))
      const nomeInsumo = insumo?.nome?.toLowerCase() || 'ingrediente'
      partes.push(
        `com ${formatar(ingredienteAtual.quantidade)} ${insumo?.unidade || ''} de ${nomeInsumo}`,
      )
    }
  })

  return `${variacao.quantidade} un. ${partes.join(', ') || 'com receita alterada'}`
}

export default Vendas
