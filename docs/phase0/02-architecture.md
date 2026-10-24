# 02｜系統架構圖與頁面流程圖

> 圖表使用 Mermaid 語法，在 GitHub 上會自動顯示成圖。

## 1. 技術選型與版本確認（2026-10 查核）

| 技術 | 建議 | 查核結果與注意事項 |
|---|---|---|
| Node.js | **24 LTS** | 24 目前為 Active LTS，維護至 2028-04；26 預計 2026-10 下旬進入 LTS。新手建議先用 24，Phase 1 開工時若 26 已 LTS 且 Vite 支援，可改用 26。 |
| 建置工具 | **Vite 8** | 2026-03 正式發布，改用 Rolldown 打包。實際版本以 `npm create vite@latest` 產生的為準，不手動指定。 |
| 前端框架 | **React + TypeScript** | 使用 Vite 官方 `react-ts` 範本，版本跟隨範本。 |
| 帳號 | **Supabase Auth** | Email／密碼、密碼重設信。免費方案寄信量有限，正式上線前需設定自訂 SMTP（D-19）。 |
| 資料庫 | **Supabase PostgreSQL** | 所有玩家寫入只透過資料庫函式（RPC）執行，用交易保證扣料、領取、合併的正確性。 |
| 檔案 | **Supabase Storage** | 正式插畫放私有 bucket，以 Storage RLS 檢查解鎖狀態後才能取得簽名網址。 |
| 版本控制 | **Git + GitHub** | 資料庫結構用 migration 檔案管理並進版控。 |
| 部署 | **待決定**（D-18） | 你現有的寄賣平台用 Vercel，可沿用；靜態網站也可用 Netlify、Cloudflare Pages。 |

### Supabase 服務限制（需留意）

- **免費專案 7 天無活動會暫停**，資料保留但網站連不上，需到後台手動恢復。開發期可接受；正式上線建議付費方案。
- 免費方案的資料庫、Storage、流量都有額度（第三方來源數字不一，以 Supabase 官方 pricing 頁為準）。5～10 張 PNG 與少量測試玩家遠低於額度。
- **2026-10-30 起既有專案新表需明確 GRANT** 才能被 supabase-js 存取。本設計已改為「預設不開放、逐表授權」，反而更安全。

> 以上版本與限制資料查核日期為 2026-10-24。

## 2. 系統架構圖

```mermaid
flowchart LR
  subgraph Device["玩家手機瀏覽器"]
    UI["React SPA<br/>（Vite 建置的靜態檔）"]
    LS[("本機儲存<br/>訪客進度 / 快取")]
    CV["Canvas<br/>產生分享卡"]
    UI <--> LS
    UI --> CV
  end

  subgraph Host["靜態網站主機（待定：Vercel 等）"]
    STATIC["HTML / JS / CSS<br/>UI 素材、元素圖示"]
  end

  subgraph SB["Supabase"]
    AUTH["Auth<br/>Email 帳號"]
    API["Data API<br/>（PostgREST）"]
    subgraph PG["PostgreSQL"]
      RPC["遊戲函式（RPC）<br/>craft / claim_daily /<br/>merge_guest / grant_starter"]
      T[("資料表<br/>RLS 全開啟")]
      SECRET[("配方表<br/>前端無權讀取")]
      RPC --> T
      RPC --> SECRET
    end
    subgraph ST["Storage"]
      PRIV[("character-art<br/>私有：正式插畫")]
      PUB[("silhouettes / brand<br/>公開：剪影、Logo")]
      AV[("avatars<br/>私有：玩家頭像")]
    end
  end

  STATIC -->|載入網頁| UI
  UI -->|登入、取得 JWT| AUTH
  UI -->|呼叫 RPC、讀自己的資料| API
  API --> RPC
  API --> T
  UI -->|要求簽名網址<br/>RLS 檢查是否已解鎖| PRIV
  UI -->|直接讀取| PUB
  UI -->|上傳 / 讀取自己的| AV
```

### 關鍵原則

1. **前端不保存任何配方答案**。配方表只有資料庫函式能讀，前端沒有 `SELECT` 權限。
2. **玩家資料表前端只能讀自己的，不能直接寫**。所有加減元素、新增收藏都經由 RPC，在單一交易內完成。
3. **每個寫入 RPC 都帶 `request_id`（前端產生的 UUID）**，伺服器以唯一約束防止重複提交。
4. **日期由伺服器決定**。每日領取用伺服器時間加上設定的時區與重置時間計算，不信任手機時間。
5. **正式插畫只能用短期簽名網址讀取**，簽名前由 Storage RLS 檢查該玩家是否擁有該角色。

## 3. 資料流

### 3.1 製造（已登入）

```mermaid
sequenceDiagram
  autonumber
  participant P as 玩家
  participant UI as 前端
  participant DB as craft() RPC
  P->>UI: 依序投入元素，按「製造」
  UI->>UI: 產生 request_id，鎖定按鈕
  UI->>DB: craft(request_id, 投入序列, 場景僅供紀錄)
  DB->>DB: 若 request_id 已處理過 → 直接回傳上次結果
  DB->>DB: 鎖定該玩家庫存列，檢查數量足夠
  alt 數量不足
    DB-->>UI: 錯誤 INSUFFICIENT（不扣料）
  else 數量足夠
    DB->>DB: 扣除所有投入元素、寫入異動紀錄
    DB->>DB: 以標準化序列比對配方
    alt 成功
      DB->>DB: 新增收藏（已有則不重複）、記錄已發現配方
      DB-->>UI: 成功 + 角色 ID + 新庫存
    else 失敗
      DB-->>UI: 失敗 + 受控線索代碼 + 新庫存
    end
  end
  UI->>P: 播放成功 / 失敗動畫
```

### 3.2 圖鑑讀圖

```mermaid
sequenceDiagram
  participant UI as 前端
  participant API as Data API
  participant ST as Storage
  UI->>API: 讀取圖鑑清單（公開欄位）+ 自己的收藏
  loop 每個角色
    alt 未解鎖
      UI->>ST: 讀公開剪影（可快取）
    else 已解鎖
      UI->>ST: createSignedUrl(character-art/角色ID/full.png)
      ST->>ST: RLS：該玩家收藏中有此角色？
      ST-->>UI: 短期簽名網址（或拒絕）
    end
  end
```

## 4. 頁面流程圖

```mermaid
flowchart TD
  START([開啟網站]) --> SPLASH[載入畫面]
  SPLASH --> CHK{有登入狀態？}
  CHK -- 否 --> WELCOME[歡迎頁<br/>登入 / 註冊 / 以訪客遊玩]
  CHK -- 是 --> FIRST

  WELCOME -->|訪客| TRIAL[試玩模式<br/>練習元素、只看剪影] -->|想保存進度| SIGNUP
  WELCOME -->|登入| LOGIN[登入頁]
  WELCOME -->|註冊| SIGNUP[註冊頁]
  LOGIN -->|忘記密碼| RESET[密碼重設申請]
  RESET --> RESETMAIL[[收信點連結]] --> NEWPW[設定新密碼] --> LOGIN
  SIGNUP --> VERIFY[[Email 驗證，D-19]] --> LOGIN
  LOGIN --> FIRST{首次登入？}

  FIRST -- 是 --> PROFILE_SETUP[設定暱稱、頭像] --> STARTER[領取初始元素]
  FIRST -- 否 --> HOME
  STARTER --> TUTORIAL[新手教學<br/>一步步教南瓜配方] --> NEWCHAR

  HOME[首頁 / 製造所大廳]
  HOME --> CAULDRON[魔女魔法鍋]
  HOME --> BOWL[甜點鋼盆]
  HOME --> DAILY[每日領取頁]
  HOME --> DEX[法鬥圖鑑]
  HOME --> ME[個人資料 / 設定]

  CAULDRON --> RESULT{結果}
  BOWL --> RESULT
  RESULT -- 成功 --> NEWCHAR[新法鬥登場動畫] --> DETAIL
  RESULT -- 失敗 --> FAIL[失敗動畫 + 線索] --> HOME

  DEX --> DETAIL[角色詳情<br/>已解鎖才有正式圖]
  DETAIL --> SHARE[分享<br/>透明 PNG / 收藏卡]

  ME --> EDIT[修改暱稱、頭像]
  ME --> LOGOUT[登出]
  TRIAL -.離開試玩.-> WELCOME
```

## 5. 前端模組規劃（Phase 1 參考，不是程式碼）

| 模組 | 責任 |
|---|---|
| `auth` | 登入狀態、註冊、登入、登出、密碼重設 |
| `progress` | 讀寫雲端進度（只有登入玩家有進度） |
| `workshop` | 兩種場景畫面（可隨時切換，純外觀）、投入序列編輯、送出製造 |
| `dex` | 圖鑑清單、剪影／正式圖切換、簽名網址快取 |
| `daily` | 每日領取狀態與領取 |
| `trial` | 訪客試玩：練習元素、投料動畫，不連線、不保存 |
| `share` | Canvas 合成收藏卡、匯出 PNG |
| `config` | 從資料庫讀取可調整設定（元素清單、上限等公開設定） |
