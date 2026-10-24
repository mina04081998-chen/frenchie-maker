// 原型用的假伺服器：資料只存在這台裝置的瀏覽器裡。
// 行為依照 docs/phase0 的設計（冪等、扣料、上限），讓畫面流程跟正式版一致。

import { ACTIVE_ELEMENTS, getElement } from '../data/game'
import { PROTO_FAIL_HINTS, PROTO_MAX_INPUTS, PROTO_MAX_STACK } from '../data/protoValues'
import { gameDayOf, nextResetAt, shiftedNow } from '../lib/gameDay'
import { matchesRecipe, parseSteps } from '../lib/recipe'
import { readJson, removeKey, writeJson } from '../lib/storage'
import {
  DAILY_GUARANTEED,
  DAILY_RANDOM_COUNT,
  DAILY_RANDOM_POOL,
  RECIPES,
  STARTER_GRANT,
} from './mockServerData'
import {
  ApiError,
  type CraftResult,
  type DailyStatus,
  type GameApi,
  type GrantLine,
  type Inventory,
  type Player,
  type ProtoTools,
  type SceneId,
} from './types'

const DB_KEY = 'frenchie-maker-proto-db-v1'

interface StoredPlayer extends Player {
  dailyClaims: Record<string, GrantLine[]>
  craftResults: Record<string, CraftResult>
}

interface Db {
  accounts: Record<string, { password: string; userId: string }>
  players: Record<string, StoredPlayer>
  sessionUserId: string | null
  dayOffset: number
}

const emptyDb = (): Db => ({ accounts: {}, players: {}, sessionUserId: null, dayOffset: 0 })

function load(): Db {
  return readJson<Db>(DB_KEY) ?? emptyDb()
}

function save(db: Db) {
  writeJson(DB_KEY, db)
}

/** 模擬網路延遲，讓讀取狀態看得到 */
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms))

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

function publicPlayer(p: StoredPlayer): Player {
  return {
    userId: p.userId,
    email: p.email,
    nickname: p.nickname,
    avatar: p.avatar,
    inventory: { ...p.inventory },
    collection: { ...p.collection },
    starterGrantedAt: p.starterGrantedAt,
    tutorialDoneAt: p.tutorialDoneAt,
  }
}

function requirePlayer(db: Db): StoredPlayer {
  const p = db.sessionUserId ? db.players[db.sessionUserId] : undefined
  if (!p) throw new ApiError('NOT_SIGNED_IN', '請先登入。')
  return p
}

/** 依持有上限入帳，回傳實際入帳與被截掉的數量 */
function addWithCap(inv: Inventory, elementId: string, quantity: number): GrantLine {
  const before = inv[elementId] ?? 0
  const after = Math.min(before + quantity, PROTO_MAX_STACK)
  inv[elementId] = after
  return { elementId, quantity, overflow: before + quantity - after }
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

function validateCredentials(email: string, password: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError('BAD_EMAIL', 'Email 格式不正確。')
  if (password.length < 6) throw new ApiError('WEAK_PASSWORD', '密碼至少要 6 個字元。')
}

export const mockApi: GameApi & ProtoTools = {
  async currentPlayer() {
    await wait(200)
    const db = load()
    const p = db.sessionUserId ? db.players[db.sessionUserId] : undefined
    return p ? publicPlayer(p) : null
  },

  async signUp(rawEmail, password) {
    await wait()
    const email = normalizeEmail(rawEmail)
    validateCredentials(email, password)
    const db = load()
    if (db.accounts[email]) throw new ApiError('EMAIL_TAKEN', '這個 Email 已經註冊過了，請直接登入。')
    const userId = newId()
    db.accounts[email] = { password, userId }
    db.players[userId] = {
      userId,
      email,
      nickname: null,
      avatar: null,
      inventory: {},
      collection: {},
      starterGrantedAt: null,
      tutorialDoneAt: null,
      dailyClaims: {},
      craftResults: {},
    }
    db.sessionUserId = userId
    save(db)
    return publicPlayer(db.players[userId])
  },

  async signIn(rawEmail, password) {
    await wait()
    const email = normalizeEmail(rawEmail)
    const db = load()
    const account = db.accounts[email]
    // 不透露帳號是否存在
    if (!account || account.password !== password) {
      throw new ApiError('BAD_CREDENTIALS', 'Email 或密碼不正確。')
    }
    db.sessionUserId = account.userId
    save(db)
    return publicPlayer(db.players[account.userId])
  },

  async signOut() {
    await wait(150)
    const db = load()
    db.sessionUserId = null
    save(db)
  },

  async requestPasswordReset(rawEmail) {
    await wait()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(rawEmail))) {
      throw new ApiError('BAD_EMAIL', 'Email 格式不正確。')
    }
    // 正式版會寄出重設信；無論帳號是否存在都顯示相同訊息
  },

  async resetPassword(rawEmail, newPassword) {
    await wait()
    const email = normalizeEmail(rawEmail)
    if (newPassword.length < 6) throw new ApiError('WEAK_PASSWORD', '密碼至少要 6 個字元。')
    const db = load()
    const account = db.accounts[email]
    if (!account) throw new ApiError('LINK_INVALID', '重設連結無效或已過期，請重新申請。')
    account.password = newPassword
    save(db)
  },

  async updateProfile(patch) {
    await wait()
    const db = load()
    const p = requirePlayer(db)
    if (patch.nickname !== undefined) {
      const nickname = patch.nickname.trim()
      if (!nickname) throw new ApiError('BAD_NICKNAME', '請輸入暱稱。')
      p.nickname = nickname
    }
    if (patch.avatar !== undefined) p.avatar = patch.avatar
    save(db)
    return publicPlayer(p)
  },

  async grantStarter() {
    await wait()
    const db = load()
    const p = requirePlayer(db)
    // 已領過就不再發放（防重複）
    if (p.starterGrantedAt) return { player: publicPlayer(p), lines: [] }
    const lines = Object.entries(STARTER_GRANT).map(([id, qty]) => addWithCap(p.inventory, id, qty))
    p.starterGrantedAt = new Date().toISOString()
    save(db)
    return { player: publicPlayer(p), lines }
  },

  async completeTutorial() {
    await wait(150)
    const db = load()
    const p = requirePlayer(db)
    p.tutorialDoneAt ??= new Date().toISOString()
    save(db)
    return publicPlayer(p)
  },

  async craft(requestId, inputs, _scene: SceneId) {
    await wait(900)
    const db = load()
    const p = requirePlayer(db)

    // 冪等：同一個 requestId 只處理一次
    const previous = p.craftResults[requestId]
    if (previous) return previous

    if (inputs.length === 0) throw new ApiError('EMPTY', '鍋子裡還沒有食材。')
    if (inputs.length > PROTO_MAX_INPUTS) {
      throw new ApiError('TOO_MANY', `一次最多投入 ${PROTO_MAX_INPUTS} 個食材。`)
    }
    const need: Record<string, number> = {}
    for (const id of inputs) {
      if (!ACTIVE_ELEMENTS.some((e) => e.id === id)) throw new ApiError('BAD_ELEMENT', '有無法使用的食材。')
      need[id] = (need[id] ?? 0) + 1
    }
    for (const [id, n] of Object.entries(need)) {
      if ((p.inventory[id] ?? 0) < n) {
        throw new ApiError('INSUFFICIENT', `${getElement(id)?.name ?? id}不夠了。`)
      }
    }

    // 成功或失敗，投入的元素都會消耗
    for (const [id, n] of Object.entries(need)) p.inventory[id] -= n

    // 場景只影響畫面，不參與比對（D-07）
    const recipe = RECIPES.find((r) => matchesRecipe(parseSteps(r.steps), inputs))
    let result: CraftResult
    if (recipe) {
      const entry = p.collection[recipe.characterId]
      const isNew = !entry
      p.collection[recipe.characterId] = {
        firstUnlockedAt: entry?.firstUnlockedAt ?? new Date().toISOString(),
        craftCount: (entry?.craftCount ?? 0) + 1,
      }
      result = {
        requestId,
        success: true,
        characterId: recipe.characterId,
        isNew,
        craftCount: p.collection[recipe.characterId].craftCount,
        hint: null,
        consumed: inputs,
        inventory: { ...p.inventory },
      }
    } else {
      result = {
        requestId,
        success: false,
        characterId: null,
        isNew: false,
        craftCount: 0,
        hint: PROTO_FAIL_HINTS[Math.floor(Math.random() * PROTO_FAIL_HINTS.length)],
        consumed: inputs,
        inventory: { ...p.inventory },
      }
    }
    p.craftResults[requestId] = result
    save(db)
    return result
  },

  async dailyStatus(): Promise<DailyStatus> {
    await wait(150)
    const db = load()
    const p = requirePlayer(db)
    const now = shiftedNow(db.dayOffset)
    const gameDay = gameDayOf(now)
    return {
      gameDay,
      claimed: p.dailyClaims[gameDay] ?? null,
      nextResetAt: new Date(nextResetAt(now).getTime() - db.dayOffset * 86_400_000).toISOString(),
    }
  },

  async claimDaily() {
    await wait(700)
    const db = load()
    const p = requirePlayer(db)
    const gameDay = gameDayOf(shiftedNow(db.dayOffset))
    const already = p.dailyClaims[gameDay]
    // 同一遊戲日只能領一次；重複呼叫回傳同一份結果
    if (already) return { player: publicPlayer(p), lines: already }

    const counts: Record<string, number> = { ...DAILY_GUARANTEED }
    for (let i = 0; i < DAILY_RANDOM_COUNT; i++) {
      const id = DAILY_RANDOM_POOL[Math.floor(Math.random() * DAILY_RANDOM_POOL.length)]
      counts[id] = (counts[id] ?? 0) + 1
    }
    const lines = Object.entries(counts).map(([id, qty]) => addWithCap(p.inventory, id, qty))
    p.dailyClaims[gameDay] = lines
    save(db)
    return { player: publicPlayer(p), lines }
  },

  async advanceDay() {
    await wait(150)
    const db = load()
    db.dayOffset += 1
    save(db)
  },

  async addEach(quantity) {
    await wait(150)
    const db = load()
    const p = requirePlayer(db)
    for (const e of ACTIVE_ELEMENTS) addWithCap(p.inventory, e.id, quantity)
    save(db)
    return publicPlayer(p)
  },

  async resetAll() {
    await wait(150)
    removeKey(DB_KEY)
  },
}

