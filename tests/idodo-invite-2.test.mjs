// Acceptance tests for idodo-invite-2 (sliding doors, a stage curtain, then the invitation).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  openPage, all, recordImages, recordTimers, runTimers, stubVideo, flush, css, hideDelayMs,
} from './dom.mjs';

const PAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../idodo-invite-2/index.html');
const open = (query, patch, setup) => openPage(PAGE, query, patch, setup);

function withDom(query, patch, fn) {
  return async () => {
    const dom = await open(query, patch);
    try { await fn(dom.window, dom.window.document); } finally { dom.window.close(); }
  };
}

const text = (doc, sel) => doc.querySelector(sel).textContent.trim();
const future = (c) => ({ ...c, date: new Date(Date.now() + 3 * 86400000 + 5 * 3600000 + 7 * 60000).toISOString() });
const past = (c) => ({ ...c, date: '2020-01-01T17:00:00+08:00' });

// 1. the doors
test('1. the page starts behind two closed doors with an "I & D" plaque', withDom('', undefined, (win, doc) => {
  assert.ok(doc.body.classList.contains('sealed'));
  assert.ok(doc.querySelector('#doors .door-left') && doc.querySelector('#doors .door-right'));
  assert.match(text(doc, '#plaque').replace(/\s+/g, ' '), /I\s*&\s*D/);
}));

test('1. clicking, Enter or Space opens the doors', async () => {
  for (const how of ['click', 'Enter', ' ']) {
    const dom = await open();
    const { document: doc, KeyboardEvent } = dom.window;
    const doors = doc.querySelector('#doors');
    if (how === 'click') doors.click();
    else doors.dispatchEvent(new KeyboardEvent('keydown', { key: how, bubbles: true }));
    assert.ok(doc.body.classList.contains('opened'), `${JSON.stringify(how)} should open`);
    assert.ok(!doc.body.classList.contains('sealed'));
    dom.window.close();
  }
});

test('1. while the doors are shut, the page behind them is inert', withDom('', undefined, (win, doc) => {
  assert.ok(doc.querySelector('#main').hasAttribute('inert'));
  doc.querySelector('#doors').click();
  assert.ok(!doc.querySelector('#main').hasAttribute('inert'));
}));

// 2. the curtain
test('2. once the doors have slid away, the curtain video plays, and the names show when it ends', async () => {
  const timers = [];
  const dom = await open('', undefined, all(recordTimers(timers), stubVideo(true)));
  const { document: doc, Event } = dom.window;
  try {
    const video = doc.querySelector('#curtain-video');
    assert.ok(video.muted && video.hasAttribute('playsinline'), 'muted and inline, so phones let it play');
    timers.length = 0;
    doc.querySelector('#doors').click();
    assert.ok(!video.played_, 'the curtain waits for the doors');
    const doorsMs = Math.min(...timers.map((t) => t.ms));
    assert.equal(doorsMs, hideDelayMs(await css(PAGE), '.doors'), 'the doors leave when style.css has slid them away');
    runTimers(timers, doorsMs);
    await flush();
    assert.ok(video.played_, 'the curtain opens after the doors');
    assert.ok(doc.querySelector('#doors').hidden);
    assert.ok(!doc.body.classList.contains('revealed'));
    video.dispatchEvent(new Event('ended'));
    assert.ok(doc.body.classList.contains('revealed'), 'names appear once the curtain is open');
  } finally {
    dom.window.close();
  }
});

test('2. if the curtain video cannot play, the curtain fades open instead', async () => {
  const timers = [];
  const dom = await open('', undefined, all(recordTimers(timers), stubVideo(false)));
  const doc = dom.window.document;
  try {
    doc.querySelector('#doors').click();
    runTimers(timers, 2000);
    await flush();
    assert.ok(doc.querySelector('#curtain-video').hidden, 'the video steps aside');
    assert.ok(doc.body.classList.contains('no-curtain-video'), 'the drawn curtain takes over');
    runTimers(timers, 3000);
    assert.ok(doc.body.classList.contains('revealed'));
  } finally {
    dom.window.close();
  }
});

test('2. if the curtain video stalls, the names still show', async () => {
  const timers = [];
  const dom = await open('', undefined, all(recordTimers(timers), stubVideo(true)));
  const doc = dom.window.document;
  try {
    doc.querySelector('#doors').click();
    runTimers(timers, 2000);
    await flush();
    runTimers(timers, 10000);
    assert.ok(doc.body.classList.contains('revealed'));
  } finally {
    dom.window.close();
  }
});

// 3. guest name
test('3. ?to=林小美 greets 林小美', withDom('?to=' + encodeURIComponent('林小美'), undefined, (win, doc) => {
  assert.equal(text(doc, '#guest-name'), '林小美');
  assert.ok(doc.querySelector('#guest-name').classList.contains('cjk'));
}));

test('3. no ?to= greets 親愛的朋友', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '#greeting'), '親愛的朋友');
}));

// 4. language
test('4. switching to English changes the text and <html lang>; ?lang=en opens in English', async () => {
  const dom = await open('?to=Amy');
  const doc = dom.window.document;
  assert.equal(doc.documentElement.lang, 'zh-Hant');
  doc.querySelector('[data-lang="en"]').click();
  assert.equal(doc.documentElement.lang, 'en');
  assert.match(text(doc, '#greeting'), /^Dear\s+Amy$/);
  dom.window.close();
  const en = await open('?lang=en');
  assert.equal(en.window.document.documentElement.lang, 'en');
  en.window.close();
});

// 5–6. date and countdown
test('5. date null: the stage says the date is coming, the countdown waits', withDom('', (c) => ({ ...c, date: null }), (win, doc) => {
  assert.equal(text(doc, '#hero-date'), '日期即將公布');
  assert.ok(doc.querySelector('#countdown-clock').hidden);
  assert.equal(text(doc, '#countdown-note'), '日期確定後就開始倒數');
}));

test('6. date ahead: three medallions show days, hours and minutes', withDom('', future, (win, doc) => {
  assert.ok(!doc.querySelector('#countdown-clock').hidden);
  assert.equal(doc.querySelectorAll('#countdown-clock .medal').length, 3);
  assert.equal(text(doc, '#cd-days'), '3');
  assert.equal(text(doc, '#cd-hours'), '5');
  assert.ok(['6', '7'].includes(text(doc, '#cd-minutes')));
}));

test('6. date passed: the countdown says 我們結婚啦', withDom('', past, (win, doc) => {
  assert.ok(doc.querySelector('#countdown-clock').hidden);
  assert.match(text(doc, '#countdown-note'), /我們結婚啦/);
}));

// 7. program
test('7. the program lists every item with time, title and icon', withDom('', undefined, (win, doc) => {
  const items = [...doc.querySelectorAll('#timeline .t-item')];
  const program = win.IDODO_CONTENT.program;
  assert.equal(items.length, program.length);
  items.forEach((li, i) => {
    assert.equal(li.querySelector('.t-time').textContent, program[i].time);
    assert.equal(li.querySelector('.t-title').textContent, program[i].zh);
    assert.match(li.querySelector('.t-icon').style.getPropertyValue('--img'), new RegExp(`icon-${program[i].icon}`));
  });
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
test('9. ?host skips the doors, leaves the page usable and makes one ?to= link per name', withDom('?host', undefined, (win, doc) => {
  assert.ok(!doc.querySelector('#host').hidden);
  assert.ok(doc.querySelector('#doors').hidden);
  assert.ok(!doc.querySelector('#main').hasAttribute('inert'));
  assert.ok(doc.body.classList.contains('revealed'));
  doc.querySelector('#host-names').value = '林小美\n\nAmy ';
  doc.querySelector('#host-make').click();
  const links = [...doc.querySelectorAll('#host-links input')].map((i) => i.value);
  assert.equal(links.length, 2);
  assert.match(links[0], new RegExp(`\\?to=${encodeURIComponent('林小美')}$`));
  assert.match(links[1], /\?to=Amy$/);
}));

test('9. guests never see the link maker', withDom('?to=Amy', undefined, (win, doc) => {
  assert.ok(doc.querySelector('#host').hidden);
}));

// 10. noindex
test('10. the page asks search engines not to index it', withDom('', undefined, (win, doc) => {
  assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/);
}));

// 11. one content file for both cards
test('11. it reads the same content.js as the first card, so one edit updates both', withDom('', undefined, (win, doc) => {
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
test('13. with reduced motion, tapping the doors shows the names at once', async () => {
  const reduce = (win) => { win.matchMedia = (q) => ({ matches: q.includes('reduce'), addEventListener() {} }); };
  const dom = await open('', undefined, reduce);
  const doc = dom.window.document;
  try {
    doc.querySelector('#doors').click();
    assert.ok(doc.querySelector('#doors').hidden);
    assert.ok(doc.body.classList.contains('revealed'));
  } finally {
    dom.window.close();
  }
});
