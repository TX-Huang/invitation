# Dodo 的生日晚餐邀請函（酒紅信封 + 蠟封 + 金光）

網址：<https://tx-huang.github.io/invitation/idodo-invite-3/>

## 改內容

只改 `content.js`：署名、時間、地點、還有「想對你說的話」（一個字串是一段）。

| 檔案 | 是什麼 |
| --- | --- |
| `index.html`、`style.css`、`app.js` | 網頁 |
| `content.js` | 所有文字、時間、地點、心裡話 |
| `art/` | 網頁用的圖 |
| `src/ART-BRIEF.md` | 給 AI 畫圖的清單 |
| `src/compress_art.py` | 把 `src/art/` 的原圖縮小成 `art/` 的 webp：`python idodo-invite-3/src/compress_art.py` |

## 要做到的事（測試在 `tests/idodo-invite-3.test.mjs`）

1. 先看到酒紅浮雕信封，中間蠟封寫「I & D」；點一下（或 Enter、空白鍵）打開。信封關著時後面不能操作。
2. 打開（照參考影片）：金箔玫瑰從蠟封往外一路亮起來再暗下；上蓋掀開；光從封口的縫和蠟封下面透出來、整個信封變成暖金色；光蓋滿畫面再退去。信封移走的時間（`app.js` 的 `OPEN_MS`）等於 `style.css` 的時間，之後卡片的字才出現。
3. 卡片寫「Happy Birthday」、「Dodo」和「2026 年 12 月 12 日（六） 18:30」。
4. 倒數到晚餐時間；過了寫「生日快樂！謝謝你來」。
5. 地點是竹北 Terzo；地圖按鈕搜尋「Terzo 竹北」，有填地址就搜尋地址。
6. 「想對你說的話」照 `content.js` 一段一段排，最後署名。
7. 頁面有 `noindex`。
8. 讀自己的 `content.js`，不是婚禮那份。
9. `style.css` 用到的每一張畫，網頁都會載入。
10. 「減少動態效果」時點信封直接看到卡片。
