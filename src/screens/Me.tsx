import { useId, useState } from 'react'
import { ApiError, type GameApi, type Player, type ProtoTools } from '../api/types'
import { ProtoTag } from '../components/ui'
import { CHARACTERS } from '../data/game'
import { PROTO_NICKNAME_MAX } from '../data/protoValues'

/** 頭像：前端裁成正方形並縮成 256px（正式的大小與格式限制待 D-15） */
async function toAvatarDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('無法讀取這張圖片'))
      i.src = url
    })
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const s = Math.min(img.naturalWidth, img.naturalHeight)
    ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size)
    return canvas.toDataURL('image/webp', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function Avatar({ src }: { src: string | null }) {
  return <span className="avatar">{src ? <img src={src} alt="" /> : <span aria-hidden="true">🐶</span>}</span>
}

export function AvatarPicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const id = useId()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="row">
      <Avatar src={value} />
      <div className="stack" style={{ gap: 4 }}>
        <label htmlFor={id} className="btn small" style={{ cursor: 'pointer' }}>
          {value ? '更換頭像' : '選擇頭像'}
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            setError(null)
            try {
              onChange(await toAvatarDataUrl(file))
            } catch {
              setError('無法讀取這張圖片，請換一張試試。')
            }
          }}
        />
        {value && (
          <button type="button" className="btn ghost small" onClick={() => onChange(null)}>
            移除
          </button>
        )}
        {error && <span className="small" style={{ color: 'var(--berry)' }}>{error}</span>}
      </div>
    </div>
  )
}

export function Me({
  api,
  tools,
  player,
  onPlayer,
  onSignedOut,
  onToast,
}: {
  api: GameApi
  tools: ProtoTools
  player: Player
  onPlayer: (p: Player) => void
  onSignedOut: () => void
  onToast: (m: string) => void
}) {
  const [nickname, setNickname] = useState(player.nickname ?? '')
  const [busy, setBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const collected = Object.keys(player.collection).length

  const save = async (patch: { nickname?: string; avatar?: string | null }) => {
    setBusy(true)
    try {
      onPlayer(await api.updateProfile(patch))
      onToast('已儲存')
    } catch (e) {
      onToast(e instanceof ApiError ? e.message : '儲存失敗')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen with-tabs">
      <div className="screen-head">
        <h1>我的</h1>
      </div>

      <section className="card stack">
        <AvatarPicker value={player.avatar} onChange={(v) => save({ avatar: v })} />
        <div className="field">
          <label htmlFor="me-nickname">暱稱</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input
              id="me-nickname"
              className="input"
              value={nickname}
              maxLength={PROTO_NICKNAME_MAX}
              onChange={(e) => setNickname(e.target.value)}
            />
            <button
              type="button"
              className="btn small"
              disabled={busy || !nickname.trim() || nickname.trim() === player.nickname}
              onClick={() => save({ nickname })}
            >
              儲存
            </button>
          </div>
        </div>
        <dl className="facts">
          <dt>Email</dt>
          <dd style={{ overflowWrap: 'anywhere' }}>{player.email}</dd>
          <dt>收藏</dt>
          <dd>
            {collected} / {CHARACTERS.length} 隻（已登場）
          </dd>
        </dl>
      </section>

      <button
        type="button"
        className="btn block"
        onClick={async () => {
          await api.signOut()
          onSignedOut()
        }}
      >
        登出
      </button>

      <section className="card stack" style={{ background: 'var(--paper)' }}>
        <h2 style={{ fontSize: 'var(--step-1)' }}>
          原型工具 <ProtoTag />
        </h2>
        <p className="small muted">方便測試用，正式版不會有這些按鈕。</p>
        <button
          type="button"
          className="btn small"
          onClick={async () => {
            await tools.advanceDay()
            onToast('已跳到下一個遊戲日，可以再領補給')
            onPlayer({ ...player })
          }}
        >
          跳到明天（測試每日補給）
        </button>
        <button
          type="button"
          className="btn small"
          onClick={async () => {
            onPlayer(await tools.addEach(5))
            onToast('每種食材 +5')
          }}
        >
          每種食材 +5
        </button>
        {!confirmReset ? (
          <button type="button" className="btn small" onClick={() => setConfirmReset(true)}>
            清除所有原型資料
          </button>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            <p className="error">會刪除這台裝置上所有原型帳號與進度，確定嗎？</p>
            <div className="row">
              <button
                type="button"
                className="btn small"
                onClick={async () => {
                  await tools.resetAll()
                  onSignedOut()
                }}
              >
                確定清除
              </button>
              <button type="button" className="btn ghost small" onClick={() => setConfirmReset(false)}>
                取消
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
