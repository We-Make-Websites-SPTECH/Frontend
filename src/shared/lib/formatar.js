const particulasNome = ['de', 'da', 'do', 'das', 'dos', 'e']

export function formatar(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export function formatarNome(nome) {
  const partes = String(nome || '')
    .trim()
    .split(/\s+/)
    .filter((parte) => parte && !particulasNome.includes(parte.toLowerCase()))

  return partes.slice(0, 2).join(' ')
}
