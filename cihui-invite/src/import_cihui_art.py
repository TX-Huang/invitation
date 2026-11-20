"""從慈惠道場網站（D:\\My Code\\CihuiWebsite）拿四位神尊的圖，放到 ../art/。

用法（在 repo 最上層）：

    python cihui-invite/src/import_cihui_art.py
"""

import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
SITE = HERE.parents[2] / "CihuiWebsite" / "assets"
OUT = HERE.parent / "art"

# 網站上的檔案 → 這裡的名字（照原樣複製，已經夠小）
COPY = {
    "elements/card-jinmu.webp": "deity-jinmu",
    "elements/card-xuannu.webp": "deity-xuannu",
    "elements/card-nezha.webp": "deity-nezha",
    "elements/card-tudi.webp": "deity-tudi",
}


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for src, name in COPY.items():
        out = OUT / f"{name}.webp"
        shutil.copyfile(SITE / src, out)
        print(f"art/{out.name}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
