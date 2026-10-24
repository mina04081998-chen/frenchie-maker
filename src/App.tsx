import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { mockApi } from './api/mockApi'
import type { Player } from './api/types'
import { Spinner, TabBar, Toast, type Tab } from './components/ui'
import { ForgotPassword, SignIn, SignUp, Welcome } from './screens/Auth'
import { Daily } from './screens/Daily'
import { CharacterDetail, Dex, Share } from './screens/Dex'
import { Me } from './screens/Me'
import { ProfileSetup, StarterGift } from './screens/Onboarding'
import { Workshop } from './screens/Workshop'

// Phase 1 使用假伺服器；Phase 2 換成 Supabase 實作的同一介面
const api = mockApi
const tools = mockApi

type Route =
  | { name: 'welcome' }
  | { name: 'signIn' }
  | { name: 'signUp' }
  | { name: 'forgot' }
  | { name: 'trial' }
  | { name: 'profileSetup' }
  | { name: 'starter' }
  | { name: 'tutorial' }
  | { name: 'main' }
  | { name: 'detail'; id: string }
  | { name: 'share'; id: string }

/** 登入後依進度決定下一步：暱稱 → 新手禮物 → 新手教學 → 主畫面 */
function routeFor(p: Player): Route {
  if (!p.nickname) return { name: 'profileSetup' }
  if (!p.starterGrantedAt) return { name: 'starter' }
  if (!p.tutorialDoneAt) return { name: 'tutorial' }
  return { name: 'main' }
}

export default function App() {
  const [player, setPlayer] = useState<Player | null | undefined>(undefined)
  const [route, setRoute] = useState<Route>({ name: 'welcome' })
  const [tab, setTab] = useState<Tab>('workshop')
  const [dailyReady, setDailyReady] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const clearToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    api.currentPlayer().then((p) => {
      setPlayer(p)
      setRoute(p ? routeFor(p) : { name: 'welcome' })
    })
  }, [])

  const signedIn = (p: Player) => {
    setPlayer(p)
    setTab('workshop')
    setRoute(routeFor(p))
  }

  const signedOut = () => {
    setPlayer(null)
    setRoute({ name: 'welcome' })
  }

  // 補給分頁的紅點
  useEffect(() => {
    if (!player || route.name !== 'main') return
    api
      .dailyStatus()
      .then((s) => setDailyReady(!s.claimed))
      .catch(() => setDailyReady(false))
  }, [player, route.name, tab])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route, tab])

  if (player === undefined) {
    return (
      <div className="app">
        <Spinner />
      </div>
    )
  }

  const go = (t: Tab) => {
    setTab(t)
    setRoute({ name: 'main' })
  }

  let content: ReactNode = null
  let showTabs = false

  switch (route.name) {
    case 'welcome':
      content = (
        <Welcome
          onLogin={() => setRoute({ name: 'signIn' })}
          onSignUp={() => setRoute({ name: 'signUp' })}
          onTrial={() => setRoute({ name: 'trial' })}
        />
      )
      break
    case 'signIn':
      content = (
        <SignIn
          api={api}
          onBack={() => setRoute({ name: 'welcome' })}
          onDone={signedIn}
          onForgot={() => setRoute({ name: 'forgot' })}
          onSignUp={() => setRoute({ name: 'signUp' })}
        />
      )
      break
    case 'signUp':
      content = <SignUp api={api} onBack={() => setRoute({ name: 'welcome' })} onDone={signedIn} />
      break
    case 'forgot':
      content = <ForgotPassword api={api} onBack={() => setRoute({ name: 'signIn' })} />
      break
    case 'trial':
      content = (
        <Workshop
          mode="trial"
          inventory={{}}
          onTrialSignUp={() => setRoute({ name: 'signUp' })}
          onExitTrial={() => setRoute({ name: 'welcome' })}
        />
      )
      break
    case 'profileSetup':
      if (player) content = <ProfileSetup api={api} player={player} onDone={signedIn} />
      break
    case 'starter':
      if (player) content = <StarterGift api={api} onDone={signedIn} />
      break
    case 'tutorial':
      if (player)
        content = (
          <Workshop
            mode="tutorial"
            inventory={player.inventory}
            onPreview={api.previewCandidates}
            onCraft={async (requestId, inputs, scene) => {
              const r = await api.craft(requestId, inputs, scene)
              setPlayer((p) => (p ? { ...p, inventory: r.inventory } : p))
              return r
            }}
            onTutorialDone={async () => signedIn(await api.completeTutorial())}
          />
        )
      break
    case 'main':
    case 'detail':
    case 'share':
      if (!player) break
      showTabs = true
      if (route.name === 'detail') {
        content = (
          <CharacterDetail
            player={player}
            id={route.id}
            onBack={() => go('dex')}
            onShare={(id) => setRoute({ name: 'share', id })}
          />
        )
      } else if (route.name === 'share') {
        content = (
          <Share player={player} id={route.id} onBack={() => setRoute({ name: 'detail', id: route.id })} onToast={setToast} />
        )
      } else if (tab === 'workshop') {
        content = (
          <Workshop
            mode="play"
            inventory={player.inventory}
            onPreview={api.previewCandidates}
            onCraft={async (requestId, inputs, scene) => {
              const r = await api.craft(requestId, inputs, scene)
              // 重新讀取玩家資料（收藏、庫存）
              const fresh = await api.currentPlayer()
              if (fresh) setPlayer(fresh)
              return r
            }}
            onOpenCharacter={(id) => {
              setTab('dex')
              setRoute({ name: 'detail', id })
            }}
          />
        )
      } else if (tab === 'dex') {
        content = <Dex player={player} onOpen={(id) => setRoute({ name: 'detail', id })} />
      } else if (tab === 'daily') {
        content = <Daily api={api} onPlayer={setPlayer} onClaimed={() => setDailyReady(false)} />
      } else {
        content = (
          <Me api={api} tools={tools} player={player} onPlayer={setPlayer} onSignedOut={signedOut} onToast={setToast} />
        )
      }
      break
  }

  return (
    <div className="app">
      {content}
      {showTabs && <TabBar current={route.name === 'main' ? tab : 'dex'} onChange={go} dailyReady={dailyReady} />}
      <Toast message={toast} onDone={clearToast} />
    </div>
  )
}
