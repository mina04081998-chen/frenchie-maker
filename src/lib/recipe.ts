// 配方比對：逐格比對（見 docs/phase0/04-data-formats.md §3.4）。
// Phase 2 起這段邏輯搬到資料庫函式 craft()，前端不再自行判斷。

import { getElement, type CategoryId } from '../data/game'

export type Slot = { element: string } | { category: CategoryId }

/** 'potato*1|@cream*1|pumpkin*2' → [potato, @cream, pumpkin, pumpkin] */
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

export function matchesRecipe(slots: Slot[], inputs: string[]): boolean {
  return slots.length === inputs.length && slots.every((slot, i) => slotAccepts(slot, inputs[i]))
}
