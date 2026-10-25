import { useEffect, useRef, useState } from 'react'
import { formatar } from '../../../shared/lib/formatar'
import styles from '../../../shared/ui/formulario.module.css'

export function FormularioInsumo({ dados, aoSalvar }) {
  const [formulario, setFormulario] = useState(dados ? { ...dados } : {
    nome: '', categoria: 'Outros', unidade: 'g', saldo: 0, limite: 0, fornecedor: '', perda: 0, ativo: true,
  })
  function alterar(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }))
  }
  function enviar(evento) {
    evento.preventDefault()
    const perda = formulario.categoria === 'Bebidas' || formulario.unidade !== 'g' ? 0 : Number(formulario.perda || 0)
    const saldoBruto = Number(formulario.saldo)
    const saldoInicial = dados ? saldoBruto : saldoBruto * (1 - perda / 100)
    aoSalvar({ ...formulario, perda, saldo: saldoInicial, limite: Number(formulario.limite) })
  }
  return (
    <form className={styles.formulario} onSubmit={enviar}>
      <label>Nome do insumo<input required value={formulario.nome} onChange={(e) => alterar('nome', e.target.value)} placeholder="Ex.: Calabresa" /></label>
      <label>Categoria<select value={formulario.categoria} onChange={(e) => { alterar('categoria', e.target.value); if (e.target.value === 'Bebidas') alterar('perda', 0) }}><option>Proteínas</option><option>Laticínios</option><option>Hortifrúti</option><option>Bebidas</option><option>Secos</option><option>Outros</option></select></label>
      <label>Unidade<select value={formulario.unidade} onChange={(e) => { alterar('unidade', e.target.value); if (e.target.value !== 'g') alterar('perda', 0) }}><option value="g">Gramas (g)</option><option value="un">Unidade (un)</option></select></label>
      {!dados && <label>Saldo inicial<input type="number" min="0" value={formulario.saldo} onChange={(e) => alterar('saldo', e.target.value)} /></label>}
      <label>Estoque mínimo<input type="number" min="0" value={formulario.limite} onChange={(e) => alterar('limite', e.target.value)} /></label>
      <label>Fornecedor (opcional)<input value={formulario.fornecedor} onChange={(e) => alterar('fornecedor', e.target.value)} placeholder="Nome do fornecedor" /></label>
      {formulario.categoria !== 'Bebidas' && formulario.unidade === 'g' && <label>Perda estimada (%) · opcional<input type="number" min="0" max="100" value={formulario.perda} onChange={(e) => alterar('perda', e.target.value)} /><small>O percentual será descontado do saldo inicial e das próximas entradas.</small></label>}
      {dados && <label className={styles.caixaSelecao}><input type="checkbox" checked={formulario.ativo} onChange={(e) => alterar('ativo', e.target.checked)} /> Insumo ativo</label>}
      <button className={styles.botaoPrimario}>Salvar insumo</button>
    </form>
  )
}

export function FormularioMovimento({ estoque, aoSalvar }) {
  const [tipo, setTipo] = useState('Entrada')
  const [insumoId, setInsumoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [justificativa, setJustificativa] = useState('')
  const [busca, setBusca] = useState('')
  const [listaAberta, setListaAberta] = useState(false)
  const autocompleteRef = useRef(null)
  const selecionado = estoque.find((item) => item.id === Number(insumoId))
  const opcoes = estoque.filter((item) => item.ativo && item.nome.toLowerCase().includes(busca.toLowerCase()))

  useEffect(() => {
    function fecharAoClicarFora(evento) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(evento.target)) {
        setListaAberta(false)
      }
    }

    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

  function trocarTipo(novoTipo) {
    setTipo(novoTipo)
    setListaAberta(false)
  }

  function enviar(evento) {
    evento.preventDefault()
    if (!insumoId || Number(quantidade) <= 0) return
    aoSalvar({ tipo, insumoId: Number(insumoId), quantidade: Number(quantidade), justificativa })
  }
  return (
    <form className={styles.formulario} onSubmit={enviar}>
      <div className={styles.abasTipo}>
        {['Entrada', 'Saída'].map((opcao) => <button type="button" key={opcao} className={tipo === opcao ? styles.abaSelecionada : ''} onClick={() => trocarTipo(opcao)}>{opcao}</button>)}
      </div>
      <label>Insumo<div className={styles.autocomplete} ref={autocompleteRef}><input required value={selecionado?.nome || busca} placeholder="Digite para buscar..." onFocus={() => setListaAberta(true)} onChange={(e) => { setBusca(e.target.value); setInsumoId(''); setListaAberta(true) }} />{listaAberta && <div className={styles.sugestoes}>{opcoes.map((item) => <button type="button" key={item.id} onClick={() => { setInsumoId(String(item.id)); setBusca(''); setListaAberta(false) }}>{item.nome}<small>Saldo {formatar(item.saldo)} {item.unidade}</small></button>)}</div>}</div></label>
      <label>Quantidade<input required type="number" min="0.01" step="any" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></label>
      {tipo === 'Saída' && <label>Justificativa (opcional)<textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Descreva o motivo da saída" /></label>}
      <button className={styles.botaoPrimario}>Confirmar {tipo.toLowerCase()}</button>
    </form>
  )
}

