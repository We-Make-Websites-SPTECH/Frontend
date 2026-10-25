import styles from '../app/app.module.css'

function LoginPage({ aoEntrar }) {
  function enviar(evento) {
    evento.preventDefault()
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
            required
          />
        </div>

        <div className={styles.campoLogin}>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            placeholder="Sua senha"
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
