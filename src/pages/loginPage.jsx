import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import styles from '../app/app.module.css'

const API_URL = 'http://localhost:8080'

function LoginPage({ aoEntrar }) {
  const [tela, setTela] = useState('login')
  const [mensagem, setMensagem] = useState('')

  function voltarParaLogin(mensagemDeSucesso = '') {
    setMensagem(mensagemDeSucesso)
    setTela('login')
  }

  function trocarTela(novaTela) {
    setMensagem('')
    setTela(novaTela)
  }

  return (
    <main className={styles.telaLogin}>
      <section className={styles.cartaoLogin}>
        <div className={styles.logoLogin}>Primarella</div>

        {tela !== 'recuperar' && (
          <div
            className={styles.abasLogin}
            role="tablist"
            aria-label="Acesso à conta"
          >
            <button
              className={tela === 'login' ? styles.abaLoginAtiva : ''}
              type="button"
              role="tab"
              aria-selected={tela === 'login'}
              onClick={() => trocarTela('login')}
            >
              Login
            </button>
            <button
              className={tela === 'cadastro' ? styles.abaLoginAtiva : ''}
              type="button"
              role="tab"
              aria-selected={tela === 'cadastro'}
              onClick={() => trocarTela('cadastro')}
            >
              Cadastro
            </button>
          </div>
        )}

        {tela === 'login' && (
          <FormularioLogin
            mensagem={mensagem}
            aoEntrar={aoEntrar}
            aoRecuperarSenha={() => setTela('recuperar')}
          />
        )}

        {tela === 'cadastro' && (
          <FormularioCadastro aoVoltar={voltarParaLogin} />
        )}

        {tela === 'recuperar' && (
          <FormularioRecuperacao aoVoltar={voltarParaLogin} />
        )}

        <p className={styles.rodapeLogin}>
          <Lock size={12} aria-hidden="true" />
          Acesso restrito à equipe Primarella
        </p>
      </section>
    </main>
  )
}

function CampoLogin({ id, label, icone: Icone, children }) {
  return (
    <div className={styles.campoLogin}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.entradaLogin}>
        <Icone size={17} aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

function FormularioLogin({ mensagem, aoEntrar, aoRecuperarSenha }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: senha,
        }),
      })

      if (!resposta.ok) {
        setErro('E-mail ou senha inválidos.')
        return
      }

      const usuario = await resposta.json()

      aoEntrar(usuario)
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar}>
      {mensagem && !erro && (
        <p className={styles.mensagemSucesso} role="status">
          {mensagem}
        </p>
      )}

      {erro && (
        <p className={styles.mensagemErro} role="alert">
          {erro}
        </p>
      )}

      <CampoLogin id="email" label="E-mail" icone={Mail}>
        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          required
        />
      </CampoLogin>

      <CampoLogin id="senha" label="Senha" icone={Lock}>
        <input
          id="senha"
          type={senhaVisivel ? 'text' : 'password'}
          placeholder="Sua senha"
          autoComplete="current-password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          required
        />
        <button
          className={styles.mostrarSenha}
          type="button"
          onClick={() => setSenhaVisivel(!senhaVisivel)}
          aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {senhaVisivel ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </CampoLogin>

      <button className={styles.botaoPrimario} type="submit" disabled={enviando}>
        {enviando ? 'Entrando...' : 'Entrar'}
      </button>

      <button
        className={`${styles.botaoTexto} ${styles.esqueciSenha}`}
        type="button"
        onClick={aoRecuperarSenha}
      >
        Esqueci minha senha
      </button>
    </form>
  )
}

function FormularioCadastro({ aoVoltar }) {
  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmacao: '',
  })
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  function alterar(campo, valor) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')

    if (formulario.senha !== formulario.confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    setEnviando(true)

    try {
      const resposta = await fetch(`${API_URL}/auth/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formulario.nome,
          email: formulario.email,
          senha: formulario.senha,
        }),
      })

      if (!resposta.ok) {
        setErro(
          resposta.status === 409
            ? 'Este e-mail já está cadastrado.'
            : 'Não foi possível criar a conta. Verifique os dados.',
        )
        return
      }

      aoVoltar('Conta criada com sucesso. Faça login.')
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar}>
      {erro && (
        <p className={styles.mensagemErro} role="alert">
          {erro}
        </p>
      )}

      <CampoLogin id="nome" label="Nome" icone={User}>
        <input
          id="nome"
          type="text"
          placeholder="Seu nome"
          autoComplete="name"
          maxLength={45}
          value={formulario.nome}
          onChange={(evento) => alterar('nome', evento.target.value)}
          required
        />
      </CampoLogin>

      <CampoLogin id="email-cadastro" label="E-mail" icone={Mail}>
        <input
          id="email-cadastro"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          maxLength={255}
          value={formulario.email}
          onChange={(evento) => alterar('email', evento.target.value)}
          required
        />
      </CampoLogin>

      <CampoLogin id="senha-cadastro" label="Senha" icone={Lock}>
        <input
          id="senha-cadastro"
          type={senhaVisivel ? 'text' : 'password'}
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          maxLength={64}
          value={formulario.senha}
          onChange={(evento) => alterar('senha', evento.target.value)}
          required
        />
        <button
          className={styles.mostrarSenha}
          type="button"
          onClick={() => setSenhaVisivel(!senhaVisivel)}
          aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {senhaVisivel ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </CampoLogin>

      <CampoLogin id="confirmacao-cadastro" label="Confirmar senha" icone={Lock}>
        <input
          id="confirmacao-cadastro"
          type={confirmacaoVisivel ? 'text' : 'password'}
          placeholder="Repita a senha"
          autoComplete="new-password"
          minLength={8}
          maxLength={64}
          value={formulario.confirmacao}
          onChange={(evento) => alterar('confirmacao', evento.target.value)}
          required
        />
        <button
          className={styles.mostrarSenha}
          type="button"
          onClick={() => setConfirmacaoVisivel(!confirmacaoVisivel)}
          aria-label={confirmacaoVisivel ? 'Ocultar confirmação' : 'Mostrar confirmação'}
        >
          {confirmacaoVisivel ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </CampoLogin>

      <button className={styles.botaoPrimario} type="submit" disabled={enviando}>
        {enviando ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}

function FormularioRecuperacao({ aoVoltar }) {
  const [email, setEmail] = useState('')
  const [instrucoesEnviadas, setInstrucoesEnviadas] = useState(false)

  function enviar(evento) {
    evento.preventDefault()
    setInstrucoesEnviadas(true)
  }

  if (instrucoesEnviadas) {
    return (
      <div>
        <h1>Recuperar senha</h1>
        <p className={styles.mensagemSucesso}>
          Se o e-mail existir, enviaremos as instruções de recuperação.
        </p>
        <button
          className={`${styles.botaoTexto} ${styles.voltarLogin}`}
          type="button"
          onClick={() => aoVoltar()}
        >
          Voltar para o login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar}>
      <h1>Recuperar senha</h1>
      <p className={styles.ajudaLogin}>
        Informe o e-mail cadastrado para receber as instruções.
      </p>

      <CampoLogin id="email-recuperacao" label="E-mail" icone={Mail}>
        <input
          id="email-recuperacao"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          required
        />
      </CampoLogin>

      <button className={styles.botaoPrimario} type="submit">
        Enviar instruções
      </button>

      <button
        className={`${styles.botaoTexto} ${styles.voltarLogin}`}
        type="button"
        onClick={() => aoVoltar()}
      >
        Voltar para o login
      </button>
    </form>
  )
}

export default LoginPage
