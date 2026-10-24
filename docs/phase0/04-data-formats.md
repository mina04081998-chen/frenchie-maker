# 04｜配方、元素、角色與玩家進度的資料格式

> 所有範例中的元素、角色與數字都是**格式示範**，不是正式設定。

## 1. 元素

```json
{
  "id": "moon_dew",
  "category_id": "liquid",
  "name_zh": "（示範）月光露",
  "icon_path": "elements/moon_dew.png",
  "max_stack": "‹TBD D-02›",
  "is_active": true,
  "sort_order": 10
}
```

## 2. 角色

```json
{
  "id": "fm001",
  "dex_no": 1,
  "name_zh": "（示範角色名）",
  "silhouette_path": "fm001.png",
  "art_path": "fm001/full.png",
  "rarity": null,
  "is_released": true
}
```

- `id` 永不改變、永不重用；`dex_no` 是顯示用編號，畫面格式化為三位數 `001`。
- 前端只會拿到 `id`、`dex_no`、`silhouette_path`，以及已解鎖時的 `name_zh`（依 D-10）。

## 3. 配方

### 3.1 儲存格式（`recipes.steps`）

配方是**有順序的步驟陣列**。每一步指定「什麼元素」與「連續投入幾個」。

```json
{
  "id": "r_fm001_a",
  "character_id": "fm001",
  "steps": [
    { "element": "potato", "qty": 1 },
    { "element": "moon_dew", "qty": 2 },
    { "element": "star_sugar", "qty": 1 },
    { "element": "moon_dew", "qty": 1 }
  ],
  "version": 1,
  "is_active": true
}
```

- **順序**：陣列順序就是投入順序。
- **數量**：`qty` 是連續投入的個數。
- **相同元素可重複投入**：同一元素可在不同步驟再次出現（上例 `moon_dew` 出現兩次）。
- 相鄰兩步不可為同一元素（應合併成一步），由匯入檢查擋下。
- **每個配方至少一步是 `{"element": "potato"}`**（馬鈴薯規則；分類步驟即使可放馬鈴薯也不算）。
- 配方**不含場景**（D-07）：同一份投料在魔法鍋或甜點鋼盆結果完全相同。

### 3.2 分類步驟（D-06 已確認）

某一步可以只要求**元素分類**、不限定哪一個元素：

```json
{ "category": "sweet", "qty": 2 }
```

- 每一步必須擇一填 `element` 或 `category`。
- 分類步驟的 `qty` 是該步連續投入的**同分類元素總數**；同一步內可混用同分類的不同元素（例：`sweet` ×2 可投「糖 + 奶油」）（D-27 已確認）。
- 元素表**不綁場景**：同一份元素庫存兩個場景都能使用。

CSV 寫法：分類步驟以 `@` 開頭，例如 `moon_dew*2|@sweet*2|moon_dew*1`。

### 3.3 玩家投入格式（前端 → `craft()`）

前端送出**逐次投入的原始序列**，伺服器自行整理，不信任前端的整理結果：

```json
{
  "request_id": "6f1c0c5e-....",
  "inputs": ["potato", "moon_dew", "moon_dew", "star_sugar", "moon_dew"],
  "scene_id": "cauldron"
}
```

`scene_id` 只是記錄玩家當時用哪個場景，伺服器比對時**完全不看**。

### 3.4 比對方式：逐格比對

1. 把配方步驟**展開成格位**：每個 `qty` 展開成一格。
   `potato*1|@cream*1|pumpkin*2` → `[potato, @cream, pumpkin, pumpkin]`
2. 玩家投入序列的長度必須**等於**格位數。
3. 逐格比對：元素格必須是同一個元素；分類格只要該元素屬於這個分類即可。
4. 全部格位都符合 → 成功。只有配方表中的啟用配方會被比對，第一版配方少，逐一比對即可。
5. 展開後的字串（例 `potato|@cream|pumpkin|pumpkin`）存為 `match_key`，用來防止重複配方。

示範（用第一批草案 fm005）：

| 投入 | 結果 | 原因 |
|---|---|---|
| 馬鈴薯、奶油、南瓜、南瓜 | 成功 | 第 2 格奶油屬奶油色系 |
| 馬鈴薯、馬鈴薯、南瓜、南瓜 | 成功 | 第 2 格馬鈴薯也屬奶油色系 |
| 奶油、馬鈴薯、南瓜、南瓜 | 失敗 | 第 1 格必須是馬鈴薯 |
| 馬鈴薯、奶油、南瓜 | 失敗 | 數量不對 |

**重疊檢查**：含分類格的配方可能和另一個配方「同時符合」同一份投料。匯入工具會逐對檢查，發現重疊就**擋下匯入**並列出，由你調整配方，遊戲中不會出現模稜兩可的結果。

> 結果：`A A B A` 與 `A B A A` 是不同配方（順序不同）；`A A B` 與 `A B` 不同（數量不同）。

### 3.5 製造回傳格式

```json
{
  "request_id": "6f1c0c5e-....",
  "success": false,
  "character_id": null,
  "is_new": null,
  "hint": { "code": "‹TBD D-11›", "message_zh": "‹TBD D-11›" },
  "inventory": { "moon_dew": 0, "star_sugar": 3 }
}
```

### 3.6 失敗線索欄位

| 欄位 | 說明 |
|---|---|
| `code` | 線索代碼，前端用來選擇動畫或圖示 |
| `message_zh` | 顯示文字 |

伺服器只回傳**受控的**線索，例如「方向接近」「元素種類不對」之類的模糊提示，**永遠不回傳正確配方或差幾個**。線索種類與判斷條件待 D-11。

## 4. 玩家進度

### 4.1 雲端（已登入，由多張表組成，前端讀取後組成此格式）

```json
{
  "profile": { "nickname": "...", "avatar_path": "..." },
  "inventory": { "moon_dew": 3, "star_sugar": 1 },
  "collection": [
    { "character_id": "fm001", "first_unlocked_at": "2026-11-01T10:00:00Z", "craft_count": 1 }
  ],
  "discovered_recipes": ["r_fm001_a"],
  "starter_granted": true,
  "today_claimed": false
}
```

### 4.2 本機訪客存檔

**不需要**（D-24：訪客純試玩、沒有進度）。試玩狀態只存在記憶體中，關閉網頁即消失。
