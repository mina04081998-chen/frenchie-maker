// 兩種製造場景的插圖。只影響外觀（D-07）。
import type { SceneId } from '../api/types'

const INK = '#3E3A39'
const WAKATAKE = '#B9DAA5'
const YAMABUKI = '#F6D27A'
const MIZU = '#A8D3E6'
const WASHI = '#FFFCF6'
const CORAL = '#F2A497'

function Cauldron() {
  return (
    <svg viewBox="0 0 260 170" role="img" aria-label="魔女魔法鍋">
      <g className="bubble" style={{ animationDelay: '0s' }}>
        <circle cx="96" cy="44" r="8" fill={WAKATAKE} stroke={INK} strokeWidth="3" />
      </g>
      <g className="bubble" style={{ animationDelay: '0.8s' }}>
        <circle cx="150" cy="40" r="6" fill={WAKATAKE} stroke={INK} strokeWidth="3" />
      </g>
      <g className="bubble" style={{ animationDelay: '1.6s' }}>
        <circle cx="124" cy="46" r="10" fill={WAKATAKE} stroke={INK} strokeWidth="3" />
      </g>
      <path d="M40 152 l-10 14 M220 152 l10 14" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path
        d="M30 62 C 22 120, 60 160, 130 160 C 200 160, 238 120, 230 62 Z"
        fill={CORAL}
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <ellipse cx="130" cy="62" rx="108" ry="18" fill={WAKATAKE} stroke={INK} strokeWidth="6" />
      <path d="M52 100 q 20 10 40 0" stroke={WASHI} strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="14" y="52" width="232" height="16" rx="8" fill={YAMABUKI} stroke={INK} strokeWidth="6" />
    </svg>
  )
}

function DessertBowl() {
  return (
    <svg viewBox="0 0 260 170" role="img" aria-label="甜點鋼盆">
      <path d="M176 12 L150 70" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path
        d="M150 70 C 128 64, 120 92, 138 100 C 156 108, 172 82, 150 70 Z"
        fill="none"
        stroke={INK}
        strokeWidth="4"
      />
      <path
        d="M24 70 C 30 130, 70 160, 130 160 C 190 160, 230 130, 236 70 Z"
        fill={MIZU}
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M60 96 C 70 128, 96 142, 120 146" stroke={WASHI} strokeWidth="8" fill="none" strokeLinecap="round" />
      <ellipse cx="130" cy="70" rx="112" ry="16" fill={WASHI} stroke={INK} strokeWidth="6" />
      <rect x="100" y="156" width="60" height="10" rx="5" fill={MIZU} stroke={INK} strokeWidth="5" />
    </svg>
  )
}

export function Pot({ scene }: { scene: SceneId }) {
  return scene === 'cauldron' ? <Cauldron /> : <DessertBowl />
}
