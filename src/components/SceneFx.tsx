// 疊在場景插畫上的動畫：攪拌盆的漩渦與蒸氣、魔法缸的泡泡與光暈、食材掉進鍋裡。
// 位置用插畫上的百分比座標，跟著插畫一起縮放。
import type { CSSProperties } from 'react'
import type { SceneId } from '../api/types'
import { FoodIcon } from './ui'

/** 插畫中盆口／缸口的位置（以插畫寬高的百分比表示） */
const MOUTH: Record<SceneId, { cx: number; rim: number; w: number }> = {
  dessert_bowl: { cx: 50.6, rim: 55, w: 17 },
  cauldron: { cx: 52, rim: 47, w: 19 },
}

const SPARKLES = [
  { x: -16, y: -26, d: 0 },
  { x: 14, y: -34, d: 0.7 },
  { x: -6, y: -44, d: 1.4 },
  { x: 20, y: -16, d: 2.1 },
  { x: -20, y: -10, d: 2.8 },
]

const BUBBLES = [
  { x: -6, s: 3.4, d: 0 },
  { x: 4, s: 2.4, d: 0.5 },
  { x: -1, s: 4, d: 1.1 },
  { x: 7, s: 2.8, d: 1.6 },
  { x: -8, s: 2.2, d: 2.2 },
  { x: 2, s: 3, d: 2.7 },
]

export function SceneFx({
  scene,
  busy,
  dropId,
  dropKey,
}: {
  scene: SceneId
  busy: boolean
  /** 最後放入的元素；dropKey 改變時播放一次掉落動畫 */
  dropId: string | null
  dropKey: number
}) {
  const m = MOUTH[scene]
  const vars = { '--cx': `${m.cx}%`, '--rim': `${m.rim}%`, '--mw': `${m.w}%` } as CSSProperties

  return (
    <div className={`fx fx-${scene}${busy ? ' fx-busy' : ''}`} style={vars} aria-hidden="true">
      {scene === 'dessert_bowl' ? (
        <>
          <div className="fx-swirl">
            <span />
            <span />
          </div>
          {[0, 1, 2].map((i) => (
            <span key={i} className="fx-steam" style={{ '--i': i } as CSSProperties} />
          ))}
        </>
      ) : (
        <>
          <span className="fx-glow" />
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              className="fx-bubble"
              style={{ '--bx': `${b.x}%`, '--bs': `${b.s}%`, animationDelay: `${b.d}s` } as CSSProperties}
            />
          ))}
        </>
      )}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="fx-sparkle"
          style={{ '--sx': `${s.x}%`, '--sy': `${s.y}%`, animationDelay: `${s.d}s` } as CSSProperties}
        >
          ✦
        </span>
      ))}
      {dropId && dropKey > 0 && (
        <span key={dropKey} className="fx-drop">
          <FoodIcon id={dropId} small />
        </span>
      )}
      {dropKey > 0 && <span key={`ring-${dropKey}`} className="fx-ring" />}
    </div>
  )
}
