const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(mensagem, status) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
  }
}

function extrairMensagem(corpo, status) {
  if (corpo && typeof corpo === 'object') {
    return corpo.message || corpo.error || corpo.detail || `Erro ${status}`
  }

  return `Erro ${status}`
}

export async function apiFetch(caminho, opcoes = {}) {
  const headers = new Headers(opcoes.headers)
  const usuarioId = localStorage.getItem('usuarioId')

  if (usuarioId && !headers.has('Usuario-Id')) {
    headers.set('Usuario-Id', usuarioId)
  }

  const temCorpo = opcoes.body !== undefined && opcoes.body !== null
  const corpoEhFormData = opcoes.body instanceof FormData

  if (temCorpo && !corpoEhFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let resposta

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers,
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0)
  }

  if (!resposta.ok) {
    let corpo = null

    try {
      corpo = await resposta.json()
    } catch {
      corpo = null
    }

    throw new ApiError(extrairMensagem(corpo, resposta.status), resposta.status)
  }

  if (resposta.status === 204) {
    return null
  }

  const texto = await resposta.text()

  return texto ? JSON.parse(texto) : null
}
