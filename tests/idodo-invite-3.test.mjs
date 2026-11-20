// Acceptance tests for idodo-invite-3: a birthday-dinner invitation for Dodo
// (burgundy envelope with a wax seal, golden light, an arched card, a letter from the heart).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage, all, recordImages, recordTimers, runTimers, css, hideDelayMs } from './dom.mjs';

const PAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../idodo-invite-3/index.html');
const open = (query, patch, setup) => openPage(PAGE, query, patch, setup, 'BDAY_CONTENT');

function withDom(query, patch, fn) {
  return async () => {
    const dom = await open(query, patch);
    try { await fn(dom.window, dom.window.document); } finally { dom.window.close(); }
  };
}

const text = (doc, sel) => doc.querySelector(sel).textContent.replace(/\s+/g, ' ').trim();

// 1. the envelope
test('1. the page starts on a sealed envelope whose wax seal reads "I & D"; the page behind is inert', withDom('', undefined, (win, doc) => {
  assert.ok(doc.body.classList.contains('sealed'));
  assert.match(text(doc, '#seal'), /I\s*&\s*D/);
  assert.ok(doc.querySelector('#main').hasAttribute('inert'));
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

// 2. the golden light, then the card
test('2. the envelope leaves when style.css has finished the light, and only then the card text shows', async () => {
  const timers = [];
  const dom = await open('', undefined, recordTimers(timers));
  const doc = dom.window.document;
  try {
    timers.length = 0;
    doc.querySelector('#envelope').click();
    assert.ok(!doc.body.classList.contains('revealed'));
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

// 3. the card
test('3. the card wishes Dodo a happy birthday and gives the day and time', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '.card .names'), 'Dodo');
  assert.match(text(doc, '.card .wd'), /Happy Birthday/i);
  assert.equal(text(doc, '#card-date'), '2026 年 12 月 12 日（六） 18:30');
}));

// 4. countdown
test('4. before the dinner it counts down; after, it thanks Dodo', async () => {
  const soon = new Date(Date.now() + 2 * 86400000 + 3 * 3600000 + 60000).toISOString();
  const ahead = await open('', (c) => ({ ...c, date: soon }));
  const a = ahead.window.document;
  assert.ok(!a.querySelector('#countdown-clock').hidden);
  assert.equal(text(a, '#cd-days'), '2');
  assert.equal(text(a, '#cd-hours'), '03');
  ahead.window.close();
  const done = await open('', (c) => ({ ...c, date: '2020-12-12T18:30:00+08:00' }));
  assert.ok(done.window.document.querySelector('#countdown-clock').hidden);
  assert.equal(text(done.window.document, '#countdown-note'), '生日快樂！謝謝妳來');
  done.window.close();
});

test('4. the card speaks to Dodo as 妳, never 你', withDom('', undefined, (win, doc) => {
  assert.doesNotMatch(doc.body.textContent, /你/);
  assert.match(text(doc, '.invite-line'), /妳/);
}));

// 5. place
test('5. the place is Terzo in 竹北, and the map button finds it', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '#venue-name'), 'Terzo');
  assert.equal(text(doc, '#venue-area'), '竹北');
  assert.equal(text(doc, '#venue-when'), '2026 年 12 月 12 日（六） 18:30');
  const link = doc.querySelector('#map-link');
  assert.ok(!link.hidden);
  assert.equal(link.href, `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Terzo 竹北')}`);
}));

test('5. with a street address, the map button searches that address', withDom('', (c) => ({ ...c, venue: { ...c.venue, address: '新竹縣竹北市某某路 1 號' } }), (win, doc) => {
  assert.equal(text(doc, '#venue-address'), '新竹縣竹北市某某路 1 號');
  assert.equal(doc.querySelector('#map-link').href, `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('新竹縣竹北市某某路 1 號')}`);
}));

// 6. the letter
test('6. the letter shows every paragraph from content.js, signed by the sender', withDom('', (c) => ({ ...c, letter: ['第一段', '第二段'], from: 'Isaac' }), (win, doc) => {
  assert.deepEqual([...doc.querySelectorAll('#letter-text p')].map((p) => p.textContent), ['第一段', '第二段']);
  assert.equal(text(doc, '#letter-from'), '—— Isaac');
}));

// 7–8. noindex, own content
test('7. the page asks search engines not to index it', withDom('', undefined, (win, doc) => {
  assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/);
}));

test('8. it reads its own content.js, not the wedding one', withDom('', undefined, (win, doc) => {
  assert.ok(doc.querySelector('script[src="content.js"]'));
  assert.ok(!doc.querySelector('script[src="../idodo-invite/content.js"]'));
}));

// 9. paintings
test('9. every painting the stylesheet waits for is one the page loads', async () => {
  const sheet = await css(PAGE);
  const wanted = new Set([...sheet.matchAll(/\.art-([a-z-]+)/g)].map((m) => m[1]));
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

// 10. reduced motion
test('10. with reduced motion, tapping the envelope shows the card at once', async () => {
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
