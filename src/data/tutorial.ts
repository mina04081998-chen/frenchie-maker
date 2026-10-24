// 新手教學（D-33）：教南瓜配方。教學會把這個配方告訴玩家，所以前端可以知道。

import type { Slot } from '../lib/recipe'

export const TUTORIAL_CHARACTER_ID = 'fm005'

export const TUTORIAL_STEPS: { slot: Slot; text: string }[] = [
  { slot: { element: 'potato' }, text: '先放 1 顆馬鈴薯。每一隻法鬥都需要馬鈴薯喔！' },
  { slot: { category: 'cream' }, text: '再放 1 個「奶油色系」的食材。馬鈴薯或奶油都可以，同色系的都算！' },
  { slot: { element: 'pumpkin' }, text: '接著放南瓜。' },
  { slot: { element: 'pumpkin' }, text: '南瓜要 2 個，再放一個！' },
]
