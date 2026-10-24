import { useEffect, type ReactNode } from 'react'
import { getCategory, getElement } from '../data/game'

export function FoodIcon({ id, small }: { id: string; small?: boolean }) {
  const el = getElement(id)
  if (!el) return null
  const cat = getCategory(el.category)
  return (
    <span className={small ? 'food sm' : 'food'} style={{ background: cat.color }} aria-hidden="true">
      {el.emoji}
    </span>
  )
}

export function ProtoTag() {
  return <span className="proto-tag">原型</span>
}

export function BackButton({ onClick, label = '返回' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="icon-btn" onClick={onClick} aria-label={label}>
      ←
    </button>
  )
}

export function Overlay({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  useEffect(() => {
    if (!onClose) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="sheet">{children}</div>
    </div>
  )
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [message, onDone])
  if (!message) return null
  return (
    <div className="toast" role="status">
      {message}
    </div>
  )
}

export function Spinner() {
  return <div className="spinner" role="status" aria-label="讀取中" />
}

export type Tab = 'workshop' | 'dex' | 'daily' | 'me'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'workshop', label: '製造所', icon: '🍳' },
  { id: 'dex', label: '圖鑑', icon: '📖' },
  { id: 'daily', label: '補給', icon: '🧺' },
  { id: 'me', label: '我的', icon: '🐾' },
]

export function TabBar({ current, onChange, dailyReady }: { current: Tab; onChange: (t: Tab) => void; dailyReady: boolean }) {
  return (
    <nav className="tabbar" aria-label="主選單">
      <div className="tabbar-inner">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="tab"
            aria-current={current === t.id ? 'page' : undefined}
            onClick={() => onChange(t.id)}
          >
            <span className="tab-icon" aria-hidden="true">
              {t.icon}
            </span>
            {t.label}
            {t.id === 'daily' && dailyReady && <span className="dot" aria-label="今日補給可領取" />}
          </button>
        ))}
      </div>
    </nav>
  )
}
