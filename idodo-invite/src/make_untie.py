"""把 AI 做的「解開蝴蝶結」影片壓成網頁用的檔案。

用法（在 repo 最上層）：

    python idodo-invite/src/make_untie.py                     # 用 src/video/untie.mp4
    python idodo-invite/src/make_untie.py path/to/other.mp4   # 用別的檔案

會產生：
- art/untie.mp4          720×1280、H.264、沒有聲音、可以邊下載邊播
- art/untie-poster.webp  影片的第一格；還沒點信封時，客人看到的就是這張

需要 ffmpeg。
"""

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_SRC = HERE / "video" / "untie.mp4"
OUT = HERE.parent / "art"
SIZE = "720:1280"
# fill the 9:16 frame, cutting the overflow evenly on both sides
FIT = f"scale={SIZE}:force_original_aspect_ratio=increase,crop={SIZE},setsar=1"


def run(*args: str) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    if not src.exists():
        sys.exit(f"找不到影片：{src}")
    video = OUT / "untie.mp4"
    poster = OUT / "untie-poster.webp"
    run("-i", str(src), "-vf", f"{FIT},format=yuv420p", "-an",
        "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-movflags", "+faststart", str(video))
    run("-i", str(video), "-frames:v", "1", "-quality", "82", str(poster))
    for out in (video, poster):
        print(f"{out.relative_to(OUT.parent)}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
