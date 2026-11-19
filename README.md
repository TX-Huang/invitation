# 電子邀請卡

每張邀請卡放在自己的資料夾，網址就是資料夾名字：

```
https://tx-huang.github.io/invitation/<資料夾名字>/
```

| 資料夾 | 網址 | 是什麼 |
| --- | --- | --- |
| `yunan-invite/` | <https://tx-huang.github.io/invitation/yunan-invite/> | 侯畇安 週歲派對（2026/9/28） |

給朋友的專屬連結在網址後面加 `?to=名字`，例如：

```
https://tx-huang.github.io/invitation/yunan-invite/?to=林小美
```

## 新增一張邀請卡

1. 開一個新資料夾，名字照 `xxxx-invite` 的格式。
2. 資料夾裡要有 `index.html`，網站會讀這個檔。
3. 推上 GitHub，一兩分鐘後 `https://tx-huang.github.io/invitation/xxxx-invite/` 就能打開。
4. 在上面的表格加一行。

每張卡怎麼改，看那個資料夾裡的 `README.md`。

## 推上去

```bash
git add -A && git commit -m "改了什麼" && git push
```

網站由 GitHub Pages 從 `main` 分支的最上層發佈，推上去就會自動更新。
