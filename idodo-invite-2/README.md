# Isaac & Dodo 婚禮邀請卡（第二版：拉門 + 舞台布幕）

網址：<https://tx-huang.github.io/invitation/idodo-invite-2/>

| 網址 | 看到什麼 |
| --- | --- |
| `.../idodo-invite-2/` | 通用版，寫「親愛的朋友」 |
| `.../idodo-invite-2/?to=林小美` | 寫「親愛的 林小美」 |
| `.../idodo-invite-2/?lang=en` | 一打開就是英文 |
| `.../idodo-invite-2/?host` | 產生專屬連結的工具 |

## 改內容

文字、日期、地點、故事、流程都跟第一版**共用** `../idodo-invite/content.js`。改那一個檔，兩張卡一起變。

## 檔案

| 檔案 | 是什麼 |
| --- | --- |
| `index.html` | 網頁骨架 |
| `style.css` | 樣子和動畫 |
| `app.js` | 開拉門、拉布幕、換名字、換語言、倒數、流程、連結工具 |
| `art/` | 網頁用的圖和布幕影片 |
| `src/ART-BRIEF.md` | 給 AI 畫圖的清單 |
| `src/art/` | AI 畫的原圖和布幕影片，很大，不放上 GitHub |
| `src/compress_art.py` | 把原圖縮小成 `art/` 的 webp：`python idodo-invite-2/src/compress_art.py` |
| `src/make_curtain.py` | 把布幕影片壓成 `art/curtain-open.mp4`：`python idodo-invite-2/src/make_curtain.py` |

## 要做到的事（測試在 `tests/idodo-invite-2.test.mjs`）

1. 打開網址先看到兩扇深色拉門，中間一塊名牌寫「I & D」；點一下（或按 Enter、空白鍵）拉門往左右滑開。拉門關著時，後面的頁面不能操作。
2. 拉門滑開（1.6 秒）後，舞台的布幕拉開：播布幕影片；影片不能播就改成畫出來的布幕拉開；影片卡住也會照樣打開。布幕開了，新人名字和日期才出現。
3. 網址有 `?to=林小美` 就寫「親愛的 林小美」；沒有就寫「親愛的朋友」。
4. 右上角可以切換中文／English；`?lang=en` 一打開就是英文。
5. 日期是 `null`：舞台寫「日期即將公布」，倒數寫「日期確定後就開始倒數」。
6. 日期有填：三個圓形徽章倒數天、時、分；日期過了改寫「我們結婚啦！」。
7. 當天流程照 `content.js` 排成時間軸，每段有圖示、時間、名稱。
8. 地址是 `null` 不顯示「查看地圖」；有填就連到 Google 地圖。
9. `?host`：不用開拉門，貼上名字產生專屬連結；客人看不到這個工具。
10. 頁面有 `noindex`。
11. 讀的是第一版的 `content.js`，改一次兩張都變。
12. `style.css` 用到的每一張畫（`.art-名字`），網頁都會載入 `art/名字.webp`。
13. 系統設定「減少動態效果」時，動畫關掉，點拉門直接看到名字。
