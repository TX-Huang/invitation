// Acceptance tests for cihui-invite: paper-cut clouds closed over a 慈惠道場 seal; three ways to open them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage, all, recordImages, css, hideDelayMs } from './dom.mjs';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../cihui-invite');
const PAGE = path.join(DIR, 'index.html');
const open = (query, patch, setup) => openPage(PAGE, query, patch, setup, 'CIHUI_CONTENT');

function withDom(query, patch, fn) {
  return async () => {
    const dom = await open(query, patch);
    try { await fn(dom.window, dom.window.document); } finally { dom.window.close(); }
  };
}

const text = (doc, sel) => doc.querySelector(sel).textContent.replace(/\s+/g, ' ').trim();
const texts = (doc, sel) => [...doc.querySelectorAll(sel)].map((n) => n.textContent.replace(/\s+/g, ' ').trim());
const reduce = (win) => { win.matchMedia = (q) => ({ matches: q.includes('reduce'), addEventListener() {} }); };
const q = (params) => `?${new URLSearchParams(params)}`;

// A clock for the page: setTimeout calls wait on it, and advance(ms) runs them in time order, each at its own
// moment, including the ones they set in turn. (Intervals still run for real; the page only uses them for the
// countdown and for sparkles, which need a canvas that jsdom does not have.)
function fakeClock() {
  const clock = { now: 0, queue: [] };
  clock.install = (win) => {
    win.setTimeout = (fn, ms = 0) => {
      clock.queue.push({ fn, at: clock.now + Number(ms) });
      return clock.queue.length;
    };
  };
  clock.advance = (to) => {
    for (;;) {
      clock.queue.sort((a, b) => a.at - b.at);
      const next = clock.queue[0];
      if (!next || next.at > to) break;
      clock.queue.shift();
      clock.now = next.at;
      next.fn();
    }
    clock.now = to;
  };
  return clock;
}

// jsdom never loads pictures, so the clouds start when the 3 s wait runs out, and the seal is stamped 2.7 s later.
const LANDED_MS = 3000 + 2700;

// Load the page and let the clouds close and the seal be stamped.
async function landed(query = '', patch) {
  const clock = fakeClock();
  const dom = await open(query, patch, clock.install);
  clock.advance(LANDED_MS);
  return { dom, doc: dom.window.document, clock };
}

// 1. closed
test('1. three paper cloud layers a side close over a seal of 慈惠道場, with the guest\'s name below', async () => {
  const clock = fakeClock();
  const dom = await open(q({ to: '林小美師姐' }), undefined, clock.install);
  const doc = dom.window.document;
  try {
    assert.equal(doc.querySelectorAll('#sky .clouds .side.L img').length, 3);
    assert.equal(doc.querySelectorAll('#sky .clouds .side.R img').length, 3);
    assert.equal(doc.querySelector('#sky .seal').getAttribute('aria-label'), '慈惠道場印');
    assert.equal(text(doc, '#sky .tag'), '林小美師姐 台啟');
    assert.ok(doc.body.classList.contains('sealed'));
    assert.ok(doc.querySelector('#main').hasAttribute('inert'), 'the page is inert until opened');
    clock.advance(LANDED_MS - 1);
    assert.ok(!doc.body.classList.contains('landed'));
    clock.advance(LANDED_MS);
    assert.ok(doc.body.classList.contains('landed'), 'the seal has been stamped');
  } finally {
    dom.window.close();
  }
});

test('1. the clouds start to move once the paintings of the opening have loaded; the seal is stamped 2.7 s later', async () => {
  const clock = fakeClock();
  const images = [];
  const dom = await open('', undefined, all(clock.install, recordImages(images)));
  const doc = dom.window.document;
  try {
    const asked = images.map((img) => img.src);
    for (const name of ['cloud-front', 'cloud-mid', 'cloud-back', 'paper', 'seal-ink', 'seal-slip', 'mist-1', 'mist-2', 'mist-3']) {
      assert.ok(asked.includes(`art/${name}.webp`), `the page asks for art/${name}.webp`);
    }
    clock.advance(2000);
    assert.ok(!doc.body.classList.contains('ready'), 'nothing moves while the paintings are still coming');
    images.forEach((img) => img.onload && img.onload());
    assert.ok(doc.body.classList.contains('ready'));
    clock.advance(2000 + 2699);
    assert.ok(!doc.body.classList.contains('landed'), 'the seal is not stamped yet');
    clock.advance(2000 + 2700);
    assert.ok(doc.body.classList.contains('landed'));
  } finally {
    dom.window.close();
  }
});

test('1. on a slow line the clouds start anyway after 3 seconds', async () => {
  const clock = fakeClock();
  const dom = await open('', undefined, all(clock.install, recordImages([])));
  try {
    clock.advance(2999);
    assert.ok(!dom.window.document.body.classList.contains('ready'));
    clock.advance(3000);
    assert.ok(dom.window.document.body.classList.contains('ready'));
  } finally {
    dom.window.close();
  }
});

test('1. once the seal is stamped, clicking, Enter or Space opens it; the page behind stays locked until the opening is done', async () => {
  for (const how of ['click', 'Enter', ' ']) {
    const { dom, doc, clock } = await landed();
    const sky = doc.querySelector('#sky');
    if (how === 'click') sky.click();
    else sky.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: how, bubbles: true }));
    assert.ok(doc.body.classList.contains('opened'), `${JSON.stringify(how)} should open`);
    assert.ok(doc.querySelector('#main').hasAttribute('inert'), 'no tap or Tab reaches the page while the clouds part');
    clock.advance(clock.now + 60000);
    assert.ok(!doc.querySelector('#main').hasAttribute('inert'), 'once the opening is done, the page can be used');
    dom.window.close();
  }
});

test('1. a tap before the seal is stamped opens it as soon as it is', async () => {
  const clock = fakeClock();
  const dom = await open('', undefined, clock.install);
  const doc = dom.window.document;
  try {
    doc.querySelector('#sky').click();
    clock.advance(LANDED_MS - 1);
    assert.ok(!doc.body.classList.contains('opened'), 'waits for the seal');
    clock.advance(LANDED_MS);
    assert.ok(doc.body.classList.contains('opened'));
  } finally {
    dom.window.close();
  }
});

// 2. three ways to open
test('2. ?open=a, b or c picks how it opens; c (both together) when missing or unknown', async () => {
  for (const [query, want] of [['?open=a', 'open-a'], ['?open=b', 'open-b'], ['?open=c', 'open-c'], ['', 'open-c'], ['?open=zz', 'open-c']]) {
    const dom = await open(query);
    const cls = [...dom.window.document.body.classList].filter((c) => c.startsWith('open-'));
    assert.deepEqual(cls, [want], `${query || 'no ?open'} should give ${want}`);
    dom.window.close();
  }
});

test('2. the opening layer goes away exactly when style.css has finished with it', async () => {
  const { dom, doc, clock } = await landed();
  try {
    const tapped = clock.now;
    doc.querySelector('#sky').click();
    const openMs = hideDelayMs(await css(PAGE), '.sky');
    clock.advance(tapped + openMs - 1);
    assert.ok(!doc.body.classList.contains('revealed'));
    clock.advance(tapped + openMs);
    assert.ok(doc.querySelector('#sky').hidden);
    assert.ok(doc.body.classList.contains('revealed'));
  } finally {
    dom.window.close();
  }
});

// 3. guest name
test('3. ?to=林小美師姐: the slip and the invitation name her', withDom(q({ to: '林小美師姐' }), undefined, (win, doc) => {
  assert.equal(text(doc, '#tag-to'), '林小美師姐');
  assert.equal(text(doc, '#hero-guest'), '敬邀 林小美師姐');
}));

test('3. no ?to=: the slip and the invitation are for 十方大德', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '#tag-to'), '十方大德');
  assert.equal(text(doc, '#hero-guest'), '敬邀 十方大德');
}));

// 4. the words of the invitation
test('4. by default: 堂慶, the dates in Chinese numerals, 恭請蒞臨 同霑法喜, signed 慈惠道場 敬邀', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '#hero-title'), '堂慶');
  assert.deepEqual(texts(doc, '#hero-text .v-line'), ['謹訂於國曆二〇二七年', '一月十六日至十七日', '恭請蒞臨 同霑法喜']);
  assert.equal(text(doc, '#hero-sign'), '慈惠道場 敬邀');
}));

test('4. ?title=, ?msg= (one line each) and ?sign= replace them, as plain text', withDom(q({
  title: '開光', msg: '謹訂於臘月初八\n恭請 <b>蒞臨</b>', sign: '慈惠道場 合十',
}), undefined, (win, doc) => {
  assert.equal(text(doc, '#hero-title'), '開光');
  assert.deepEqual(texts(doc, '#hero-text .v-line'), ['謹訂於臘月初八', '恭請 <b>蒞臨</b>']);
  assert.equal(doc.querySelector('#hero-text b'), null, 'words from the link are never read as HTML');
  assert.equal(text(doc, '#hero-sign'), '慈惠道場 合十');
}));

test('4. words from the link are cut to what fits the card', withDom(q({
  to: '名'.repeat(80), title: '題'.repeat(20), msg: Array.from({ length: 12 }, () => '字'.repeat(60)).join('\n'),
}), undefined, (win, doc) => {
  assert.equal(text(doc, '#tag-to').length, 20);
  assert.equal(text(doc, '#hero-title').length, 6);
  const lines = texts(doc, '#hero-text .v-line');
  assert.equal(lines.length, 6);
  assert.ok(lines.every((l) => l.length === 22));
}));

test('4. the dojo\'s name in the words of a link is always written in full, even where a line was cut', withDom(q({
  title: '慈惠', msg: `${'字'.repeat(20)}慈惠道場\n感恩慈惠`, sign: '慈惠 合十',
}), undefined, (win, doc) => {
  assert.equal(text(doc, '#hero-title'), '慈惠道場');
  assert.deepEqual(texts(doc, '#hero-text .v-line'), [`${'字'.repeat(20)}慈惠道場`, '感恩慈惠道場']);
  assert.equal(text(doc, '#hero-sign'), '慈惠道場 合十');
}));

test('4. a guest\'s own name is left as it is, even if it has 慈惠 in it', withDom(q({ to: '王慈惠' }), undefined, (win, doc) => {
  assert.equal(text(doc, '#tag-to'), '王慈惠');
}));

// 5. days
test('5. the two days are listed with weekdays; no start time yet says 時間待公布', withDom('', undefined, (win, doc) => {
  assert.deepEqual(texts(doc, '#dates li'), ['1 月 16 日（六）', '1 月 17 日（日）']);
  assert.equal(text(doc, '#time-line'), '時間待公布');
}));

test('5. with a start time, the time is shown', withDom('', (c) => ({ ...c, start: '2027-01-16T09:30:00+08:00' }), (win, doc) => {
  assert.equal(text(doc, '#time-line'), '09:30 開始');
}));

// 6. countdown
test('6. before the day it counts down; after, it thanks everyone', async () => {
  const soon = new Date(Date.now() + 2 * 86400000 + 3 * 3600000 + 60000).toISOString();
  const ahead = await open('', (c) => ({ ...c, start: soon }));
  const a = ahead.window.document;
  assert.ok(!a.querySelector('#countdown-clock').hidden);
  assert.equal(text(a, '#cd-days'), '2');
  assert.equal(text(a, '#cd-hours'), '03');
  ahead.window.close();
  const done = await open('', (c) => ({ ...c, start: null, days: ['2020-01-16', '2020-01-17'] }));
  assert.ok(done.window.document.querySelector('#countdown-clock').hidden);
  assert.equal(text(done.window.document, '#countdown-note'), '堂慶圓滿，感恩大家護持');
  done.window.close();
});

// 7. program
test('7. no program yet: it says 流程待公布', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '#program-note'), '流程待公布');
  assert.equal(doc.querySelectorAll('#program .p-item').length, 0);
}));

test('7. a program is listed day by day, in time order', withDom('', (c) => ({
  ...c,
  program: [
    { day: 2, time: '10:00', title: '祝壽' },
    { day: 1, time: '09:00', title: '恭迎聖駕' },
  ],
}), (win, doc) => {
  assert.ok(doc.querySelector('#program-note').hidden);
  assert.deepEqual(texts(doc, '#program .p-item'), ['09:00 恭迎聖駕', '10:00 祝壽']);
  assert.deepEqual(texts(doc, '#program .p-day'), ['1 月 16 日（六）', '1 月 17 日（日）']);
}));

// 8. place
test('8. address null: 地址待公布 and no map; address set: the map button searches it', async () => {
  const none = await open();
  assert.equal(text(none.window.document, '#venue-address'), '地址待公布');
  assert.ok(none.window.document.querySelector('#map-link').hidden);
  none.window.close();
  const addr = '新竹縣竹北市光明一路 1 號';
  const set = await open('', (c) => ({ ...c, venue: { ...c.venue, address: addr } }));
  const link = set.window.document.querySelector('#map-link');
  assert.ok(!link.hidden);
  assert.equal(link.href, `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`);
  set.window.close();
});

// 9. deities
test('9. only friends are invited, so the page does not introduce the dojo\'s deities', withDom('', undefined, (win, doc) => {
  assert.equal(doc.querySelector('#deities'), null);
  assert.doesNotMatch(doc.querySelector('#main').textContent, /道場神尊|瑤池金母/);
}));

// 10. host
test('10. ?host skips the opening and shows the link maker; guests never see it', async () => {
  const host = await open('?host');
  const doc = host.window.document;
  assert.ok(!doc.querySelector('#host').hidden);
  assert.ok(doc.querySelector('#sky').hidden);
  assert.ok(doc.body.classList.contains('revealed'));
  host.window.close();
  const guest = await open(q({ to: 'Amy' }));
  assert.ok(guest.window.document.querySelector('#host').hidden);
  guest.window.close();
});

test('10. the link maker makes one link per name, carrying the opening and only the words that were changed', async () => {
  const host = await open('?host');
  const doc = host.window.document;
  try {
    assert.equal(doc.querySelector('#host-title').value, '堂慶', 'the fields start with the words in use');
    assert.equal(doc.querySelector('#host-msg').value, '謹訂於國曆二〇二七年\n一月十六日至十七日\n恭請蒞臨 同霑法喜');
    assert.equal(doc.querySelector('#host-sign').value, '慈惠道場 敬邀');
    doc.querySelector('#host-names').value = '林小美師姐\n\n王大明師兄 ';
    doc.querySelector('#host-open').value = 'a';
    doc.querySelector('#host-make').click();
    let links = [...doc.querySelectorAll('#host-links input')].map((i) => new URL(i.value));
    assert.equal(links.length, 2);
    assert.equal(links[1].searchParams.get('to'), '王大明師兄');
    assert.equal(links[1].searchParams.get('open'), 'a');
    for (const key of ['title', 'msg', 'sign']) assert.ok(!links[1].searchParams.has(key), `${key} unchanged, so not in the link`);
    const general = new URL(doc.querySelector('#host-general').value);
    assert.ok(!general.searchParams.has('to'), 'a link with no name, for a group chat');
    assert.equal(general.searchParams.get('open'), 'a');

    doc.querySelector('#host-sign').value = '慈惠道場 合十';
    doc.querySelector('#host-msg').value = '謹訂於臘月初八\n恭請蒞臨';
    doc.querySelector('#host-make').click();
    links = [...doc.querySelectorAll('#host-links input')].map((i) => new URL(i.value));
    assert.equal(links[0].searchParams.get('sign'), '慈惠道場 合十');
    assert.equal(links[0].searchParams.get('msg'), '謹訂於臘月初八\n恭請蒞臨');
    assert.ok(!links[0].searchParams.has('title'));

    doc.querySelector('#host-sign').value = '慈惠 合十';
    doc.querySelector('#host-make').click();
    links = [...doc.querySelectorAll('#host-links input')].map((i) => new URL(i.value));
    assert.equal(links[0].searchParams.get('sign'), '慈惠道場 合十', 'the link maker writes the full name too');
  } finally {
    host.window.close();
  }
});

// 11. the full name
test('11. the dojo is always 慈惠道場: 慈惠 never stands alone on the page', async () => {
  for (const query of ['', '?host', q({ to: '林小美師姐' })]) {
    const dom = await open(query);
    const doc = dom.window.document;
    const words = [doc.body.textContent, ...[...doc.querySelectorAll('[aria-label],[alt],[placeholder]')]
      .map((n) => `${n.getAttribute('aria-label') || ''} ${n.getAttribute('alt') || ''} ${n.getAttribute('placeholder') || ''}`), doc.title];
    // spaces and line breaks do not count: 慈 and 惠 on two lines still read as 慈惠
    for (const w of words.map((x) => x.replace(/\s+/g, ''))) {
      assert.doesNotMatch(w, /慈惠(?!道場)/, `${query || 'the page'}: "${w.match(/.{0,8}慈惠.{0,4}/)?.[0]}"`);
    }
    dom.window.close();
  }
});

// 12. noindex
test('12. the page asks search engines not to index it', withDom('', undefined, (win, doc) => {
  assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/);
}));

// 13. paintings
test('13. every painting the page or the stylesheet uses is in art/', async () => {
  const sources = [await css(PAGE), await readFile(PAGE, 'utf8'), await readFile(path.join(DIR, 'app.js'), 'utf8')].join('\n');
  const used = new Set([...sources.matchAll(/art\/([a-z0-9-]+\.webp)/g)].map((m) => m[1]));
  const images = [];
  const dom = await open('', undefined, recordImages(images));
  dom.window.close();
  images.forEach((img) => used.add(img.src.replace('art/', '')));
  assert.ok(used.size > 5);
  for (const file of used) assert.ok(existsSync(path.join(DIR, 'art', file)), `art/${file} is used but missing`);
});

// 14. reduced motion
test('14. with reduced motion, the clouds are already closed and one tap shows the invitation', async () => {
  const dom = await open('', undefined, reduce);
  const doc = dom.window.document;
  try {
    assert.ok(doc.body.classList.contains('landed'));
    doc.querySelector('#sky').click();
    assert.ok(doc.querySelector('#sky').hidden);
    assert.ok(doc.body.classList.contains('revealed'));
  } finally {
    dom.window.close();
  }
});
