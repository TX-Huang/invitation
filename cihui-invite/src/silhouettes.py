"""Cloud silhouettes for ART-BRIEF batch 4: the outline is ours, FLUX turns it into real paper and gold foil.

Each picture is 1024 x 2304: light paper on the left, a column of cloud heads along the right edge, a flat slate
background. A cloud head is a cluster of three lobes, like a classic 祥雲 head: a big lobe out at the edge, a
medium lobe below it, a small lobe above it and further in; between heads the edge dips into a deep cusp.
On the front sheet each big and medium lobe carries a gold 卷雲 line (#C9A86A) that runs inside its edge and winds
into a spiral, the two spirals turning opposite ways. A faint line marks where one lobe lies over another.
Run: python silhouettes.py  ->  art/paper/sil/sil-{front,mid,back}.png and preview.png
"""
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

W, H = 1024, 2304
SS = 3  # draw three times bigger, then shrink, for smooth edges
BG = (0x2E, 0x34, 0x39)
GOLD = (0xC9, 0xA8, 0x6A)
OUT = Path(__file__).parent / 'art' / 'paper' / 'sil'

# r: the big lobe's radius (fraction of the width); gold: which heads carry gold lines
LAYERS = {
    'front': {'paper': (0xFA, 0xF7, 0xF1), 'heads': 5, 'tip': .85, 'r': .135, 'gold': 'all', 'line': 3.2, 'seed': 4, 'bumps': True},
    'mid': {'paper': (0xF2, 0xEC, 0xE2), 'heads': 8, 'tip': .85, 'r': .084, 'gold': (1, 4, 6), 'line': 2.6, 'seed': 9, 'bumps': True},
    'back': {'paper': (0xEA, 0xE3, 0xD6), 'heads': 13, 'tip': .85, 'r': .052, 'gold': (), 'line': 0, 'seed': 2, 'bumps': False},
}


def s(v):
    return round(v * SS)


def polyline(d, pts, fill, width):
    d.line([(s(x), s(y)) for x, y in pts], fill=fill, width=s(width), joint='curve')
    for x, y in (pts[0], pts[-1]):  # round ends
        d.ellipse([s(x - width / 2), s(y - width / 2), s(x + width / 2), s(y + width / 2)], fill=fill)


def cloud_heads(layer):
    """A chain of overlapping lobes down the edge, from above the top to below the bottom.

    Heads go small-big-medium (every other one flipped: medium-big-small), each lobe overlapping the one before,
    so the edge never breaks. Big lobes touch the tip line; medium ones sit a little in; small ones further in,
    which makes the cusps between heads."""
    rnd = random.Random(layer['seed'])
    tip = layer['tip'] * W
    R = layer['r'] * W
    inset = {'big': 0, 'med': R * .12, 'small': R * .95}
    size = {'big': 1, 'med': .66, 'small': .46}
    heads, y, prev, i = [], -R * 1.2, None, 0
    while y < H + R * 2:
        h = {'i': i, 'flip': i % 2 == 1}
        for kind in (('med', 'big', 'small') if h['flip'] else ('small', 'big', 'med')):
            r = R * size[kind] * (1 + (rnd.random() - .5) * .14)
            if prev is not None:
                y = prev[1] + (prev[2] + r) * .78
            lobe = (tip - r - inset[kind] - rnd.random() * R * .04, y, r)
            h[kind] = lobe
            prev = lobe
            if kind == 'big' and layer['bumps']:
                # two smaller bumps on the outer arc, above and below the tip, so the head is not a plain circle
                x0, y0 = lobe[0], lobe[1]
                h['bumps'] = []
                for ang, k in ((-40, .5), (38, .46)):
                    a = math.radians(ang + (rnd.random() - .5) * 10)
                    rb = r * k * (1 + (rnd.random() - .5) * .12)
                    dist = r - rb * .78
                    h['bumps'].append((x0 + math.cos(a) * dist, y0 + math.sin(a) * dist, rb))
        heads.append(h)
        i += 1
    return heads


def shape_mask(heads, paper_from_left=True):
    """The sheet: every lobe, plus the body of the sheet up to the lobes' centres (so the body's straight edge
    stays hidden behind them). paper_from_left also fills everything left of each row's edge (no notches)."""
    m = Image.new('L', (s(W), s(H)), 0)
    d = ImageDraw.Draw(m)
    body = min(h[k][0] for h in heads for k in ('small', 'med', 'big'))
    d.rectangle([0, 0, s(body), s(H)], fill=255)
    for h in heads:
        for x, y, r in (h['small'], h['med'], h['big'], *h.get('bumps', ())):
            d.ellipse([s(x - r), s(y - r), s(x + r), s(y + r)], fill=255)
    a = np.array(m) > 127
    if paper_from_left:
        right = np.where(a.any(axis=1), a.shape[1] - 1 - np.argmax(a[:, ::-1], axis=1), 0)
        cols = np.arange(a.shape[1])[None, :]
        a = cols <= right[:, None]
    return a


def arc_inside(front, back):
    """The part of the `front` lobe's edge that lies over the `back` lobe (drawn as a faint line)."""
    x, y, r = front
    bx, by, br = back
    pts = []
    for k in range(721):
        a = math.radians(k / 2)
        px, py = x + math.cos(a) * r, y + math.sin(a) * r
        if math.hypot(px - bx, py - by) < br * .96:
            pts.append((k, (px, py)))
    if len(pts) < 3:
        return []
    # the arc may wrap past 0 degrees: start it after the biggest gap
    ks = [k for k, _ in pts]
    gaps = [(ks[(j + 1) % len(ks)] - ks[j]) % 720 for j in range(len(ks))]
    start = (gaps.index(max(gaps)) + 1) % len(pts)
    return [p for _, p in pts[start:] + pts[:start]]


def curl(lobe, start_deg, turn, edge=.78, sweep=170, spiral=380):
    """A 卷雲 line inside a lobe: along its edge for `sweep` degrees, then a spiral of `spiral` degrees.
    turn=-1 runs counter-clockwise on screen, +1 clockwise."""
    x, y, r = lobe
    pts = []
    total = sweep + spiral
    n = 200
    for k in range(n + 1):
        t = k / n * total
        rad = r * edge if t <= sweep else r * (edge - (edge - .16) * ((t - sweep) / spiral) ** .85)
        a = math.radians(start_deg + turn * t)
        pts.append((x + math.cos(a) * rad, y + math.sin(a) * rad))
    return pts


def draw_layer(layer):
    heads = cloud_heads(layer)
    paper = np.array(layer['paper'], dtype=np.uint8)
    rgb = np.empty((s(H), s(W), 3), dtype=np.uint8)
    rgb[:] = BG
    rgb[shape_mask(heads)] = paper
    im = Image.fromarray(rgb)
    d = ImageDraw.Draw(im)
    shade = tuple(c - 22 for c in layer['paper'])
    for k, h in enumerate(heads):
        # the big lobe lies over its own medium and small lobes; the medium lobe over the next head's small one
        pairs = [(h['big'], h['med']), (h['big'], h['small'])]
        for front, back in pairs:
            arc = arc_inside(front, back)
            if arc:
                polyline(d, arc, shade, 2)
        if layer['gold'] == 'all' or h['i'] in layer['gold']:
            # a gold line running parallel to the outer edge, over the top of the lobe, ending in a small spiral
            if not h['flip']:
                polyline(d, curl(h['big'], 112, -1, edge=.7), GOLD, layer['line'])
            else:
                polyline(d, curl(h['big'], -112, 1, edge=.7), GOLD, layer['line'])
    return im.resize((W, H), Image.LANCZOS)


def edge_report(im):
    """Where the paper's edge lies (fraction of the width), and the longest straight vertical run in pixels."""
    a = np.array(im).astype(int)
    paper = np.abs(a - np.array(BG)).sum(axis=2) > 60
    right = W - 1 - np.argmax(paper[:, ::-1], axis=1)
    runs = np.diff(right) == 0
    longest = run = 0
    for same in runs:
        run = run + 1 if same else 0
        longest = max(longest, run)
    return right.min() / W, right.max() / W, longest


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    thumbs = []
    for name, layer in LAYERS.items():
        im = draw_layer(layer)
        im.save(OUT / f'sil-{name}.png')
        lo, hi, longest = edge_report(im)
        print(f'sil-{name}.png  edge {lo:.2f}..{hi:.2f}  longest straight run {longest}px')
        thumbs.append(im.resize((341, 768), Image.LANCZOS))
    sheet = Image.new('RGB', (3 * 351, 768), 'white')
    for i, t in enumerate(thumbs):
        sheet.paste(t, (i * 351, 0))
    sheet.save(OUT / 'preview.png')


if __name__ == '__main__':
    main()
