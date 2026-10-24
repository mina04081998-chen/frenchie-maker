// ⚠️ 原型專用：模擬「只存在伺服器」的資料。
// Phase 2 起這些內容只放在資料庫（recipes、starter_grant_items、daily_*），前端不會再有這個檔案。
// 內容與 content/recipes.csv、starter_grant.csv、daily_claim.csv 相同。
// 配方不看順序：毛色食材 ＋ 代表配件顏色的愛心 ＋ 主題道具（草案，待確認）。

export const RECIPES: { id: string; characterId: string; steps: string }[] = [
  { id: 'r_fm001_b', characterId: 'fm001', steps: 'potato*1|milk*1|black_sesame*1|heart_blue*1|shirt*1' },
  { id: 'r_fm002_b', characterId: 'fm002', steps: 'potato*1|peanut*1|seaweed*1|heart_yellow*1|hotdog*1' },
  { id: 'r_fm003_b', characterId: 'fm003', steps: 'potato*1|butter*1|heart_pink*1|flower*1' },
  { id: 'r_fm004_b', characterId: 'fm004', steps: 'potato*1|milk*1|black_sesame*1|heart_red*1|crab*1' },
  { id: 'r_fm005_b', characterId: 'fm005', steps: 'potato*1|@cream*1|heart_orange*1|pumpkin*1' },
]

export const STARTER_GRANT: Record<string, number> = {
  potato: 5,
  butter: 3,
  milk: 2,
  black_sesame: 2,
  heart_orange: 1,
  heart_blue: 1,
  heart_pink: 1,
  pumpkin: 1,
  shirt: 1,
  flower: 1,
}

export const DAILY_GUARANTEED: Record<string, number> = { potato: 2 }
export const DAILY_RANDOM_COUNT = 4
export const DAILY_RANDOM_POOL = [
  'butter',
  'milk',
  'black_sesame',
  'peanut',
  'seaweed',
  'pumpkin',
  'blueberry',
  'strawberry',
  'tomato',
  'lettuce',
  'heart_red',
  'heart_blue',
  'heart_yellow',
  'heart_pink',
  'heart_orange',
  'crab',
  'shirt',
  'hotdog',
  'flower',
]
