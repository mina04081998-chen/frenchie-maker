import { useMemo, useState } from 'react'
import { ApiError, type CraftResult, type Inventory, type SceneId } from '../api/types'
import { FoodIcon, Overlay, ProtoTag } from '../components/ui'
import { Pot } from '../components/Pot'
import { ACTIVE_ELEMENTS, CATEGORIES, formatDexNo, getCategory, getCharacter, getElement } from '../data/game'
import { PROTO_MAX_INPUTS } from '../data/protoValues'
import { TUTORIAL_STEPS } from '../data/tutorial'
import { slotAccepts } from '../lib/recipe'

type Mode = 'play' | 'tutorial' | 'trial'

interface Props {
  mode: Mode
  inventory: Inventory
  onCraft?: (requestId: string, inputs: string[], scene: SceneId) => Promise<CraftResult>
  onOpenCharacter?: (id: string) => void
  onTutorialDone?: () => void
  onTrialSignUp?: () => void
  onExitTrial?: () => void
}

const SCENES: { id: SceneId; label: string }[] = [
  { id: 'cauldron', label: '魔女魔法鍋' },
  { id: 'dessert_bowl', label: '甜點鋼盆' },
]

/** 依色系排列食材 */
const PANTRY_ORDER = CATEGORIES.flatMap((c) => ACTIVE_ELEMENTS.filter((e) => e.category === c.id))

const newRequestId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

type Outcome = { kind: 'craft'; result: CraftResult } | { kind: 'trial'; inputs: string[] }

export function Workshop({ mode, inventory, onCraft, onOpenCharacter, onTutorialDone, onTrialSignUp, onExitTrial }: Props) {
  const [scene, setScene] = useState<SceneId>('cauldron')
  const [seq, setSeq] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  // 同一次製造重試時沿用同一個 requestId（防重複扣料）
  const [pendingId, setPendingId] = useState<string | null>(null)

  const maxInputs = mode === 'tutorial' ? TUTORIAL_STEPS.length : PROTO_MAX_INPUTS
  const tutorialStep = mode === 'tutorial' ? TUTORIAL_STEPS[seq.length] : undefined

  const remaining = useMemo(() => {
    const left: Inventory = { ...inventory }
    for (const id of seq) left[id] = (left[id] ?? 0) - 1
    return left
  }, [inventory, seq])

  const canAdd = (id: string) => {
    if (busy || seq.length >= maxInputs) return false
    if (mode === 'trial') return true
    if ((remaining[id] ?? 0) <= 0) return false
    if (mode === 'tutorial') return !!tutorialStep && slotAccepts(tutorialStep.slot, id)
    return true
  }

  const add = (id: string) => {
    if (!canAdd(id)) return
    setError(null)
    setPendingId(null)
    setSeq((s) => [...s, id])
  }

  const undo = () => {
    setPendingId(null)
    setSeq((s) => s.slice(0, -1))
  }

  const clear = () => {
    setPendingId(null)
    setSeq([])
  }

  const craftReady = seq.length > 0 && !busy && (mode !== 'tutorial' || seq.length === TUTORIAL_STEPS.length)

  const craft = async () => {
    if (!craftReady) return
    setBusy(true)
    setError(null)
    try {
      if (mode === 'trial') {
        await new Promise((r) => setTimeout(r, 1100))
        setOutcome({ kind: 'trial', inputs: seq })
      } else if (onCraft) {
        const requestId = pendingId ?? newRequestId()
        setPendingId(requestId)
        const result = await onCraft(requestId, seq, scene)
        setOutcome({ kind: 'craft', result })
        setPendingId(null)
      }
      setSeq([])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '連線失敗，請再按一次「開始製造」。')
    } finally {
      setBusy(false)
    }
  }

  const closeOutcome = () => {
    const wasTutorialSuccess = mode === 'tutorial' && outcome?.kind === 'craft' && outcome.result.success
    setOutcome(null)
    if (wasTutorialSuccess) onTutorialDone?.()
  }

  return (
    <div className={mode === 'play' ? 'screen with-tabs' : 'screen'}>
      <div className="screen-head">
        <h1>{mode === 'tutorial' ? '新手教學' : mode === 'trial' ? '試玩製造所' : '法鬥製造所'}</h1>
        {mode === 'trial' && (
          <button type="button" className="btn small" onClick={onExitTrial}>
            離開試玩
          </button>
        )}
      </div>

      {mode === 'trial' && (
        <div className="trial-banner">
          <span aria-hidden="true">🌱</span>
          <span>試玩模式：食材無限，但不會做出正式法鬥，關掉網頁就會重置。</span>
        </div>
      )}

      {mode === 'tutorial' && (
        <div className="coach" aria-live="polite">
          <span className="coach-step">
            {Math.min(seq.length + 1, TUTORIAL_STEPS.length)} / {TUTORIAL_STEPS.length}
          </span>
          <p>{tutorialStep ? tutorialStep.text : '全部放好了！按下「開始製造」吧。'}</p>
        </div>
      )}

      <div className="scene-switch" role="group" aria-label="選擇場景">
        {SCENES.map((s) => (
          <button key={s.id} type="button" aria-pressed={scene === s.id} onClick={() => setScene(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className={`stage ${scene}${busy ? ' stirring' : ''}`}>
        <div className="pot-items" aria-label="已投入的食材">
          {seq.map((id, i) => (
            <FoodIcon key={`${id}-${i}`} id={id} small />
          ))}
        </div>
        <Pot scene={scene} />
      </div>

      <div className="seq-bar">
        <span className="seq-count">
          已投入 {seq.length} / {maxInputs}
          {seq.length > 0 && `：${seq.map((id) => getElement(id)?.name).join('→')}`}
        </span>
        <span className="spacer" />
        <button type="button" className="btn small" onClick={undo} disabled={!seq.length || busy}>
          收回
        </button>
        {mode !== 'tutorial' && (
          <button type="button" className="btn small" onClick={clear} disabled={!seq.length || busy}>
            清空
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <button type="button" className="btn primary block" onClick={craft} disabled={!craftReady}>
        {busy ? '攪拌中…' : '開始製造'}
      </button>

      <section className="pantry" aria-label="食材">
        <p className="pantry-legend small muted">
          圓圈顏色＝食材色系：
          {CATEGORIES.filter((c) => ACTIVE_ELEMENTS.some((e) => e.category === c.id)).map((c) => (
            <span key={c.id} className="legend-item">
              <span className="swatch" style={{ background: c.color }} />
              {c.name.replace('色系', '')}
            </span>
          ))}
        </p>
        <div className="pantry-items">
          {PANTRY_ORDER.map((e) => {
            const hinted = mode === 'tutorial' && !!tutorialStep && slotAccepts(tutorialStep.slot, e.id)
            return (
              <button
                key={e.id}
                type="button"
                className={hinted ? 'pantry-btn hint' : 'pantry-btn'}
                onClick={() => add(e.id)}
                disabled={!canAdd(e.id)}
                aria-label={`${e.name}（${getCategory(e.category).name}）`}
              >
                <FoodIcon id={e.id} small />
                <span className="stack" style={{ gap: 0 }}>
                  <span className="name">{e.name}</span>
                  <span className="count">{mode === 'trial' ? '∞' : Math.max(0, remaining[e.id] ?? 0)}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {mode === 'play' && (
        <p className="note">
          <ProtoTag /> 一次最多投入 {PROTO_MAX_INPUTS} 個（暫定，D-08）。成功或失敗，投入的食材都會用掉。
        </p>
      )}

      {outcome?.kind === 'craft' && (
        <CraftOutcome
          result={outcome.result}
          tutorial={mode === 'tutorial'}
          onClose={closeOutcome}
          onOpenCharacter={(id) => {
            setOutcome(null)
            onOpenCharacter?.(id)
          }}
        />
      )}

      {outcome?.kind === 'trial' && (
        <Overlay onClose={() => setOutcome(null)}>
          <div className="smoke" aria-hidden="true">
            ✨
          </div>
          <h2 className="center">鍋子冒出了香香的煙！</h2>
          <p className="center muted">試玩中不會真的做出法鬥。註冊並登入後，就能用真正的食材製造、收進圖鑑。</p>
          <button type="button" className="btn primary block" onClick={onTrialSignUp}>
            註冊開始收集
          </button>
          <button type="button" className="btn block" onClick={() => setOutcome(null)}>
            繼續試玩
          </button>
        </Overlay>
      )}
    </div>
  )
}

function CraftOutcome({
  result,
  tutorial,
  onClose,
  onOpenCharacter,
}: {
  result: CraftResult
  tutorial: boolean
  onClose: () => void
  onOpenCharacter: (id: string) => void
}) {
  const ch = result.characterId ? getCharacter(result.characterId) : undefined
  if (result.success && ch) {
    return (
      <Overlay onClose={tutorial ? undefined : onClose}>
        <div className="center">
          {result.isNew ? <span className="badge-new">新法鬥登場！</span> : <span className="chip">已收藏・第 {result.craftCount} 次做出</span>}
        </div>
        <div className="reveal">
          <img src={ch.art} alt={ch.name} />
        </div>
        <div className="center stack" style={{ gap: 2 }}>
          <span className="dex-no">No.{formatDexNo(ch.dexNo)}</span>
          <h2>{ch.name}</h2>
        </div>
        {tutorial ? (
          <>
            <p className="center muted">教學完成！剩下的食材可以自由試試看其他配方。</p>
            <button type="button" className="btn primary block" onClick={onClose}>
              開始冒險
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn primary block" onClick={() => onOpenCharacter(ch.id)}>
              看看圖鑑
            </button>
            <button type="button" className="btn block" onClick={onClose}>
              繼續製造
            </button>
          </>
        )}
      </Overlay>
    )
  }
  return (
    <Overlay onClose={onClose}>
      <div className="smoke" aria-hidden="true">
        💨
      </div>
      <h2 className="center">沒有成功……</h2>
      <p className="center">{result.hint}</p>
      <div className="stack" style={{ gap: 6 }}>
        <span className="small muted">用掉的食材</span>
        <div className="consumed">
          {result.consumed.map((id, i) => (
            <FoodIcon key={`${id}-${i}`} id={id} small />
          ))}
        </div>
      </div>
      <p className="note">
        <ProtoTag /> 失敗提示是暫定文字（D-11）。
      </p>
      <button type="button" className="btn primary block" onClick={onClose}>
        再試一次
      </button>
    </Overlay>
  )
}
