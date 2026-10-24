// 遊戲日計算（D-05：台灣時間 05:00 重置）。
// 正式版由伺服器計算；原型在前端模擬，並可用「原型工具」往後跳天數。

export const RESET_TIMEZONE = 'Asia/Taipei'
export const RESET_HOUR = 5

const HOUR = 3_600_000
const DAY = 24 * HOUR

function partsIn(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  return { y: get('year'), m: get('month'), d: get('day'), h: get('hour'), min: get('minute'), s: get('second') }
}

/** 該時區相對 UTC 的位移（毫秒） */
function tzOffset(timeZone: string, date: Date): number {
  const p = partsIn(timeZone, date)
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(date.getTime() / 1000) * 1000
}

/** 回傳 'YYYY-MM-DD' 形式的遊戲日 */
export function gameDayOf(now: Date): string {
  const p = partsIn(RESET_TIMEZONE, new Date(now.getTime() - RESET_HOUR * HOUR))
  return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`
}

/** 下一次重置的時間點 */
export function nextResetAt(now: Date): Date {
  const [y, m, d] = gameDayOf(now).split('-').map(Number)
  const guess = Date.UTC(y, m - 1, d + 1, RESET_HOUR)
  return new Date(guess - tzOffset(RESET_TIMEZONE, new Date(guess)))
}

export function shiftedNow(dayOffset: number): Date {
  return new Date(Date.now() + dayOffset * DAY)
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60_000))
  const h = Math.floor(total / 60)
  const m = total % 60
  return h > 0 ? `${h} 小時 ${m} 分` : `${m} 分`
}
