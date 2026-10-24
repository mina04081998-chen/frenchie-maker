import { useEffect, useState } from 'react'
import type { Player } from '../api/types'
import { BackButton, ProtoTag, Spinner } from '../components/ui'
import { CHARACTERS, TOTAL_DEX, formatDexNo, getCharacter, typeLabel, type Character } from '../data/game'
import { PROTO_CARD_SIZE, PROTO_LOCKED_NAME } from '../data/protoValues'
import logo from '../assets/proto/logo.webp'

export function Dex({ player, onOpen }: { player: Player; onOpen: (id: string) => void }) {
  const list = [...CHARACTERS].sort((a, b) => a.dexNo - b.dexNo)
  const count = Object.keys(player.collection).length
  return (
    <div className="screen with-tabs">
      <div className="screen-head">
        <h1>法鬥圖鑑</h1>
      </div>
      <div className="dex-progress">
        <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_DEX} aria-valuenow={count}>
          <span style={{ width: `${(count / TOTAL_DEX) * 100}%` }} />
        </div>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {count} / {TOTAL_DEX}
        </span>
      </div>
      <div className="dex-grid">
        {list.map((c) => {
          const unlocked = !!player.collection[c.id]
          return (
            <button
              key={c.id}
              type="button"
              className={unlocked ? 'dex-card' : 'dex-card locked'}
              onClick={() => onOpen(c.id)}
              aria-label={unlocked ? `No.${formatDexNo(c.dexNo)} ${c.name}` : `No.${formatDexNo(c.dexNo)} 未解鎖`}
            >
              <span className="art">
                {/* 未解鎖只用剪影；正式插畫只給已解鎖的玩家 */}
                <img src={unlocked ? c.art : c.silhouette} alt="" loading="lazy" />
              </span>
              <span className="dex-no">No.{formatDexNo(c.dexNo)}</span>
              <span className="dex-name">{unlocked ? c.name : PROTO_LOCKED_NAME}</span>
            </button>
          )
        })}
        <p className="dex-more muted small">還有 {TOTAL_DEX - CHARACTERS.length} 隻法鬥即將登場</p>
      </div>
      <p className="note">
        <ProtoTag /> 圖鑑編號為隨機暫定；角色名稱是暫名（D-31）；未解鎖顯示「？？？」（D-10 未定）。
      </p>
    </div>
  )
}

export function CharacterDetail({
  player,
  id,
  onBack,
  onShare,
}: {
  player: Player
  id: string
  onBack: () => void
  onShare: (id: string) => void
}) {
  const c = getCharacter(id)
  if (!c) return null
  const entry = player.collection[id]
  return (
    <div className="screen with-tabs">
      <div className="screen-head">
        <BackButton onClick={onBack} />
        <h1>No.{formatDexNo(c.dexNo)}</h1>
      </div>
      <div className={entry ? 'detail-art' : 'detail-art'} style={entry ? undefined : { background: 'var(--steel-wash)' }}>
        <img src={entry ? c.art : c.silhouette} alt={entry ? c.name : '未解鎖的剪影'} />
      </div>
      {entry ? (
        <>
          <div className="stack" style={{ gap: 4 }}>
            <h2 style={{ fontSize: 'var(--step-3)' }}>{c.name}</h2>
            <p className="muted">{c.description}</p>
          </div>
          <dl className="facts card">
            <dt>分類</dt>
            <dd>{typeLabel(c)}</dd>
            <dt>首次做出</dt>
            <dd>{new Date(entry.firstUnlockedAt).toLocaleDateString('zh-TW')}</dd>
            <dt>製造次數</dt>
            <dd>{entry.craftCount} 次</dd>
          </dl>
          <button type="button" className="btn primary block" onClick={() => onShare(c.id)}>
            分享這隻法鬥
          </button>
        </>
      ) : (
        <div className="card stack center">
          <h2>{PROTO_LOCKED_NAME}</h2>
          <p className="muted">還沒做出這隻法鬥。看看剪影，猜猜要用哪些顏色的食材？</p>
        </div>
      )}
    </div>
  )
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`圖片載入失敗：${src}`))
    img.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** 收藏卡：名稱、編號、暱稱、頭像、品牌 Logo（尺寸暫定 D-14） */
async function drawCard(c: Character, nickname: string, avatar: string | null): Promise<string> {
  const { width: W, height: H } = PROTO_CARD_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  await document.fonts?.ready
  const [art, brand, face] = await Promise.all([loadImage(c.art), loadImage(logo), avatar ? loadImage(avatar) : Promise.resolve(null)])

  const ink = '#2B2626'
  const display = "'Huninn', 'Chiron GoRound TC', sans-serif"
  const body = "'Chiron GoRound TC', sans-serif"

  ctx.fillStyle = '#FFF9F1'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#EFE2D0'
  for (let y = 18; y < H; y += 36) for (let x = 18; x < W; x += 36) ctx.fillRect(x, y, 3, 3)

  roundRect(ctx, 40, 40, W - 80, H - 80, 56)
  ctx.lineWidth = 10
  ctx.strokeStyle = ink
  ctx.stroke()

  // 插畫底圓
  ctx.fillStyle = '#FFE6CC'
  ctx.beginPath()
  ctx.arc(W / 2, 560, 380, 0, Math.PI * 2)
  ctx.fill()
  ctx.drawImage(art, W / 2 - 400, 160, 800, 800)

  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  ctx.font = `600 40px ${body}`
  ctx.fillText(`No.${formatDexNo(c.dexNo)}`, W / 2, 1010)
  ctx.font = `92px ${display}`
  ctx.fillText(c.name, W / 2, 1110)

  // 收藏者
  const fy = 1190
  ctx.save()
  ctx.beginPath()
  ctx.arc(150, fy + 40, 52, 0, Math.PI * 2)
  ctx.fillStyle = '#FFE6CC'
  ctx.fill()
  ctx.clip()
  if (face) ctx.drawImage(face, 98, fy - 12, 104, 104)
  ctx.restore()
  ctx.beginPath()
  ctx.arc(150, fy + 40, 52, 0, Math.PI * 2)
  ctx.lineWidth = 6
  ctx.stroke()
  ctx.textAlign = 'left'
  ctx.font = `30px ${body}`
  ctx.fillStyle = '#6E605A'
  ctx.fillText('收藏者', 222, fy + 26)
  ctx.font = `600 42px ${body}`
  ctx.fillStyle = ink
  ctx.fillText(nickname, 222, fy + 76, 420)

  const lw = 220
  const lh = (brand.naturalHeight / brand.naturalWidth) * lw
  ctx.drawImage(brand, W - 80 - lw, fy + 40 - lh / 2, lw, lh)

  return canvas.toDataURL('image/png')
}

/** 原型的插畫是 webp，轉成真正的透明 PNG 再儲存 */
async function toPng(src: string): Promise<string> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d')!.drawImage(img, 0, 0)
  return canvas.toDataURL('image/png')
}

async function saveImage(dataUrl: string, filename: string): Promise<'shared' | 'downloaded'> {
  const blob = await (await fetch(dataUrl)).blob()
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] })
    return 'shared'
  }
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
  return 'downloaded'
}

export function Share({ player, id, onBack, onToast }: { player: Player; id: string; onBack: () => void; onToast: (m: string) => void }) {
  const c = getCharacter(id)
  const [card, setCard] = useState<string | null>(null)
  const [kind, setKind] = useState<'card' | 'png'>('card')

  useEffect(() => {
    if (!c) return
    let alive = true
    drawCard(c, player.nickname ?? '', player.avatar)
      .then((url) => alive && setCard(url))
      .catch(() => alive && onToast('收藏卡產生失敗'))
    return () => {
      alive = false
    }
  }, [c, player.nickname, player.avatar, onToast])

  if (!c || !player.collection[id]) return null

  const save = async () => {
    try {
      if (kind === 'card' && card) await saveImage(card, `frenchie-${c.id}-card.png`)
      else await saveImage(await toPng(c.art), `frenchie-${c.id}.png`)
    } catch {
      onToast('無法直接儲存，請長按圖片儲存')
    }
  }

  return (
    <div className="screen with-tabs">
      <div className="screen-head">
        <BackButton onClick={onBack} />
        <h1>分享 {c.name}</h1>
      </div>
      <div className="scene-switch" role="group" aria-label="分享格式">
        <button type="button" aria-pressed={kind === 'card'} onClick={() => setKind('card')}>
          收藏卡
        </button>
        <button type="button" aria-pressed={kind === 'png'} onClick={() => setKind('png')}>
          透明 PNG
        </button>
      </div>
      {kind === 'card' ? (
        <div className="card-preview">{card ? <img src={card} alt={`${c.name} 收藏卡`} /> : <Spinner />}</div>
      ) : (
        <div className="card-preview checker">
          <img src={c.art} alt={`${c.name} 透明背景圖`} />
        </div>
      )}
      <button type="button" className="btn primary block" onClick={save} disabled={kind === 'card' && !card}>
        儲存／分享圖片
      </button>
      <p className="note">
        <ProtoTag /> 若按鈕沒有反應（例如在預覽頁裡），請長按上方圖片儲存。收藏卡尺寸暫定 1080×1350（D-14）；原型的透明 PNG 是縮小版。
      </p>
    </div>
  )
}
