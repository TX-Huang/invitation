"""把 src/art/ 裡 AI 畫的大圖，縮小壓成網頁用的 webp，放到 ../art/。

用法（在 repo 最上層）：

    python cihui-invite/src/compress_art.py

原圖很大、不放上 GitHub；網頁只讀 art/ 裡壓過的 webp。
"""

from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE / "art"
OUT = HERE.parent / "art"

# 檔名開頭 → 最長邊幾 px。沒列到的用 DEFAULT。
SIZES = {
    "heaven": 1920,
    "letter": 1600,
    "yaochi": 1920,
    "cloud-band": 1200,
    "peach-branch": 900,
    "lotus-pond": 1200,
    "envelope-back": 1920,
    "env-foil": 1440,
    "env-inside": 1280,
    "seal-red": 600,
}
DEFAULT = 1200
QUALITY = 80


def longest_side(name: str) -> int:
    for prefix, size in SIZES.items():
        if name.startswith(prefix):
            return size
    return DEFAULT


def trim(img: Image.Image) -> Image.Image:
    """See-through pictures: cut away the empty border so CSS 'contain' sizes the drawing itself."""
    box = img.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    return img.crop(box) if box else img


def compress(path: Path) -> Path:
    img = Image.open(path)
    img = trim(img.convert("RGBA")) if "A" in img.getbands() else img.convert("RGB")
    img.thumbnail((longest_side(path.stem),) * 2, Image.LANCZOS)
    out = OUT / f"{path.stem}.webp"
    img.save(out, "WEBP", quality=QUALITY, method=6)
    return out


def main() -> None:
    OUT.mkdir(exist_ok=True)
    sources = sorted(p for p in SRC.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"})
    if not sources:
        print("src/art/ 裡沒有圖")
        return
    for path in sources:
        out = compress(path)
        print(f"{path.name} -> art/{out.name}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
