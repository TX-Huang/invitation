"""從慈惠道場網站（D:\\My Code\\CihuiWebsite）拿圖，縮小成邀請函用的 webp，放到 ../art/。

用法（在 repo 最上層）：

    python cihui-invite/src/import_cihui_art.py

篆體匾額（plaque-text.webp）是 CC BY-ND 授權：原檔直接複製、不改，網頁上要標示出處。
"""

import shutil
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
SITE = HERE.parents[2] / "CihuiWebsite" / "assets"
OUT = HERE.parent / "art"
QUALITY = 80

# 網站上的檔案 → 這裡的名字、最長邊幾 px（None = 原尺寸）
RESIZE = {
    # the site's soft, misty look (not the oil-painted versions), to match the bluebird
    "bg-yaochi.webp": ("sky", None),
    "intro-clouds.webp": ("clouds", 1100),
    "intro-clouds-2.webp": ("clouds-2", 1100),
    "phoenix2/glow.webp": ("glow", None),
    "phoenix2/rays.webp": ("rays", None),
    "scroll/hang-top.webp": ("scroll-top", 900),
    "scroll/hang-bottom.webp": ("scroll-bottom", 900),
    "scroll/paper-v.webp": ("scroll-paper", None),
    "elements/lotus-open.webp": ("lotus", None),
    "elements/cloud-wisp.webp": ("cloud-wisp", None),
}
# 照原樣複製（授權或已經夠小）
COPY = {
    "plaque-text.webp": "plaque",
    "elements/card-jinmu.webp": "deity-jinmu",
    "elements/card-xuannu.webp": "deity-xuannu",
    "elements/card-nezha.webp": "deity-nezha",
    "elements/card-tudi.webp": "deity-tudi",
}
# 青鳥拍翅圖集：6 欄 × 6 列，每格 300×204，36 格，原尺寸
BIRD = ("birds/bluebird-fly.webp", "bluebird")


def resize(src: Path, out: Path, longest: int | None) -> None:
    img = Image.open(src)
    if longest:
        img.thumbnail((longest, longest), Image.LANCZOS)
    img.save(out, "WEBP", quality=QUALITY, method=6)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    made = []
    for src, (name, longest) in RESIZE.items():
        out = OUT / f"{name}.webp"
        resize(SITE / src, out, longest)
        made.append(out)
    for src, name in COPY.items():
        out = OUT / f"{name}.webp"
        shutil.copyfile(SITE / src, out)
        made.append(out)
    src, name = BIRD
    out = OUT / f"{name}.webp"
    shutil.copyfile(SITE / src, out)
    made.append(out)
    for out in made:
        print(f"art/{out.name}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
