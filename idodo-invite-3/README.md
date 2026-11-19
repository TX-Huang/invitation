# Isaac & Dodo 婚禮邀請卡（第三版：酒紅信封 + 蠟封 + 金光）

網址：<https://tx-huang.github.io/invitation/idodo-invite-3/>（`?to=名字`、`?lang=en`、`?host` 跟第一版一樣）

文字、日期、地點、故事、流程都跟第一版**共用** `../idodo-invite/content.js`。

| 檔案 | 是什麼 |
| --- | --- |
| `index.html`、`style.css`、`app.js` | 網頁 |
| `art/` | 網頁用的圖 |
| `src/ART-BRIEF.md` | 給 AI 畫圖的清單 |
| `src/compress_art.py` | 把 `src/art/` 的原圖縮小成 `art/` 的 webp：`python idodo-invite-3/src/compress_art.py` |

## 要做到的事（測試在 `tests/idodo-invite-3.test.mjs`）

1. 先看到酒紅浮雕信封，中間蠟封寫「I & D」；點一下（或 Enter、空白鍵）打開。信封關著時後面不能操作。
2. 蠟封掀起、金箔玫瑰亮起、上蓋打開透出金光、兩邊和下面的蓋往外翻、金光蓋滿畫面再退去；信封移走的時間（`app.js` 的 `OPEN_MS`）等於 `style.css` 的時間，之後卡片上的日期和名字才出現。
3. `?to=` 寫名字；沒有就寫「親愛的朋友」。
4. 中文／English 切換；`?lang=en` 一打開就是英文。
5. 日期 `null`：卡片寫「日期即將公布」，倒數寫「日期確定後就開始倒數」。
6. 日期有填：倒數天：時：分：秒；過了寫「我們結婚啦！」。
7. 流程照 `content.js` 排；線上有一朵玫瑰，跟著往下滑沿著線移動。
8. 地址 `null` 不顯示地圖；有填就連 Google 地圖。
9. `?host` 產生專屬連結；客人看不到。
10. 頁面有 `noindex`。
11. 讀第一版的 `content.js`。
12. `style.css` 用到的每一張畫，網頁都會載入。
13. 「減少動態效果」時點信封直接看到卡片。
