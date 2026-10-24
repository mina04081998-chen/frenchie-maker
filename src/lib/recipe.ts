// 配方比對：不看順序，只看「放了哪些元素、各幾個」（2026-10-24 規則變更）。
// 配方可以指定元素，或指定「某色系的任一元素」（分類格，D-06／D-27）。
// Phase 2 起這段邏輯搬到資料庫函式，前端不再自行判斷。

import { getElement, type CategoryId } from '../data/game'

export type Slot = { element: string } | { category: CategoryId }

/** 'potato*1|@cream*1|pumpkin*1' → [potato, @cream, pumpkin]；順序沒有意義 */
export function parseSteps(steps: string): Slot[] {
  const slots: Slot[] = []
  for (const step of steps.split('|')) {
    const [key, qty] = step.split('*')
    const n = Number(qty)
    if (!key || !Number.isInteger(n) || n < 1) throw new Error(`配方格式錯誤：${step}`)
    for (let i = 0; i < n; i++) {
      slots.push(key.startsWith('@') ? { category: key.slice(1) as CategoryId } : { element: key })
    }
  }
  return slots
}

export function slotAccepts(slot: Slot, elementId: string): boolean {
  if ('element' in slot) return slot.element === elementId
  return getElement(elementId)?.category === slot.category
}

const count = <K extends string>(keys: K[]) => {
  const m = new Map<K, number>()
  for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1)
  return m
}

/**
 * 把投入的元素分配到配方格位。
 * 先填「指定元素」的格位，剩下的再填同色系的分類格位（這樣分配一定是最好的）。
 */
function allocate(slots: Slot[], inputs: string[]) {
  const needElement = count(slots.flatMap((s) => ('element' in s ? [s.element] : [])))
  const needCategory = count(slots.flatMap((s) => ('category' in s ? [s.category] : [])))
  const leftoverByCategory = new Map<CategoryId, number>()
  let missingElements = 0

  for (const [id, have] of count(inputs)) {
    const used = Math.min(have, needElement.get(id) ?? 0)
    needElement.set(id, (needElement.get(id) ?? 0) - used)
    const extra = have - used
    if (extra > 0) {
      const cat = getElement(id)?.category
      if (!cat) return null
      leftoverByCategory.set(cat, (leftoverByCategory.get(cat) ?? 0) + extra)
    }
  }
  for (const n of needElement.values()) missingElements += n

  // 多出來的元素必須都能放進同色系的分類格位
  for (const [cat, extra] of leftoverByCategory) {
    if (extra > (needCategory.get(cat) ?? 0)) return null
  }
  let missingCategory = 0
  for (const [cat, need] of needCategory) missingCategory += need - (leftoverByCategory.get(cat) ?? 0)
  return { missing: missingElements + missingCategory }
}

/** 投入內容剛好等於配方（不看順序） */
export function matchesRecipe(slots: Slot[], inputs: string[]): boolean {
  return inputs.length === slots.length && allocate(slots, inputs)?.missing === 0
}

/** 目前投入的內容，再加一些元素就有機會變成這個配方 */
export function couldBecome(slots: Slot[], inputs: string[]): boolean {
  return inputs.length > 0 && inputs.length <= slots.length && allocate(slots, inputs) !== null
}
