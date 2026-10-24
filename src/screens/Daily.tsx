import { useCallback, useEffect, useState } from 'react'
import { ApiError, type DailyStatus, type GameApi, type GrantLine, type Player } from '../api/types'
import { FoodIcon, ProtoTag, Spinner } from '../components/ui'
import { getElement } from '../data/game'
import { PROTO_MAX_STACK } from '../data/protoValues'
import { formatCountdown } from '../lib/gameDay'

export function Daily({ api, onPlayer, onClaimed }: { api: GameApi; onPlayer: (p: Player) => void; onClaimed: () => void }) {
  const [status, setStatus] = useState<DailyStatus | null>(null)
  const [justClaimed, setJustClaimed] = useState<GrantLine[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const refresh = useCallback(async () => {
    try {
      setStatus(await api.dailyStatus())
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '讀取失敗，請稍後再試。')
    }
  }, [api])

  useEffect(() => {
    let alive = true
    api
      .dailyStatus()
      .then((s) => alive && setStatus(s))
      .catch(() => alive && setError('讀取失敗，請稍後再試。'))
    return () => {
      alive = false
    }
  }, [api])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  const claim = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.claimDaily()
      onPlayer(res.player)
      setJustClaimed(res.lines)
      onClaimed()
      await refresh()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '連線失敗，請再按一次。')
    } finally {
      setBusy(false)
    }
  }

  const lines = justClaimed ?? status?.claimed ?? null
  const overflow = lines?.reduce((n, l) => n + l.overflow, 0) ?? 0

  return (
    <div className="screen with-tabs">
      <div className="screen-head">
        <h1>每日補給</h1>
      </div>
      {!status ? (
        <Spinner />
      ) : !lines ? (
        <>
          <div className={busy ? 'basket' : 'basket ready'} aria-hidden="true">
            🧺
          </div>
          <p className="center">今天的食材籃到了！裡面一定有馬鈴薯，其他打開才知道。</p>
          {error && <div className="error">{error}</div>}
          <button type="button" className="btn primary block" onClick={claim} disabled={busy}>
            {busy ? '打開中…' : '領取今日補給'}
          </button>
        </>
      ) : (
        <>
          <div className="basket" aria-hidden="true">
            {justClaimed ? '🎉' : '✅'}
          </div>
          <p className="center">{justClaimed ? '領到了！' : '今天已經領過囉。'}</p>
          <div className="grant-list">
            {lines.map((l, i) => (
              <div key={l.elementId} className="grant-item" style={{ animationDelay: `${i * 90}ms` }}>
                <FoodIcon id={l.elementId} small />
                <span>{getElement(l.elementId)?.name}</span>
                <span className="qty">×{l.quantity}</span>
              </div>
            ))}
          </div>
          {overflow > 0 && (
            <p className="note">
              <ProtoTag /> 有 {overflow} 個食材超過持有上限 {PROTO_MAX_STACK}，沒有放進庫存（處理方式暫定，D-02）。
            </p>
          )}
          <div className="card center">
            下次補給：每天台灣時間 05:00
            <br />
            <span className="muted">還有 {formatCountdown(new Date(status.nextResetAt).getTime() - now)}</span>
          </div>
        </>
      )}
    </div>
  )
}
