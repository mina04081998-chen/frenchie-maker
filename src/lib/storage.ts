// localStorage 包裝：私密瀏覽、預覽頁等環境可能讀寫失敗，失敗時退回記憶體。

const memory = new Map<string, string>()

export function readJson<T>(key: string): T | null {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(key)
  } catch {
    raw = memory.get(key) ?? null
  }
  if (raw == null) raw = memory.get(key) ?? null
  if (raw == null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  const raw = JSON.stringify(value)
  memory.set(key, raw)
  try {
    localStorage.setItem(key, raw)
  } catch {
    // 保留在記憶體中即可
  }
}

export function removeKey(key: string): void {
  memory.delete(key)
  try {
    localStorage.removeItem(key)
  } catch {
    // 忽略
  }
}
