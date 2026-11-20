"""The 慈惠道場 seal: a white-character (白文) cinnabar seal built from the batch-4 ink print.

The four characters sit in a 2 x 2 grid read right column first (慈惠 | 道場). Each glyph is cut to its own ink
outline and fitted to the centre of its cell, so the block is centred to the pixel. The edges are roughened like
carved stone, the ink keeps the print's grain and pin-holes, and the pressure is uneven (a lighter worn patch, a
darker rim), so the seal reads as real 印泥 even when small.

Outputs (art/paper/):
  seal-cihui.png      the finished seal, 1024 x 1024, transparent outside the ink
  seal-cihui-ink.png  the stamp coming down: FRAMES frames side by side, ink taking in patches, last = finished
  seal-slip.png       the small square of paper the seal is stamped on (deckled edge, a hair of gold on it)
Run: python seal.py [font]   font: noto (default) or kai
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent / 'art' / 'paper'
SOURCE = HERE / 'seal-ink-v4.png'
SIZE = 1024
INK = np.array([0xA4, 0x2E, 0x27], dtype=float)
FRAMES = 8
FRAME = 384
FONTS = {
    'noto': ('C:/Windows/Fonts/NotoSerifTC-VF.ttf', 900),
    'kai': ('C:/Windows/Fonts/kaiu.ttf', None),
}
# right column first: (character, column, row) with column 0 = right
GLYPHS = [('慈', 0, 0), ('惠', 0, 1), ('道', 1, 0), ('場', 1, 1)]


def noise(size, scale, seed):
    """Smooth value noise in 0..1: random pixels at a coarse grid, blown up with a smooth filter."""
    rng = np.random.default_rng(seed)
    n = max(2, int(size / scale))
    small = Image.fromarray((rng.random((n, n)) * 255).astype(np.uint8))
    big = small.resize((size, size), Image.BICUBIC).filter(ImageFilter.GaussianBlur(scale / 4))
    a = np.asarray(big, dtype=float) / 255
    return (a - a.min()) / (a.max() - a.min() + 1e-9)


def ink_field():
    """The print's ink as coverage 0..1 (white paper = 0), cropped to the square and scaled to SIZE."""
    rgb = np.asarray(Image.open(SOURCE).convert('RGB'), dtype=float)
    g = rgb[:, :, 1]
    inside = g < 160
    ys, xs = np.where(inside)
    pad = 6
    box = (xs.min() - pad, ys.min() - pad, xs.max() + pad, ys.max() + pad)
    red_g = np.median(g[inside])
    cover = np.clip((255 - g) / (255 - red_g), 0, 1)
    im = Image.fromarray((cover * 255).astype(np.uint8)).crop(box).resize((SIZE, SIZE), Image.LANCZOS)
    return np.asarray(im, dtype=float) / 255


def glyph(ch, font):
    """One character as a tight white-on-black mask (cropped to its ink)."""
    im = Image.new('L', (1400, 1400), 0)
    ImageDraw.Draw(im).text((100, 50), ch, font=font, fill=255)
    return im.crop(im.getbbox())


def characters(font_key):
    """The four glyphs placed in their cells, centred in each cell; returns a 0..1 mask at SIZE."""
    path, weight = FONTS[font_key]
    font = ImageFont.truetype(path, 1100)
    if weight:
        font.set_variation_by_axes([weight])
    border = SIZE * .085  # red frame around the characters
    gutter = SIZE * .045  # red between the columns and rows
    cell = (SIZE - 2 * border - gutter) / 2
    mask = Image.new('L', (SIZE, SIZE), 0)
    for ch, col, row in GLYPHS:
        g = glyph(ch, font)
        # fill the cell: fit, then stretch the short side up to 10 % towards the cell, as seal carvers do
        k = min(cell / g.width, cell / g.height)
        w, h = g.width * k, g.height * k
        w, h = min(cell, w * 1.10), min(cell, h * 1.10)
        g = g.resize((round(w), round(h)), Image.LANCZOS)
        x0 = border + (1 - col) * (cell + gutter)  # column 0 is the right one
        y0 = border + row * (cell + gutter)
        mask.paste(g, (round(x0 + (cell - g.width) / 2), round(y0 + (cell - g.height) / 2)), g)
    return np.asarray(mask, dtype=float) / 255


def carve(mask, seed):
    """Roughen the cut edges like carved stone, chip a few corners, leave a few specks of ink in the strokes."""
    rng = np.random.default_rng(seed)
    soft = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)),
                      dtype=float) / 255
    rough = soft + (noise(SIZE, 9, seed) - .5) * .5 + (noise(SIZE, 3, seed + 1) - .5) * .18
    cut = np.clip((rough - .45) / .1, 0, 1)
    # a few specks of ink left inside the strokes
    specks = (noise(SIZE, 2.2, seed + 2) > .86) & (rng.random((SIZE, SIZE)) < .5)
    cut[specks] *= .3
    return cut


def pressure(seed):
    """Uneven pressure: mostly full, a soft lighter patch, slightly darker towards the rim."""
    low = noise(SIZE, 260, seed)
    yy, xx = np.mgrid[0:SIZE, 0:SIZE] / SIZE
    worn = np.exp(-(((xx - .3) ** 2) / .03 + ((yy - .78) ** 2) / .02))  # a lighter patch, lower left
    rim = np.clip(np.minimum.reduce([xx, yy, 1 - xx, 1 - yy]) / .06, 0, 1)
    return np.clip(.86 + .14 * low - .22 * worn + .08 * (1 - rim), 0, 1)


def to_rgba(alpha):
    rgba = np.zeros((SIZE, SIZE, 4), dtype=np.uint8)
    # denser ink is a touch darker
    shade = (INK[None, None, :] * (1.08 - .12 * alpha[:, :, None])).clip(0, 255)
    rgba[:, :, :3] = shade.astype(np.uint8)
    rgba[:, :, 3] = (alpha * 255).clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def slip(seed=31):
    """A square of the ivory paper with a soft deckled edge and a faint gold line just inside it."""
    n = 512
    paper = Image.open(HERE / 'paper-ivory-v1.png').convert('RGB').crop((300, 700, 300 + n, 700 + n))
    yy, xx = np.mgrid[0:n, 0:n] / n
    edge = np.minimum.reduce([xx, yy, 1 - xx, 1 - yy])  # distance to the nearest side, 0..0.5
    rough = edge + (noise(n, 14, seed) - .5) * .022 + (noise(n, 4, seed + 1) - .5) * .008
    alpha = np.clip((rough - .03) / .006, 0, 1)
    gold = np.clip(1 - np.abs(rough - .052) / .004, 0, 1) * .55
    rgb = np.asarray(paper, dtype=float) * 1.01
    foil = np.array([0xC9, 0xA8, 0x6A], dtype=float)
    rgb = rgb * (1 - gold[:, :, None]) + foil * gold[:, :, None]
    out = np.dstack([rgb.clip(0, 255), alpha * 255]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(HERE / 'seal-slip.png')


def main():
    font_key = sys.argv[1] if len(sys.argv) > 1 else 'noto'
    ink = ink_field() * pressure(11)
    alpha = ink * (1 - carve(characters(font_key), 5))
    final = to_rgba(alpha)
    final.save(HERE / 'seal-cihui.png')
    # the stamp coming down: the ink takes in patches, quickly, then is all there
    reveal = noise(SIZE, 40, 21) * .7 + noise(SIZE, 8, 22) * .3
    strip = Image.new('RGBA', (FRAMES * FRAME, FRAME), (0, 0, 0, 0))
    for k in range(FRAMES):
        t = (k + 1) / FRAMES
        a = alpha * np.clip((t * 1.35 - reveal) / .25, 0, 1) if k < FRAMES - 1 else alpha
        strip.paste(to_rgba(a).resize((FRAME, FRAME), Image.LANCZOS), (k * FRAME, 0))
    strip.save(HERE / 'seal-cihui-ink.png')
    slip()
    print(f'seal-cihui.png and seal-cihui-ink.png ({font_key})')


if __name__ == '__main__':
    main()
