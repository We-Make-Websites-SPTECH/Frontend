import styles from '../app/app.module.css'
import { useState } from 'react'

function LoginPage({ aoEntrar }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  async function enviar(evento) {
    evento.preventDefault()

    const resposta = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        senha: senha
      })
    })

    if(!resposta.ok) {
      alert('E-mail ou senha inválidos')
      return
    }

    localStorage.setItem('usuarioLogado', 'true')
    aoEntrar()
  }

  return (
    <main className={styles.telaLogin}>
      <form className={styles.cartaoLogin} onSubmit={enviar}>
        <div className={styles.logoLogin}>Primarella</div>
        <h1>Entrar</h1>
        <div className={styles.campoLogin}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />
        </div>

        <div className={styles.campoLogin}>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />
        </div>

        <button className={styles.botaoPrimario} type="submit">
          Entrar
        </button>
        <p>Acesso demonstrativo: informe qualquer e-mail e senha.</p>
      </form>
    </main>
  )
}

export default LoginPage
