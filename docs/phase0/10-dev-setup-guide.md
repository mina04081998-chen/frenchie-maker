# 10｜新手本機環境準備指南

> 目標：在 Phase 1 開始前把工具都裝好，**不需要寫任何程式**。
> 每一步都有「確認方式」，看到預期結果再進行下一步。版本資訊查核日期 2026-10-24。

## 步驟 1：安裝 Node.js（含 npm）

1. 到 <https://nodejs.org> 下載 **LTS** 版本（目前建議 24.x；若首頁 LTS 已顯示 26.x 也可以）。
2. 依安裝程式預設選項安裝。
3. **確認**：開啟終端機（Mac：「終端機」；Windows：「PowerShell」），輸入：

   ```bash
   node -v
   npm -v
   ```

   看到 `v24.x.x`（或更新的 LTS）與一個版本號即成功。

> 進階（可略）：之後若需要切換多個 Node 版本，可改用 `nvm`（Mac）或 `nvm-windows`。

## 步驟 2：安裝 Git

1. Mac：終端機輸入 `git --version`，若未安裝會跳出安裝提示，依提示安裝。
   Windows：到 <https://git-scm.com> 下載安裝，選項維持預設。
2. 設定你的名字與 Email（只需一次）：

   ```bash
   git config --global user.name "你的名字"
   git config --global user.email "你的 GitHub Email"
   ```

3. **確認**：`git --version` 顯示版本號。

## 步驟 3：GitHub

1. 你已經有 GitHub 帳號（寄賣平台就在上面）。
2. Phase 1 前建立新的**私有**儲存庫，例如 `frenchie-maker`（D-20）。
3. 建議安裝 **GitHub Desktop**（<https://desktop.github.com>），用圖形介面提交與推送，比指令更直覺。

## 步驟 4：安裝 VS Code

1. 到 <https://code.visualstudio.com> 下載安裝。
2. 建議安裝的擴充套件（左側「Extensions」搜尋）：
   - **ESLint**：程式碼檢查
   - **Prettier**：自動排版
   - **Traditional Chinese Language Pack**（選用）：中文介面
3. **確認**：在 VS Code 選「Terminal → New Terminal」，輸入 `node -v` 有反應。

## 步驟 5：Claude

可擇一或並用：

| 方式 | 適合 |
|---|---|
| Claude Code 網頁版（claude.ai/code） | 不需安裝，直接連 GitHub 儲存庫；你現在使用的就是這個 |
| Claude Code 桌面版／CLI | 想在自己電腦上直接改檔、執行專案 |
| VS Code 擴充套件 | 在編輯器裡對話 |

> 開發過程中我無法替你登入 Supabase 後台或輸入密碼，需要你操作的步驟我會逐一說明。

## 步驟 6：Supabase

1. 你已有 Supabase 帳號（寄賣平台使用中）。
2. Phase 2 時**建立新的專案**給法鬥製造所，**不要與寄賣平台共用**，避免資料與權限互相影響。
   - Region：建議選 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**，離台灣較近。
   - 資料庫密碼：用密碼管理器產生並保存。
3. 記下專案的 **Project URL** 與 **anon / publishable key**（可放在前端）。
4. **`service_role` / secret key 絕對不要**貼進前端程式、GitHub、聊天訊息或截圖。
5. 免費專案 7 天沒有活動會暫停，若網站打不開，先到 Supabase 後台按「Restore」。

> 進階（可略）：Supabase CLI 可在本機跑完整 Supabase，但需要 Docker，對新手較複雜。第一版建議直接使用雲端專案搭配 migration 檔案即可。

## 步驟 7：手機測試準備

1. 電腦與手機連同一個 Wi-Fi。
2. Phase 1 開始後，我會提供讓手機開啟電腦上開發中網頁的方式（Vite 的 `--host` 選項）。
3. 準備至少一支 iPhone（Safari）或 Android（Chrome）實機。

## 完成檢查表

- [ ] `node -v` 顯示 LTS 版本
- [ ] `npm -v` 顯示版本
- [ ] `git --version` 顯示版本，且已設定名字與 Email
- [ ] VS Code 已安裝並裝好 ESLint、Prettier
- [ ] 已決定新 GitHub 儲存庫名稱（D-20）
- [ ] 確認 Supabase 帳號可登入（新專案 Phase 2 再建）

## 參考來源

- Vite 8 發布公告：<https://vite.dev/blog/announcing-vite8>
- Node.js 版本生命週期：<https://endoflife.date/nodejs>
- Supabase 新表需明確授權的變更：<https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically>
