import { useState, type FormEvent } from 'react'
import { ApiError, type GameApi, type Player } from '../api/types'
import { BackButton } from '../components/ui'
import { CHARACTERS } from '../data/game'
import logo from '../assets/proto/logo.webp'

const protoNotice = '原型：帳號只存在這台裝置的瀏覽器，請不要使用真實密碼。'

function useSubmit() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '連線失敗，請稍後再試。')
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, run }
}

export function Welcome({ onLogin, onSignUp, onTrial }: { onLogin: () => void; onSignUp: () => void; onTrial: () => void }) {
  return (
    <div className="screen">
      <div className="welcome-hero">
        <img className="logo" src={logo} alt="法鬥好朋友" />
        <h1 className="welcome-title">法鬥製造所</h1>
        <p className="muted center">把食材依順序放進鍋子，做出一隻隻法鬥，收集到圖鑑裡。</p>
        {/* 未登入只能看剪影（D-12） */}
        <div className="silhouettes" aria-hidden="true">
          {CHARACTERS.slice(0, 4).map((c) => (
            <img key={c.id} src={c.silhouette} alt="" />
          ))}
        </div>
      </div>
      <div className="spacer" />
      <div className="stack">
        <button type="button" className="btn primary block" onClick={onSignUp}>
          註冊開始收集
        </button>
        <button type="button" className="btn block" onClick={onLogin}>
          登入
        </button>
        <button type="button" className="btn ghost block" onClick={onTrial}>
          先以訪客試玩看看
        </button>
      </div>
    </div>
  )
}

export function SignIn({
  api,
  onBack,
  onDone,
  onForgot,
  onSignUp,
}: {
  api: GameApi
  onBack: () => void
  onDone: (p: Player) => void
  onForgot: () => void
  onSignUp: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useSubmit()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    run(async () => onDone(await api.signIn(email, password)))
  }
  return (
    <form className="screen" onSubmit={submit} noValidate>
      <div className="screen-head">
        <BackButton onClick={onBack} />
        <h1>登入</h1>
      </div>
      <p className="note">{protoNotice}</p>
      <div className="field">
        <label htmlFor="signin-email">Email</label>
        <input id="signin-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="signin-password">密碼</label>
        <input
          id="signin-password"
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" className="btn primary block" disabled={busy}>
        {busy ? '登入中…' : '登入'}
      </button>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn ghost" onClick={onForgot}>
          忘記密碼
        </button>
        <button type="button" className="btn ghost" onClick={onSignUp}>
          還沒有帳號？註冊
        </button>
      </div>
    </form>
  )
}

export function SignUp({ api, onBack, onDone }: { api: GameApi; onBack: () => void; onDone: (p: Player) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useSubmit()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    run(async () => onDone(await api.signUp(email, password)))
  }
  return (
    <form className="screen" onSubmit={submit} noValidate>
      <div className="screen-head">
        <BackButton onClick={onBack} />
        <h1>註冊</h1>
      </div>
      <p className="note">{protoNotice} 正式版是否需要 Email 驗證信待決定（D-19）。</p>
      <div className="field">
        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="signup-password">密碼（至少 6 個字元）</label>
        <input
          id="signup-password"
          className="input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" className="btn primary block" disabled={busy}>
        {busy ? '建立中…' : '建立帳號'}
      </button>
    </form>
  )
}

export function ForgotPassword({ api, onBack }: { api: GameApi; onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState<'ask' | 'sent' | 'reset' | 'done'>('ask')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useSubmit()

  const send = (e: FormEvent) => {
    e.preventDefault()
    run(async () => {
      await api.requestPasswordReset(email)
      setStage('sent')
    })
  }
  const reset = (e: FormEvent) => {
    e.preventDefault()
    run(async () => {
      await api.resetPassword(email, password)
      setStage('done')
    })
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <BackButton onClick={onBack} />
        <h1>重設密碼</h1>
      </div>
      {stage === 'ask' && (
        <form className="stack" onSubmit={send} noValidate>
          <p>輸入註冊時的 Email，我們會寄一封重設密碼的信給你。</p>
          <div className="field">
            <label htmlFor="forgot-email">Email</label>
            <input id="forgot-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn primary block" disabled={busy}>
            {busy ? '寄送中…' : '寄出重設信'}
          </button>
        </form>
      )}
      {stage === 'sent' && (
        <div className="stack">
          <div className="card stack">
            <h2>請到信箱收信</h2>
            <p>如果 {email} 有註冊過，幾分鐘內會收到重設密碼的信，點信中的連結即可設定新密碼。</p>
          </div>
          <p className="note">原型沒有真的寄信。按下面的按鈕，模擬「點了信中的連結」。</p>
          <button type="button" className="btn block" onClick={() => setStage('reset')}>
            模擬點擊信中連結
          </button>
        </div>
      )}
      {stage === 'reset' && (
        <form className="stack" onSubmit={reset} noValidate>
          <div className="field">
            <label htmlFor="reset-password">新密碼（至少 6 個字元）</label>
            <input
              id="reset-password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn primary block" disabled={busy}>
            {busy ? '儲存中…' : '設定新密碼'}
          </button>
        </form>
      )}
      {stage === 'done' && (
        <div className="stack">
          <div className="card">密碼已更新，請用新密碼登入。</div>
          <button type="button" className="btn primary block" onClick={onBack}>
            回到登入
          </button>
        </div>
      )}
    </div>
  )
}
