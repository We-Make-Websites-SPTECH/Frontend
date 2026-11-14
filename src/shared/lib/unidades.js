// O backend usa GRAMA/UNIDADE em receitas, importações e indicadores,
// mas /insumo expõe g/un. O front trabalha sempre com g/un.
const UNIDADES_DA_API = {
  GRAMA: 'g',
  UNIDADE: 'un',
}

const UNIDADES_PARA_API = {
  g: 'GRAMA',
  un: 'UNIDADE',
}

export function unidadeDaApi(unidade) {
  if (!unidade) {
    return ''
  }

  return UNIDADES_DA_API[unidade] || unidade
}

export function unidadeParaApi(unidade) {
  if (!unidade) {
    return ''
  }

  return UNIDADES_PARA_API[unidade] || unidade
}

export function rotuloUnidade(unidade) {
  return unidadeDaApi(unidade) || ''
}
