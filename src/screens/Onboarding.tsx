import { useState, type FormEvent } from 'react'
import { ApiError, type GameApi, type GrantLine, type Player } from '../api/types'
import { FoodIcon } from '../components/ui'
import { getElement } from '../data/game'
import { PROTO_NICKNAME_MAX } from '../data/protoValues'
import { AvatarPicker } from './Me'

export function ProfileSetup({ api, player, onDone }: { api: GameApi; player: Player; onDone: (p: Player) => void }) {
  const [nickname, setNickname] = useState(player.nickname ?? '')
  const [avatar, setAvatar] = useState<string | null>(player.avatar)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      onDone(await api.updateProfile({ nickname, avatar }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '儲存失敗，請再試一次。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="screen" onSubmit={submit} noValidate>
      <div className="screen-head">
        <h1>歡迎來到製造所！</h1>
      </div>
      <p>先取個暱稱吧，它會出現在你的收藏卡上。</p>
      <AvatarPicker value={avatar} onChange={setAvatar} />
      <div className="field">
        <label htmlFor="setup-nickname">暱稱（最多 {PROTO_NICKNAME_MAX} 字）</label>
        <input
          id="setup-nickname"
          className="input"
          value={nickname}
          maxLength={PROTO_NICKNAME_MAX}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="例：馬鈴薯主人"
        />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="spacer" />
      <button type="submit" className="btn primary block" disabled={busy || !nickname.trim()}>
        {busy ? '儲存中…' : '下一步'}
      </button>
    </form>
  )
}

export function StarterGift({ api, onDone }: { api: GameApi; onDone: (p: Player) => void }) {
  const [lines, setLines] = useState<GrantLine[] | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.grantStarter()
      setLines(res.lines)
      setPlayer(res.player)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '領取失敗，請再試一次。')
    } finally {
      setBusy(false)
    }
  }

  const total = lines?.reduce((n, l) => n + l.quantity, 0) ?? 0

  return (
    <div className="screen">
      <div className="screen-head">
        <h1>新手禮物</h1>
      </div>
      {!lines ? (
        <>
          <div className={busy ? 'basket' : 'basket ready'} aria-hidden="true">
            🎁
          </div>
          <p className="center">送你一籃食材，夠你做出第一批法鬥！</p>
          {error && <div className="error">{error}</div>}
          <div className="spacer" />
          <button type="button" className="btn primary block" onClick={open} disabled={busy}>
            {busy ? '打開中…' : '打開禮物'}
          </button>
        </>
      ) : (
        <>
          <p>
            收到 <strong>{total}</strong> 個食材：
          </p>
          <div className="grant-list">
            {lines.map((l, i) => (
              <div key={l.elementId} className="grant-item" style={{ animationDelay: `${i * 70}ms` }}>
                <FoodIcon id={l.elementId} small />
                <span>{getElement(l.elementId)?.name}</span>
                <span className="qty">×{l.quantity}</span>
              </div>
            ))}
          </div>
          <div className="spacer" />
          <button type="button" className="btn primary block" onClick={() => player && onDone(player)}>
            開始新手教學
          </button>
        </>
      )}
    </div>
  )
}
