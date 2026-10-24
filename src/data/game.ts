// 公開的遊戲主資料：元素、分類、角色。內容來自 content/*.csv（D-28、D-26、D-30）。
// 這裡只放前端本來就能看到的資料；配方答案不在這裡（見 src/api/mockServerData.ts）。

import fm001 from '../assets/proto/characters/fm001.webp'
import fm002 from '../assets/proto/characters/fm002.webp'
import fm003 from '../assets/proto/characters/fm003.webp'
import fm004 from '../assets/proto/characters/fm004.webp'
import fm005 from '../assets/proto/characters/fm005.webp'
import sil001 from '../assets/proto/silhouettes/fm001.webp'
import sil002 from '../assets/proto/silhouettes/fm002.webp'
import sil003 from '../assets/proto/silhouettes/fm003.webp'
import sil004 from '../assets/proto/silhouettes/fm004.webp'
import sil005 from '../assets/proto/silhouettes/fm005.webp'

export type CategoryId =
  | 'white'
  | 'cream'
  | 'yellow'
  | 'amber'
  | 'black'
  | 'blue'
  | 'pink'
  | 'orange'
  | 'green'
  | 'heart'
  | 'theme'

export interface ElementCategory {
  id: CategoryId
  name: string
  color: string
}

export interface GameElement {
  id: string
  name: string
  category: CategoryId
  emoji: string
  firstBatch: boolean
}

export interface CharacterType {
  id: string
  name: string
  isSpecial: boolean
}

export interface Character {
  id: string
  dexNo: number
  /** 暫名：正式名稱待 D-31 */
  name: string
  typeId: string
  baseTypeId: string | null
  description: string
  /** 原型階段打包在前端；Phase 2 起改由私有 Storage 簽名網址取得 */
  art: string
  silhouette: string
}

export const CATEGORIES: ElementCategory[] = [
  { id: 'white', name: '白色系', color: '#F5F1E8' },
  { id: 'cream', name: '奶油色系', color: '#F3DDB3' },
  { id: 'yellow', name: '黃色系', color: '#F6C945' },
  { id: 'amber', name: '琥珀色系', color: '#C98A3D' },
  { id: 'black', name: '黑色系', color: '#2B2626' },
  { id: 'blue', name: '藍色系', color: '#7C93B8' },
  { id: 'pink', name: '紅粉色系', color: '#F2A7A5' },
  { id: 'orange', name: '橘色系', color: '#F2A65A' },
  { id: 'green', name: '綠色系', color: '#A8D08D' },
  // 愛心代表顏色（D-35）、主題道具代表角色造型（D-34）
  { id: 'heart', name: '愛心', color: '#FCE6E1' },
  { id: 'theme', name: '主題道具', color: '#E6F3F9' },
]

export const ELEMENTS: GameElement[] = [
  { id: 'milk', name: '牛奶', category: 'white', emoji: '🥛', firstBatch: true },
  { id: 'rice', name: '白飯', category: 'white', emoji: '🍚', firstBatch: false },
  { id: 'tofu', name: '豆腐', category: 'white', emoji: '◻️', firstBatch: false },
  { id: 'potato', name: '馬鈴薯', category: 'cream', emoji: '🥔', firstBatch: true },
  { id: 'butter', name: '奶油', category: 'cream', emoji: '🧈', firstBatch: true },
  { id: 'banana', name: '香蕉', category: 'cream', emoji: '🍌', firstBatch: false },
  { id: 'egg', name: '雞蛋', category: 'yellow', emoji: '🥚', firstBatch: false },
  { id: 'corn', name: '玉米', category: 'yellow', emoji: '🌽', firstBatch: false },
  { id: 'peanut', name: '花生', category: 'amber', emoji: '🥜', firstBatch: true },
  { id: 'honey', name: '蜂蜜', category: 'amber', emoji: '🍯', firstBatch: false },
  { id: 'caramel', name: '焦糖', category: 'amber', emoji: '🍮', firstBatch: false },
  { id: 'black_sesame', name: '黑芝麻', category: 'black', emoji: '⚫', firstBatch: true },
  { id: 'seaweed', name: '海苔', category: 'black', emoji: '🍙', firstBatch: true },
  { id: 'black_bean', name: '黑豆', category: 'black', emoji: '🫘', firstBatch: false },
  { id: 'blueberry', name: '藍莓', category: 'blue', emoji: '🫐', firstBatch: true },
  { id: 'butterfly_pea', name: '蝶豆花', category: 'blue', emoji: '🪻', firstBatch: false },
  { id: 'strawberry', name: '草莓', category: 'pink', emoji: '🍓', firstBatch: true },
  { id: 'tomato', name: '番茄', category: 'pink', emoji: '🍅', firstBatch: true },
  { id: 'pumpkin', name: '南瓜', category: 'orange', emoji: '🎃', firstBatch: true },
  { id: 'carrot', name: '紅蘿蔔', category: 'orange', emoji: '🥕', firstBatch: false },
  { id: 'lettuce', name: '生菜', category: 'green', emoji: '🥬', firstBatch: true },
  { id: 'matcha', name: '抹茶', category: 'green', emoji: '🍵', firstBatch: false },
  { id: 'heart_red', name: '紅色愛心', category: 'heart', emoji: '❤️', firstBatch: true },
  { id: 'heart_blue', name: '藍色愛心', category: 'heart', emoji: '💙', firstBatch: true },
  { id: 'heart_yellow', name: '黃色愛心', category: 'heart', emoji: '💛', firstBatch: true },
  { id: 'heart_pink', name: '粉紅愛心', category: 'heart', emoji: '🩷', firstBatch: true },
  { id: 'heart_orange', name: '橘色愛心', category: 'heart', emoji: '🧡', firstBatch: true },
  { id: 'crab', name: '螃蟹', category: 'theme', emoji: '🦀', firstBatch: true },
  { id: 'shirt', name: '小衣服', category: 'theme', emoji: '👕', firstBatch: true },
  { id: 'hotdog', name: '熱狗', category: 'theme', emoji: '🌭', firstBatch: true },
  { id: 'flower', name: '花朵', category: 'theme', emoji: '🌸', firstBatch: true },
]

/** 第一批開放的元素：11 種食材＋5 色愛心＋4 種主題道具 */
export const ACTIVE_ELEMENTS = ELEMENTS.filter((e) => e.firstBatch)

export const CHARACTER_TYPES: CharacterType[] = [
  { id: 'cream', name: '奶油法鬥', isSpecial: false },
  { id: 'pied', name: '乳牛法鬥', isSpecial: false },
  { id: 'blue', name: '藍法鬥', isSpecial: false },
  { id: 'black_mask', name: '黑嘴法鬥', isSpecial: false },
  { id: 'amber', name: '琥珀法鬥', isSpecial: false },
  { id: 'special', name: '特殊法鬥', isSpecial: true },
]

export const CHARACTERS: Character[] = [
  { id: 'fm001', dexNo: 66, name: '藍衣乳牛', typeId: 'pied', baseTypeId: null, description: '黑白花、穿淺藍衣服的乖乖坐姿', art: fm001, silhouette: sil001 },
  { id: 'fm002', dexNo: 43, name: '熱狗堡', typeId: 'special', baseTypeId: 'black_mask', description: '穿上熱狗裝，準備開飯', art: fm002, silhouette: sil002 },
  { id: 'fm003', dexNo: 92, name: '小花眨眼', typeId: 'special', baseTypeId: 'cream', description: '戴著彈簧花朵頭套，眨眼放電', art: fm003, silhouette: sil003 },
  { id: 'fm004', dexNo: 20, name: '小螃蟹', typeId: 'special', baseTypeId: 'pied', description: '紅色螃蟹頭套，表情有點委屈', art: fm004, silhouette: sil004 },
  { id: 'fm005', dexNo: 54, name: '南瓜臉', typeId: 'special', baseTypeId: 'cream', description: '從南瓜裡探出頭來', art: fm005, silhouette: sil005 },
]

export const TOTAL_DEX = 100

const elementMap = new Map(ELEMENTS.map((e) => [e.id, e]))
const categoryMap = new Map(CATEGORIES.map((c) => [c.id, c]))
const characterMap = new Map(CHARACTERS.map((c) => [c.id, c]))
const typeMap = new Map(CHARACTER_TYPES.map((t) => [t.id, t]))

export const getElement = (id: string) => elementMap.get(id)
export const getCategory = (id: CategoryId) => categoryMap.get(id)!
export const getCharacter = (id: string) => characterMap.get(id)
export const getCharacterType = (id: string) => typeMap.get(id)

export const formatDexNo = (n: number) => String(n).padStart(3, '0')

export function typeLabel(c: Character): string {
  const t = getCharacterType(c.typeId)?.name ?? ''
  const base = c.baseTypeId ? getCharacterType(c.baseTypeId)?.name : null
  return base ? `${t}・${base}底` : t
}
