# 慈惠道場 堂慶 邀請函：要畫的圖

給 AI Video session 照著做。網頁由「其他分頁邀請卡」session 負責，這裡只要做圖。

> **2026-11-20：請直接跳到最下面的「第四批：紙雕雲開」。** 第一到三批（青鳥、信封、瑤池、桃花、蓮花、分鏡）的風格使用者都不要了，第三批分鏡也取消，不用再畫。下面的「風格」段只適用前三批。

- 網頁在 `D:\My Code\Invitation\cihui-invite\`，網址 https://tx-huang.github.io/invitation/cihui-invite/
- **花點數之前：先估總共要多少點數，給使用者看，等他說 OK 再做。** 能用本機免費模型就用。
- 故事是「青鳥傳書」：瑤池金母的信差青鳥，從雲海飛來，叼著一封信送到你面前。
- 使用者要求：**格調要跟前三張婚禮邀請卡一樣高**，風格跟慈惠道場網站一致，但要完全的神話感。
- 不要文字、不要字母、不要浮水印、不要人、不要手。要原創。

## 風格（每張都一樣）

- 跟慈惠道場網站一樣：**柔和的仙境寫實**——淡淡的霧、粉金色的晨光、空氣感很重，像清晨的雲海。參考 `D:\My Code\CihuiWebsite\assets\bg-yaochi.webp`（瑤池）和 `intro-clouds.webp`（雲）。
- 顏色：象牙白、霧灰藍、晨光淡粉、香檳金，一點點青瓷綠（配那隻青鳥 `D:\My Code\CihuiWebsite\assets\birds\bluebird-fly.webp`），極少量的朱砂紅。
- 高級、安靜、留白多。不要卡通、不要飽和的大紅大綠。

## 檔案

存到 `D:\My Code\Invitation\cihui-invite\src\art\`，檔名照下面。PNG，寬至少 1080 px（小圖至少 720 px）。「去背」= 透明背景 PNG。

| # | 檔名 | 比例 | 內容 |
| --- | --- | --- | --- |
| 1 | `heaven.png` | 直式 9:16（1080×1920） | 開場的天空：清晨的雲海，遠方雲上隱約浮著幾座天宮樓閣（很淡、在霧裡），上方中間有柔和的金色光芒灑下來。**畫面中間大約 30%–75% 要安靜**（青鳥和信會在這裡）。 |
| 2 | `letter.png` | 直式 1:2（800×1600） | **一封中式直式信封的正面**，正面俯視、擺正：象牙白的灑金宣紙（有細細的金箔點），上下兩端有很淡的燙金祥雲紋，**正中間一個細細的朱紅色長方框，框裡空白**（網頁會寫名字）。紙邊有一點點柔和的厚度和陰影。去背。 |
| 3 | `yaochi.png` | 直式 9:16（1080×1920） | 卷軸後面的背景：霧中的瑤池，水面平靜有倒影，下方有幾片荷葉和兩三朵金色蓮花，左上角伸進一枝粉色桃花，柔和的金光。**中間 15%–85% 要安靜**（要掛一幅卷軸）。 |
| 4 | `cloud-band.png` | 橫式 6:1 | 一條橫的**燙金祥雲**裝飾帶（傳統如意雲紋，細緻、有金屬光澤），當分隔線用。去背。 |
| 5 | `peach-branch.png` | 橫式 3:2 | 一枝桃花：細緻的工筆畫風，淡粉花瓣、幾顆花苞、一兩片嫩葉，往右下伸。去背。 |
| 6 | `lotus-pond.png` | 橫式 3:2 | 頁尾：霧中的瑤池，幾朵金色蓮花和荷葉，水面平靜。**上緣要平順地淡出成象牙白 #ECE8E3**。 |

### 第二批：滿版的神話信封（2026-11）

使用者看了說「信封也太醜」，要跟前三張婚禮卡一樣：**信封佔滿整個手機畫面**，打開是重頭戲。網頁會用 CSS 把第 7 張切成四片蓋子（跟第三版的酒紅信封一樣做法），所以第 7 張**不要畫折線、不要畫印**。

| # | 檔名 | 比例 | 內容 |
| --- | --- | --- | --- |
| 7 | `envelope-back.png` | 直式 9:16（1080×1920） | 整面的信封紙：象牙白宣紙，灑細細的金箔；整面平均分布**燙金祥雲紋**，夾一些淡青瓷色的刺繡祥雲和幾朵小桃花；有一點點紙的纖維和柔光。**整張平均，沒有特別的重點**，沒有折線、沒有印、沒有字。 |
| 8 | `env-foil.png` | 直式 9:16（1080×1920） | **去背**。比較大朵、比較亮的燙金祥雲和桃花枝，沿著畫面**左邊和右邊**從上到下長，中間大約 40% 空著。這層疊在第 7 張上面，打開信封時會從中間往外一路亮起來。 |
| 9 | `seal-red.png` | 正方形 | 一顆**朱砂紅的蠟封**，邊緣自然融化的不規則圓形，外圈有一圈很細的金色祥雲浮雕，**中間是平的空白**（網頁會放「慈惠」）。正面俯視。去背。 |
| 10 | `env-inside.png` | 直式 9:16（1080×1920） | 信封裡面的襯紙：淡淡的蜜桃金色絲綢，有很淡的雲紋，中間偏亮（像裡面有光）。 |

### 第三批：分鏡「雲開見瑤池」（2026-11-19）

使用者看了信封版、捲軸版都說不好看、打開不震撼。新方向：**全螢幕的電影感開場**，之後會做成一段影片（像第 1 張婚禮卡解緞帶那樣）。這一批**先只做分鏡圖**，給使用者看了點頭才做影片。

故事：一開始整個手機畫面都是厚厚的雲 → 輕觸 → 雲往左右翻開，中間金光爆開 → 鏡頭穿過去 → 雲散了，是瑤池全景，天上一圈很大的金色光暈（象徵瑤池金母，**不畫人**）。

這三張之後會當影片的**起始／結束畫格**，所以：

- **同一個鏡頭、同一個時間、同一組顏色**，看起來像同一支影片的三個瞬間。
- A 和 B 的雲要是**同一片雲**（B 只是雲往兩邊推開）。
- 直式 9:16，1080×1920 PNG。不要門、不要宮殿樓閣、不要牌坊（慈惠是道場，不是廟）。不要人、不要手、不要字。

存到 `D:\My Code\Invitation\cihui-invite\src\art\storyboard\`：

| # | 檔名 | 內容 |
| --- | --- | --- |
| A | `sb-a-clouds.png` | **滿版的雲**：鏡頭在雲海裡面，近處是又厚又軟的雲，一層一層疊到畫面四邊都是雲，幾乎看不到天空。雲的後面中央透出一點淡粉金色的光（暗示裡面有東西）。遠方正中間有一隻很小的青鳥（青瓷藍綠色，像 `D:\My Code\CihuiWebsite\assets\birds\bluebird-fly.webp`）往鏡頭飛來。安靜、神秘、有期待感。 |
| B | `sb-b-parting.png` | **雲開的那一刻**（整支影片最震撼的畫面）：跟 A 同一片雲，往左右兩邊翻開，像兩道雲做的簾子；中間裂開一條直的大縫，**很亮的金色光從縫裡爆出來**，光芒放射、有細細的金粉在飄。縫的深處隱約看得到遠方的瑤池水面。請做**兩個版本**：`sb-b-parting.png`（縫比較窄、光比較集中）和 `sb-b-parting-2.png`（縫開得比較大、光比較滿）。 |
| C | `sb-c-yaochi.png` | **雲散之後的瑤池全景**：霧中平靜的湖面，有倒影；前景幾片荷葉、兩三朵金色蓮花；左上角伸進一枝粉色桃花；遠方淡淡的山；畫面上方正中間一圈**很大、很柔的金色光暈**（像神聖的光環，不是太陽）。畫面邊緣還留一些散開的雲絲，跟 B 接得上。**中間 20%–80% 要安靜**（會放邀請的大字）。 |

## 做完之後

- 不要動 `D:\My Code\Invitation` 裡其他檔案，也不要動 `D:\My Code\CihuiWebsite`。
- 跟「其他分頁邀請卡」session 說做好了，列出每個檔名；有失敗或跳過的也要說。

### 第四批：紙雕雲開（2026-11-20）

使用者看了一段用 CSS 畫的樣片，說**顏色對了，但素材和動畫太粗糙**：
- 雲是平的向量圓圈。
- 捲紋是電腦畫的螺旋。
- 沒有紙的質感。
- 金色是平塗的。

所以這一批要**像實物拍出來的高級紙藝**。網頁要從「向量插圖」變成「精品文具攝影」。

**感覺**：
- 精品品牌的新春紙雕櫥窗，例如 Hermès、Aesop。
- 高級婚禮喜帖的燙金紙。
- 象牙白、香檳金，一點朱砂紅。
- 安靜、留白多、雅致。
- **不要**傳統民俗風、卡通、石膏浮雕感、塑膠感。

**動畫會怎麼用**（讓你知道為什麼要這樣畫）：
1. 一開始，左右各三層紙雕雲在畫面中間合起來。
2. 中間一顆朱砂印蓋在兩邊雲的接縫上，叫做騎縫印。
3. 輕觸後，印裂成兩半，三層雲往左右飛開，越前面的越快。
4. 中間金光和金箔飛出來。
5. 最後是象牙白的紙，上面有金箔圓環和「堂慶」兩個字。

#### 規則（每張都一樣）

- 模型：本機 FLUX，0 點數。
- 每個項目畫 3 個版本；雲的三層各畫 4 個。檔名加 `-v1`、`-v2`…，全部留著，我來挑。
- **畫面裡絕對不要有字、字母、符號、浮水印、人、手。** FLUX 不吃負面提示詞，所以下面的提示詞都寫成正面的「紙上完全空白」。畫完請自己檢查一次，有字的就重畫。
- 下面的英文提示詞請**整段照用**。可以微調措辭讓模型更聽話，但每一項描述都要留著。
- 存到 `D:\My Code\Invitation\cihui-invite\src\art\paper\`（新資料夾）。原圖 PNG 全部保留。
- 「去背」= 另存一份 `-cut.png`，背景透明。
- 去完背，放在象牙白 `#FAF7F1` 和深灰 `#2E3439` 上各看一次。邊緣不能有黑邊或白邊。

#### 1–3. 三層紙雕雲（最重要）

只畫**左邊**那一半。右邊網頁會左右翻轉來用，所以光要**從正上方**打下來，翻過來才不會穿幫。

三層是同一張紙、同一個光、同一種金，只差雲朵大小。

**做法建議**：
1. 先畫 1（前層），挑一張最好的。
2. 如果你的 FLUX 能吃參考圖，畫 2、3 時把它當參考圖，讓紙質、光線、金色一模一樣。

**畫布**：
- 1024×2304，直式，大約 4:9。
- 紙從畫面左邊鋪滿。
- 雲朵的切邊在右側，由上往下一整條。
- 切邊右邊是平的深灰底，方便去背。
- 三張都要去背（`-cut.png`）。

| # | 檔名 | 雲朵 | 紙色 | 金 | 切邊位置（佔畫面寬度） |
| --- | --- | --- | --- | --- | --- |
| 1 | `cloud-front-v1..v4.png` | 5 朵大雲，每朵尾巴往內捲成如意捲 | 最亮 `#FAF7F1` | 每朵大雲裡一條燙金捲紋；整條切邊描一條極細的金線 | 雲尖約 85%；雲和雲之間凹進去的地方約 60% |
| 2 | `cloud-mid-v1..v4.png` | 8 朵中雲，大小交錯 | 稍暖 `#F2ECE2` | 切邊一條極細金線；只有 2–3 朵有小捲紋 | 雲尖約 85%；凹處約 70% |
| 3 | `cloud-back-v1..v4.png` | 12–14 朵小雲，圓潤、簡單 | 再深一點 `#EAE3D6` | 不要金 | 雲尖約 85%；凹處約 76% |

**1 的提示詞**（2、3 用同一段，只把方括號裡的換掉）：

```
Studio product photograph of a single tall sheet of luxurious heavy cotton-rag paper in warm ivory (close to #FAF7F1), hand-cut into a refined modern paper sculpture. The sheet covers the left part of a tall portrait frame and runs off the top, bottom and left edges of the image. Its right-hand edge is cut, from the very top of the frame to the very bottom, into [five large] elegant Chinese auspicious cloud lobes (xiangyun, ruyi clouds): each lobe is a soft rounded scallop whose tip turns back into a graceful inward spiral, the lobes vary in size and overlap one another in a calm flowing rhythm, a refined contemporary reinterpretation of the classical cloud motif, never cartoon bubbles and never a row of identical circles. [Each large lobe is gently domed in low relief with soft shading in its hollows, and carries one fine hot-stamped champagne-gold foil line that follows the spiral of its curl. A single hairline of gold foil traces the entire cut edge.] The cut edge shows the real thickness of the paper as a thin bright rim. Matte surface with a soft tooth and faint visible cotton fibres. Soft, diffuse, high-key studio light from directly above, gentle and even, no harsh shadows. Luxury stationery photography, the quality of a Hermes or Aesop paper-art window display, razor sharp, photographed perfectly straight-on with no perspective. Everything to the right of the cut edge is a flat, uniform, matte dark slate-grey background (#2E3439) with no shadow, no gradient and no texture. The paper itself is completely blank apart from the gold foil lines.
```

**2（中層）要換的地方**：
- 第一個方括號 → `eight medium-sized`
- 第二個方括號 → `The lobes are gently domed in low relief. A single hairline of champagne-gold foil traces the entire cut edge, and only two or three of the lobes carry a small hot-stamped gold-foil spiral.`
- 紙色 → `#F2ECE2`

**3（後層）要換的地方**：
- 第一個方括號 → `twelve to fourteen small, simple, softly rounded`
- 第二個方括號 → `The lobes are nearly flat with only a whisper of relief, and there is no gold at all on this sheet.`
- 紙色 → `#EAE3D6`

**自己先檢查**：
- 切邊是一整條，從上到下都有。
- 雲是「如意雲」，不是泡泡。
- 紙看得到纖維和厚度。
- 右邊的底是乾淨的平灰色。

#### 4. 打開後的底紙 `paper-ivory-v1..v3.png`

直式 1080×1920，不用去背。

```
Flat-lay macro photograph of a large sheet of fine handmade ivory paper (warm ivory, close to #FBF8F2) filling the whole frame from edge to edge. Very subtle long cotton and mulberry fibres, faint natural mottling, and a sparse scattering of tiny genuine gold-leaf flecks (Chinese sajin paper): only a few dozen flecks across the whole sheet, most no bigger than a grain of rice, spread unevenly and calmly. Perfectly even, soft, shadowless light, no vignette, no folds, no creases, no objects, completely blank paper. The calm, luxurious paper of a high-end wedding invitation.
```

**自己先檢查**：
- 整張亮度平均，四個角不能比較暗。
- 金點很少、很小，不要變成滿滿的金粉。

#### 5. 金箔質感 `gold-foil-v1..v3.png`

正方形 1024×1024，不用去背。網頁會把它「填」進圓環、細線和來賓名字裡，讓金色像真的金屬，不是平塗。

```
Macro photograph of a flat sheet of genuine champagne gold leaf (warm gold, mid-tones around #CFAE6B) filling the whole frame from edge to edge. Fine natural crinkles and a soft hammered texture, a delicate brushed sheen, gentle highlights rolling across the surface from the upper left, a few slightly deeper amber creases for depth. Soft studio light, rich but restrained, no harsh glare, no hot spots, no objects, and no edge of the sheet visible.
```

**自己先檢查**：
- 不能太黃，也不能太橘。
- 亮和暗的差別要溫和。縮成一條細線時，還要看得出是金。

#### 6. 金箔碎片 `gold-flakes-v1..v3.png`

橫式 2048×1536，要去背（`-cut.png`）。網頁會一片一片切下來，當飛舞的金箔。

```
Studio macro photograph of twelve separate flakes of genuine 24k gold leaf floating on a pure black background (#000000), arranged in a loose four-by-three grid with generous black space around each one so that no two flakes touch. Every flake is different: torn irregular squares, slender slivers, flakes curling up at one edge, small crumpled fragments. They are extremely thin and delicate, with fine crinkles and wrinkles that catch the light, warm champagne gold with bright pale-gold highlights and a few deeper amber creases. Soft light from the upper left, every flake in sharp focus, no motion blur, no glow, no sparkles, no dust.
```

**自己先檢查**：
- 12 片都分開，沒有碰在一起。
- 去背後，薄薄的金箔邊不要被吃掉。
- 皺摺的暗處不要變成破洞。

#### 7. 朱砂印 `seal-ink-v1..v3.png`

正方形 1024×1024。**白底，不用去背。** 網頁會用「色彩增值」疊上去，白色會自己消失。「慈惠道場」四個字由網頁自己挖（右行慈惠、左行道場）。

```
Close-up photograph of a single traditional Chinese seal impression stamped in rich cinnabar seal paste (yinni, vermilion around #B23A2C) on smooth bright white paper, seen perfectly straight-on and centred, the impression filling about seventy percent of the frame. The impression is one solid square block of red with slightly rounded, softly chipped corners and a faintly irregular hand-pressed edge, as if a stone seal was pressed by hand. Its surface shows the true texture of seal paste: fine granular mottling, slight variations in density, tiny white specks where the paste did not take, and a subtly darker rim. The square is completely solid red, with no characters, no symbols and no carved border inside it. Plain white paper all around, soft even light.
```

**自己先檢查**：
- 紅色是沉穩的朱砂，不是亮紅，也不是粉紅。
- 方塊裡**完全沒有字或花紋**。
- 四周是乾淨的白。

#### 做完之後

- 跟「invitation」session 說做好了，列出每個檔名。
- 有畫不好、重畫很多次還是不行的，也照實說。
- 不要動 `D:\My Code\Invitation` 裡其他檔案。
