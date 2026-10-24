// 原型暫用值。這些數值都「尚未決定」，只是為了讓原型能操作。
// 正式數值確定後改由資料庫設定（game_settings 等）提供。

/** 每種元素的持有上限（D-02 未定） */
export const PROTO_MAX_STACK = 20

/** 單次最多投入幾個元素（D-08 未定；目前最長配方 6 個） */
export const PROTO_MAX_INPUTS = 8

/** 超過上限的處理（D-02 未定）：原型採「直接捨棄並告知」 */
export const PROTO_OVERFLOW_POLICY = 'discard' as const

/** 失敗線索（D-11 未定）：原型只用通用句子，不洩漏任何配方內容 */
export const PROTO_FAIL_HINTS = [
  '鍋子冒出一陣灰煙……好像哪裡不太對。',
  '差一點點！再想想法鬥身上的顏色吧。',
  '香味跑掉了。食材的順序也很重要喔。',
]

/** 未解鎖角色顯示（D-10 未定）：原型採「剪影＋編號＋？？？」 */
export const PROTO_LOCKED_NAME = '？？？'

/** 收藏卡尺寸（D-14 未定）：原型採 1080×1350 直式 */
export const PROTO_CARD_SIZE = { width: 1080, height: 1350 }

/** 暱稱長度（未定） */
export const PROTO_NICKNAME_MAX = 12
