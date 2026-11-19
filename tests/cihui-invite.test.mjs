// Acceptance tests for cihui-invite: a bluebird brings the letter, it opens in golden light, a scroll unrolls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage, all, recordImages, recordTimers, runTimers, css, hideDelayMs } from './dom.mjs';

const PAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../cihui-invite/index.html');
const open = (query, patch, setup) => openPage(PAGE, query, patch, setup, 'CIHUI_CONTENT');

function withDom(query, patch, fn) {
  return async () => {
    const dom = await open(query, patch);
    try { await fn(dom.window, dom.window.document); } finally { dom.window.close(); }
  };
}

const text = (doc, sel) => doc.querySelector(sel).textContent.replace(/\s+/g, ' ').trim();
const reduce = (win) => { win.matchMedia = (q) => ({ matches: q.includes('reduce'), addEventListener() {} }); };

// Load the page and let the bluebird finish delivering the letter.
async function delivered(query = '', patch) {
  const timers = [];
  const dom = await open(query, patch, recordTimers(timers));
  runTimers(timers, 6000);
  return { dom, doc: dom.window.document, timers };
}

// 1. the bluebird brings the letter
test('1. a bluebird flies in carrying the letter; the letter lands, sealed with 慈惠', async () => {
  const timers = [];
  const dom = await open('', undefined, recordTimers(timers));
  const doc = dom.window.document;
  try {
    assert.ok(doc.body.classList.contains('sealed'));
    assert.ok(doc.querySelector('#sky .bird'), 'there is a bluebird');
    assert.ok(doc.querySelector('#sky .bird .carried'), 'it carries the letter');
    assert.equal(text(doc, '#letter .seal'), '慈 惠');
    assert.ok(!doc.body.classList.contains('landed'));
    runTimers(timers, 6000);
    assert.ok(doc.body.classList.contains('landed'), 'the letter has landed');
    assert.ok(doc.querySelector('#main').hasAttribute('inert'), 'the page behind is inert until the letter is opened');
  } finally {
    dom.window.close();
  }
});

test('1. the letter is a full envelope with four flaps, and the name sits on a label pasted on it', withDom('?to=' + encodeURIComponent('林小美師姐'), undefined, (win, doc) => {
  for (const sel of ['.flap-top', '.fl-left', '.fl-right', '.fl-bottom']) {
    assert.ok(doc.querySelector(`#letter ${sel}`), `the envelope has ${sel}`);
  }
  assert.equal(text(doc, '#letter .slip #letter-to'), '林小美師姐');
}));

test('2. when the letter opens, a bluebird flies out of the light', withDom('', undefined, (win, doc) => {
  assert.ok(doc.querySelector('#sky .bird-out'));
}));

test('1. once landed, clicking, Enter or Space opens the letter', async () => {
  for (const how of ['click', 'Enter', ' ']) {
    const { dom, doc } = await delivered();
    const sky = doc.querySelector('#sky');
    if (how === 'click') sky.click();
    else sky.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: how, bubbles: true }));
    assert.ok(doc.body.classList.contains('opened'), `${JSON.stringify(how)} should open`);
    assert.ok(!doc.querySelector('#main').hasAttribute('inert'));
    dom.window.close();
  }
});

test('1. a tap while the bird is still flying opens the letter as soon as it lands', async () => {
  const timers = [];
  const dom = await open('', undefined, recordTimers(timers));
  const doc = dom.window.document;
  try {
    doc.querySelector('#sky').click();
    assert.ok(!doc.body.classList.contains('opened'), 'waits for the letter');
    runTimers(timers, 6000);
    assert.ok(doc.body.classList.contains('opened'));
  } finally {
    dom.window.close();
  }
});

// 2. opening
test('2. the sky leaves when style.css has finished the golden light, then the scroll unrolls', async () => {
  const { dom, doc, timers } = await delivered();
  try {
    timers.length = 0;
    doc.querySelector('#sky').click();
    assert.ok(!doc.body.classList.contains('revealed'));
    const openMs = Math.max(...timers.map((t) => t.ms));
    assert.equal(openMs, hideDelayMs(await css(PAGE), '.sky'));
    runTimers(timers, openMs);
    assert.ok(doc.querySelector('#sky').hidden);
    assert.ok(doc.body.classList.contains('revealed'));
  } finally {
    dom.window.close();
  }
});

// 3. guest name
test('3. ?to=林小美師姐: the envelope and the scroll name her', withDom('?to=' + encodeURIComponent('林小美師姐'), undefined, (win, doc) => {
  assert.equal(text(doc, '#letter-to'), '林小美師姐');
  assert.equal(text(doc, '#scroll-guest'), '敬邀 林小美師姐');
}));

test('3. no ?to=: the envelope and the scroll invite 十方大德', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '#letter-to'), '十方大德');
  assert.equal(text(doc, '#scroll-guest'), '敬邀 十方大德');
}));

// 4. the days
test('4. the scroll writes the dates in Chinese numerals, and the two days are listed with weekdays', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '#scroll-dates'), '謹訂於國曆二〇二七年一月十六日至十七日');
  const days = [...doc.querySelectorAll('#dates li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim());
  assert.deepEqual(days, ['1 月 16 日（六）', '1 月 17 日（日）']);
  assert.equal(text(doc, '#time-line'), '時間待公布');
}));

test('4. with a start time, the time is shown', withDom('', (c) => ({ ...c, start: '2027-01-16T09:30:00+08:00' }), (win, doc) => {
  assert.equal(text(doc, '#time-line'), '09:30 開始');
}));

// 5. countdown
test('5. before the day it counts down; after, it thanks everyone', async () => {
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

// 6. program
test('6. no program yet: it says 流程待公布', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '#program-note'), '流程待公布');
  assert.equal(doc.querySelectorAll('#program .p-item').length, 0);
}));

test('6. a program is listed day by day', withDom('', (c) => ({
  ...c,
  program: [
    { day: 2, time: '10:00', title: '祝壽' },
    { day: 1, time: '09:00', title: '恭迎聖駕' },
  ],
}), (win, doc) => {
  assert.ok(doc.querySelector('#program-note').hidden);
  const rows = [...doc.querySelectorAll('#program .p-item')].map((li) => li.textContent.replace(/\s+/g, ' ').trim());
  assert.deepEqual(rows, ['09:00 恭迎聖駕', '10:00 祝壽']);
  assert.deepEqual([...doc.querySelectorAll('#program .p-day')].map((h) => h.textContent.trim()), ['1 月 16 日（六）', '1 月 17 日（日）']);
}));

// 7. place
test('7. address null: 地址待公布 and no map; address set: the map button searches it', async () => {
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

// 8. deities
test('8. the four deities of the dojo are shown, 瑤池金母 as the main one', withDom('', undefined, (win, doc) => {
  const cards = [...doc.querySelectorAll('#deities .deity')];
  assert.deepEqual(cards.map((c) => c.querySelector('.d-name').textContent), ['瑤池金母', '九天玄女', '中壇元帥', '福德正神']);
  assert.equal(cards[0].querySelector('.d-role').textContent, '主祀');
}));

// 9. host
test('9. ?host skips the letter and makes one ?to= link per name; guests never see it', async () => {
  const host = await open('?host');
  const doc = host.window.document;
  assert.ok(!doc.querySelector('#host').hidden);
  assert.ok(doc.querySelector('#sky').hidden);
  assert.ok(doc.body.classList.contains('revealed'));
  doc.querySelector('#host-names').value = '林小美師姐\n\n王大明師兄 ';
  doc.querySelector('#host-make').click();
  const links = [...doc.querySelectorAll('#host-links input')].map((i) => i.value);
  assert.equal(links.length, 2);
  assert.match(links[1], new RegExp(`\\?to=${encodeURIComponent('王大明師兄')}$`));
  host.window.close();
  const guest = await open('?to=Amy');
  assert.ok(guest.window.document.querySelector('#host').hidden);
  guest.window.close();
});

// 10–11. noindex, credit
test('10. the page asks search engines not to index it', withDom('', undefined, (win, doc) => {
  assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/);
}));

test('11. the seal-script plaque credits its font licence', withDom('', undefined, (win, doc) => {
  assert.match(text(doc, '#credit'), /崇羲篆體.*CC BY-ND 3\.0 TW/);
}));

// 12. paintings
test('12. every painting the stylesheet waits for is one the page loads', async () => {
  const sheet = await css(PAGE);
  const wanted = new Set([...sheet.matchAll(/\.art-([a-z0-9-]+)/g)].map((m) => m[1]));
  const images = [];
  const dom = await open('', undefined, recordImages(images));
  try {
    const loaded = new Set(images.map((img) => img.src));
    assert.ok(wanted.size > 0);
    for (const name of wanted) assert.ok(loaded.has(`art/${name}.webp`), `style.css uses .art-${name} but the page never loads art/${name}.webp`);
  } finally {
    dom.window.close();
  }
});

// 13. reduced motion
test('13. with reduced motion, the letter is already there and opens at once', async () => {
  const dom = await open('', undefined, all(reduce));
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
