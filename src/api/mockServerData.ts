// ⚠️ 原型專用：模擬「只存在伺服器」的資料。
// Phase 2 起這些內容只放在資料庫（recipes、starter_grant_items、daily_*），前端不會再有這個檔案。
// 內容與 content/recipes.csv、starter_grant.csv、daily_claim.csv 相同。

export const RECIPES: { id: string; characterId: string; steps: string }[] = [
  { id: 'r_fm001_a', characterId: 'fm001', steps: 'potato*1|milk*2|black_sesame*1|blueberry*1' },
  { id: 'r_fm002_a', characterId: 'fm002', steps: 'potato*1|peanut*2|seaweed*1|tomato*1|lettuce*1' },
  { id: 'r_fm003_a', characterId: 'fm003', steps: 'potato*1|milk*1|strawberry*2|lettuce*1' },
  { id: 'r_fm004_a', characterId: 'fm004', steps: 'potato*1|milk*2|black_sesame*1|tomato*2' },
  { id: 'r_fm005_a', characterId: 'fm005', steps: 'potato*1|@cream*1|pumpkin*2' },
]

export const STARTER_GRANT: Record<string, number> = {
  potato: 5,
  butter: 2,
  pumpkin: 2,
  milk: 4,
  black_sesame: 2,
  blueberry: 2,
  strawberry: 2,
  lettuce: 2,
}

export const DAILY_GUARANTEED: Record<string, number> = { potato: 2 }
export const DAILY_RANDOM_COUNT = 4
export const DAILY_RANDOM_POOL = [
  'butter',
  'pumpkin',
  'milk',
  'black_sesame',
  'blueberry',
  'strawberry',
  'lettuce',
  'peanut',
  'seaweed',
  'tomato',
]
