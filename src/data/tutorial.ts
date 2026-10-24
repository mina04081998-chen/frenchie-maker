// 新手教學（D-33）：教南瓜配方。教學會把這個配方告訴玩家，所以前端可以知道。
// 配方不看順序；教學仍一步一步帶，讓玩家認識每一類元素。

import type { Slot } from '../lib/recipe'

export const TUTORIAL_CHARACTER_ID = 'fm005'

export const TUTORIAL_STEPS: { slot: Slot; text: string }[] = [
  { slot: { element: 'potato' }, text: '先放 1 顆馬鈴薯。每一隻法鬥都需要馬鈴薯喔！' },
  { slot: { category: 'cream' }, text: '再放 1 個「奶油色系」的食材。馬鈴薯或奶油都可以，同色系的都算！' },
  { slot: { element: 'heart_orange' }, text: '放 1 顆橘色愛心，代表南瓜的顏色。' },
  { slot: { element: 'pumpkin' }, text: '最後放南瓜當主題道具。其實放的順序不重要，對的東西都放進去就可以了！' },
]
