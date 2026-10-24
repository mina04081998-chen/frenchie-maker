// 前端與「伺服器」之間的介面。
// Phase 1 由 mockApi（存在這台裝置）實作；Phase 2 起改由 Supabase 實作同一介面，畫面程式不用改。

export type SceneId = 'cauldron' | 'dessert_bowl'

export type Inventory = Record<string, number>

export interface CollectionEntry {
  firstUnlockedAt: string
  craftCount: number
}

export interface Player {
  userId: string
  email: string
  nickname: string | null
  avatar: string | null
  inventory: Inventory
  collection: Record<string, CollectionEntry>
  starterGrantedAt: string | null
  tutorialDoneAt: string | null
}

export interface GrantLine {
  elementId: string
  quantity: number
  /** 因持有上限而沒有入帳的數量 */
  overflow: number
}

export interface CraftResult {
  requestId: string
  success: boolean
  characterId: string | null
  isNew: boolean
  craftCount: number
  hint: string | null
  consumed: string[]
  inventory: Inventory
}

export interface DailyStatus {
  gameDay: string
  claimed: GrantLine[] | null
  nextResetAt: string
}

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

export interface GameApi {
  currentPlayer(): Promise<Player | null>
  signUp(email: string, password: string): Promise<Player>
  signIn(email: string, password: string): Promise<Player>
  signOut(): Promise<void>
  requestPasswordReset(email: string): Promise<void>
  resetPassword(email: string, newPassword: string): Promise<void>
  updateProfile(patch: { nickname?: string; avatar?: string | null }): Promise<Player>
  grantStarter(): Promise<{ player: Player; lines: GrantLine[] }>
  completeTutorial(): Promise<Player>
  craft(requestId: string, inputs: string[], scene: SceneId): Promise<CraftResult>
  /** 目前鍋裡的內容「有機會」做出哪些角色：只回傳角色 ID，畫面只顯示剪影 */
  previewCandidates(inputs: string[]): Promise<string[]>
  dailyStatus(): Promise<DailyStatus>
  claimDaily(): Promise<{ player: Player; lines: GrantLine[] }>
}

/** 只有原型才有的測試工具 */
export interface ProtoTools {
  advanceDay(): Promise<void>
  addEach(quantity: number): Promise<Player>
  resetAll(): Promise<void>
}
