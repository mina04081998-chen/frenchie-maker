# 法鬥製造所 Frenchie Maker｜Phase 0 規劃文件

> 狀態：Phase 0（需求確認與技術規劃）草案，等待確認。
> 本資料夾**只有文件**，沒有遊戲程式碼、沒有建立任何資料庫或 Storage。
> 文件中所有遊戲數值都以「待定」或 `‹TBD›` 標示，範例數字只用於說明計算方式。

## 文件索引

| # | 交付項目 | 文件 |
|---|---|---|
| 1 | 正式規格書 v1.2 | [01-spec-v1.2.md](01-spec-v1.2.md) |
| 2 | 系統架構圖與頁面流程圖 | [02-architecture.md](02-architecture.md) |
| 3 | 資料庫關聯、欄位、主鍵、外鍵與 RLS 權限 | [03-database.md](03-database.md) |
| 4 | 配方、元素、角色與玩家進度的資料格式 | [04-data-formats.md](04-data-formats.md) |
| 5 | 初始元素與每日領取規則（含待決策） | [05-starter-and-daily.md](05-starter-and-daily.md) |
| 6 | ~~訪客與雲端進度合併~~（D-24 已取消，文件保留供參考） | [06-guest-merge.md](06-guest-merge.md) |
| 7 | 私有 PNG 儲存、解鎖驗證與授權讀取 | [07-private-images.md](07-private-images.md) |
| 8 | 測試圖片命名與匯入規格 | [08-png-import.md](08-png-import.md) |
| 9 | MVP 開發順序與測試驗收表 | [09-mvp-plan-and-tests.md](09-mvp-plan-and-tests.md) |
| 10 | 新手本機環境準備指南 | [10-dev-setup-guide.md](10-dev-setup-guide.md) |
| — | **待決策總表（請從這裡開始勾選）** | [decisions.md](decisions.md) |

## 建議閱讀順序

1. [decisions.md](decisions.md)：所有需要你選擇的項目都集中在這裡，每項都有選項與影響說明。
2. [01-spec-v1.2.md](01-spec-v1.2.md)：確認我對規格的理解沒有偏差。
3. [07-private-images.md](07-private-images.md) 與 [03-database.md](03-database.md) 的 RLS 段落：確認未解鎖原圖不會公開。
4. 其餘文件可在進入對應 Phase 前再細看。

## 存放位置

本專案使用獨立私有儲存庫 `frenchie-maker`，與寄賣平台完全分開（D-20）。
遊戲內容資料與素材在 [`/content`](../../content/README.md)。
