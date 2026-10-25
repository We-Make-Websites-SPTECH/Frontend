export function formatar(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}
