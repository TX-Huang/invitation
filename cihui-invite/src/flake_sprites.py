"""Cut the gold-leaf flakes out of the batch-4 sheets into one sprite sheet for the canvas.

Each source sheet (2048 x 1536, transparent) holds 12 flakes in a 4 x 3 grid. Every flake is trimmed to its own
outline and scaled to fill a 256 px cell, so the page can draw any flake at a known size.
Run: python flake_sprites.py  ->  art/paper/gold-flakes-sprites.png (8 x 3 cells, 2048 x 768)
"""
from pathlib import Path

from PIL import Image

HERE = Path(__file__).parent / 'art' / 'paper'
SOURCES = ['gold-flakes-v1-cut.png', 'gold-flakes-v3-cut.png']
CELL = 256
FILL = 236  # the flake's longer side, so a little air is left around it


def flakes(path):
    im = Image.open(path).convert('RGBA')
    cw, ch = im.width // 4, im.height // 3
    for i in range(12):
        cell = im.crop(((i % 4) * cw, (i // 4) * ch, (i % 4 + 1) * cw, (i // 4 + 1) * ch))
        box = cell.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
        if box:
            yield cell.crop(box)


def main():
    out = [f for name in SOURCES for f in flakes(HERE / name)]
    cols = 8
    rows = (len(out) + cols - 1) // cols
    sheet = Image.new('RGBA', (cols * CELL, rows * CELL), (0, 0, 0, 0))
    for i, f in enumerate(out):
        k = FILL / max(f.size)
        f = f.resize((max(1, round(f.width * k)), max(1, round(f.height * k))), Image.LANCZOS)
        x = (i % cols) * CELL + (CELL - f.width) // 2
        y = (i // cols) * CELL + (CELL - f.height) // 2
        sheet.alpha_composite(f, (x, y))
    sheet.save(HERE / 'gold-flakes-sprites.png')
    print(f'{len(out)} flakes -> gold-flakes-sprites.png {sheet.size}')


if __name__ == '__main__':
    main()
