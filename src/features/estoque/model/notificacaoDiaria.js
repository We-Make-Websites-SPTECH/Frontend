// Controla o aviso de estoque baixo para aparecer apenas no primeiro
// acesso do usuario a cada dia, mesmo que ele saia e entre de novo.
const PREFIXO_CHAVE = 'wmw:estoque:alertaDiario:'

function chaveDoUsuario(usuarioId) {
  return `${PREFIXO_CHAVE}${usuarioId || 'anonimo'}`
}

function hojeISO() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

export function precisaNotificar(usuarioId) {
  try {
    return localStorage.getItem(chaveDoUsuario(usuarioId)) !== hojeISO()
  } catch {
    // Sem acesso ao armazenamento, evita abrir o aviso repetidamente.
    return false
  }
}

export function marcarNotificado(usuarioId) {
  try {
    localStorage.setItem(chaveDoUsuario(usuarioId), hojeISO())
  } catch {
    // Armazenamento indisponivel: o aviso pode reaparecer na proxima sessao.
  }
}
