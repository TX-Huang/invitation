"""把 AI 做的「布幕拉開」影片壓成網頁用的檔案。

用法（在 repo 最上層）：

    python idodo-invite-2/src/make_curtain.py                  # 用 src/art/curtain-open.mp4
    python idodo-invite-2/src/make_curtain.py path/to/other.mp4 # 用別的檔案

會產生：
- art/curtain-open.mp4   720×1280、H.264、沒有聲音、可以邊下載邊播
  （海報用 art/stage-closed.webp，就是影片的第一格）

需要 ffmpeg。
"""

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_SRC = HERE / "art" / "curtain-open.mp4"
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
    video = OUT / "curtain-open.mp4"
    run("-i", str(src), "-vf", f"{FIT},format=yuv420p", "-an",
        "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-movflags", "+faststart", str(video))
    print(f"{video.relative_to(OUT.parent)}  {video.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
