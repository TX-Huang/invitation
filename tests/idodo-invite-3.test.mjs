// Acceptance tests for idodo-invite-3 (burgundy envelope with a wax seal, golden light, an arched card).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage, all, recordImages, recordTimers, runTimers, css, hideDelayMs } from './dom.mjs';

const PAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../idodo-invite-3/index.html');
const open = (query, patch, setup) => openPage(PAGE, query, patch, setup);

function withDom(query, patch, fn) {
  return async () => {
    const dom = await open(query, patch);
    try { await fn(dom.window, dom.window.document); } finally { dom.window.close(); }
  };
}

const text = (doc, sel) => doc.querySelector(sel).textContent.trim();
const future = (c) => ({ ...c, date: new Date(Date.now() + 3 * 86400000 + 5 * 3600000 + 7 * 60000 + 30000).toISOString() });
const past = (c) => ({ ...c, date: '2020-01-01T17:00:00+08:00' });

// 1. the envelope
test('1. the page starts on a sealed envelope whose wax seal reads "I & D"', withDom('', undefined, (win, doc) => {
  assert.ok(doc.body.classList.contains('sealed'));
  assert.match(text(doc, '#seal').replace(/\s+/g, ' '), /I\s*&\s*D/);
  assert.ok(doc.querySelector('#main').hasAttribute('inert'), 'the page behind is inert while sealed');
}));

test('1. clicking, Enter or Space opens it', async () => {
  for (const how of ['click', 'Enter', ' ']) {
    const dom = await open();
    const { document: doc, KeyboardEvent } = dom.window;
    const env = doc.querySelector('#envelope');
    if (how === 'click') env.click();
    else env.dispatchEvent(new KeyboardEvent('keydown', { key: how, bubbles: true }));
    assert.ok(doc.body.classList.contains('opened'), `${JSON.stringify(how)} should open`);
    assert.ok(!doc.querySelector('#main').hasAttribute('inert'));
    dom.window.close();
  }
});

// 2. opening
test('2. the envelope leaves when style.css has finished opening it, and only then the card text shows', async () => {
  const timers = [];
  const dom = await open('', undefined, recordTimers(timers));
  const doc = dom.window.document;
  try {
    timers.length = 0;
    doc.querySelector('#envelope').click();
    assert.ok(!doc.body.classList.contains('revealed'), 'the card text waits for the light');
    const openMs = Math.max(...timers.map((t) => t.ms));
    assert.equal(openMs, hideDelayMs(await css(PAGE), '.envelope'));
    assert.ok(openMs >= 3500, `opening lasts ${openMs} ms; it should take its time`);
    runTimers(timers, openMs);
    assert.ok(doc.querySelector('#envelope').hidden);
    assert.ok(doc.body.classList.contains('revealed'));
  } finally {
    dom.window.close();
  }
});

// 3. guest name
test('3. ?to=林小美 greets 林小美; no ?to= greets 親愛的朋友', async () => {
  const named = await open('?to=' + encodeURIComponent('林小美'));
  assert.equal(text(named.window.document, '#guest-name'), '林小美');
  assert.ok(named.window.document.querySelector('#guest-name').classList.contains('cjk'));
  named.window.close();
  const plain = await open();
  assert.equal(text(plain.window.document, '#greeting'), '親愛的朋友');
  plain.window.close();
});

// 4. language
test('4. switching to English changes the text and <html lang>; ?lang=en opens in English', async () => {
  const dom = await open('?to=Amy');
  const doc = dom.window.document;
  doc.querySelector('[data-lang="en"]').click();
  assert.equal(doc.documentElement.lang, 'en');
  assert.match(text(doc, '#greeting'), /^Dear\s+Amy$/);
  dom.window.close();
  const en = await open('?lang=en');
  assert.equal(en.window.document.documentElement.lang, 'en');
  en.window.close();
});

// 5–6. date and countdown
test('5. date null: the card says the date is coming, the countdown waits', withDom('', (c) => ({ ...c, date: null }), (win, doc) => {
  assert.equal(text(doc, '#card-date'), '日期即將公布');
  assert.ok(doc.querySelector('#countdown-clock').hidden);
  assert.equal(text(doc, '#countdown-note'), '日期確定後就開始倒數');
}));

test('6. date ahead: days, hours, minutes and seconds count down', withDom('', future, (win, doc) => {
  assert.ok(!doc.querySelector('#countdown-clock').hidden);
  assert.equal(text(doc, '#cd-days'), '3');
  assert.equal(text(doc, '#cd-hours'), '05');
  assert.ok(['07', '06'].includes(text(doc, '#cd-minutes')));
  assert.match(text(doc, '#cd-seconds'), /^\d\d$/);
}));

test('6. date passed: the countdown says 我們結婚啦', withDom('', past, (win, doc) => {
  assert.ok(doc.querySelector('#countdown-clock').hidden);
  assert.match(text(doc, '#countdown-note'), /我們結婚啦/);
}));

// 7. schedule
test('7. the schedule lists every item with time and title, with a rose on the line', withDom('', undefined, (win, doc) => {
  const items = [...doc.querySelectorAll('#timeline .t-item')];
  const program = win.IDODO_CONTENT.program;
  assert.equal(items.length, program.length);
  items.forEach((li, i) => {
    assert.equal(li.querySelector('.t-time').textContent, program[i].time);
    assert.equal(li.querySelector('.t-title').textContent, program[i].zh);
  });
  assert.ok(doc.querySelector('#schedule .rose-marker'));
}));

test('7. the rose travels down the line as the schedule scrolls past', withDom('', undefined, (win) => {
  const { progressOf } = win.IDODO;
  assert.equal(progressOf(800, 600, 800), 0, 'not reached yet');
  assert.equal(progressOf(-700, 600, 800), 1, 'scrolled past');
  assert.equal(progressOf(100, 600, 800), 0.5, 'half way: the middle of the list at the middle of the screen');
}));

// 8. map
test('8. address null: no map button; address set: it searches that address', async () => {
  const none = await open('', (c) => ({ ...c, venue: { ...c.venue, address: null } }));
  assert.ok(none.window.document.querySelector('#map-link').hidden);
  none.window.close();
  const addr = '新竹市東區光復路二段101號';
  const set = await open('', (c) => ({ ...c, venue: { ...c.venue, address: addr } }));
  const link = set.window.document.querySelector('#map-link');
  assert.ok(!link.hidden);
  assert.equal(link.href, `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`);
  set.window.close();
});

// 9. host
test('9. ?host skips the envelope, leaves the page usable and makes one ?to= link per name', withDom('?host', undefined, (win, doc) => {
  assert.ok(!doc.querySelector('#host').hidden);
  assert.ok(doc.querySelector('#envelope').hidden);
  assert.ok(!doc.querySelector('#main').hasAttribute('inert'));
  assert.ok(doc.body.classList.contains('revealed'));
  doc.querySelector('#host-names').value = '林小美\n\nAmy ';
  doc.querySelector('#host-make').click();
  const links = [...doc.querySelectorAll('#host-links input')].map((i) => i.value);
  assert.equal(links.length, 2);
  assert.match(links[1], /\?to=Amy$/);
}));

test('9. guests never see the link maker', withDom('?to=Amy', undefined, (win, doc) => {
  assert.ok(doc.querySelector('#host').hidden);
}));

// 10–11. noindex, shared content
test('10. the page asks search engines not to index it', withDom('', undefined, (win, doc) => {
  assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/);
}));

test('11. it reads the same content.js as the first card', withDom('', undefined, (win, doc) => {
  assert.ok(doc.querySelector('script[src="../idodo-invite/content.js"]'));
  const story = [...doc.querySelectorAll('#story-text p')].map((p) => p.textContent);
  assert.deepEqual(story, [...win.IDODO_CONTENT.story.zh]);
}));

// 12. paintings
test('12. every painting the stylesheet waits for is one the page loads', async () => {
  const sheet = await css(PAGE);
  const wanted = new Set([...sheet.matchAll(/\.art-([a-z-]+)/g)].map((m) => m[1]).filter((name) => name !== 'ready'));
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
test('13. with reduced motion, tapping the envelope shows the card at once', async () => {
  const reduce = (win) => { win.matchMedia = (q) => ({ matches: q.includes('reduce'), addEventListener() {} }); };
  const dom = await open('', undefined, all(reduce));
  const doc = dom.window.document;
  try {
    doc.querySelector('#envelope').click();
    assert.ok(doc.querySelector('#envelope').hidden);
    assert.ok(doc.body.classList.contains('revealed'));
  } finally {
    dom.window.close();
  }
});
