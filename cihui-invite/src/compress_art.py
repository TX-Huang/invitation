"""把 src/art/paper/ 裡挑好的原圖，縮小壓成網頁用的 webp，放到 ../art/。

用法（在 repo 最上層）：

    python cihui-invite/src/compress_art.py

原圖很大、不放上 GitHub；網頁只讀 art/ 裡壓過的 webp。
先跑 seal.py（做印章）和 flake_sprites.py（切金箔），它們的輸出也在 src/art/paper/。
"""

from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE / "art" / "paper"
OUT = HERE.parent / "art"


def lighten_mist(img: Image.Image) -> Image.Image:
    """The mist's faint edges came out grey, which reads as a smudge on ivory: keep how see-through it is,
    but move its colour most of the way to white."""
    a = np.asarray(img.convert("RGBA")).astype(float)
    rgb = 255 - (255 - a[..., :3]) * 0.3
    return Image.fromarray(np.dstack([rgb, a[..., 3]]).clip(0, 255).astype(np.uint8), "RGBA")


# web name: (source picture, (max width, max height), quality, extra step)
PICKS = {
    "cloud-front": ("cloud-front-v2-cut.png", (1024, 2304), 84, None),
    "cloud-mid": ("cloud-mid-v1-cut.png", (1024, 2304), 82, None),
    "cloud-back": ("cloud-back-v3-cut.png", (1024, 2304), 82, None),
    "paper": ("paper-ivory-v1.png", (1080, 1920), 78, None),
    "gold-foil": ("gold-foil-v1.png", (600, 600), 82, None),
    "gold-flakes": ("gold-flakes-sprites.png", (1024, 384), 86, None),
    "seal-ink": ("seal-cihui-ink.png", (2304, 288), 86, None),
    "seal-slip": ("seal-slip.png", (512, 512), 86, None),
    "seal": ("seal-cihui.png", (384, 384), 86, None),
    "mist-1": ("mist-v1-cut.png", (1400, 700), 80, lighten_mist),
    "mist-2": ("mist-v2-cut.png", (1400, 700), 80, lighten_mist),
    "mist-3": ("mist-v3-cut.png", (1400, 700), 80, lighten_mist),
}


def compress(name: str, source: str, box: tuple[int, int], quality: int, step) -> Path:
    img = Image.open(SRC / source)
    img = img.convert("RGBA") if "A" in img.getbands() else img.convert("RGB")
    if step:
        img = step(img)
    img.thumbnail(box, Image.LANCZOS)
    out = OUT / f"{name}.webp"
    img.save(out, "WEBP", quality=quality, method=6)
    return out


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for name, (source, box, quality, step) in PICKS.items():
        out = compress(name, source, box, quality, step)
        size = Image.open(out).size
        print(f"{source} -> art/{out.name}  {size[0]}x{size[1]}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
