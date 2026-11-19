// Acceptance tests for idodo-invite: load the real page in jsdom and use it like a guest would.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import jsdom from 'jsdom';

const { JSDOM, requestInterceptor } = jsdom;

const PAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../idodo-invite/index.html');

// Only load our own files; answer Google Fonts and anything else on the network with an empty body.
const localOnly = {
  interceptors: [
    requestInterceptor((request) => (request.url.startsWith('file:') ? undefined : new Response(''))),
  ],
};

// Open the page with a query string. `patch` edits the content object right
// after content.js sets it, before app.js reads it.
async function open(query = '', patch = (c) => c) {
  const dom = await JSDOM.fromFile(PAGE, {
    url: pathToFileURL(PAGE).href + query,
    runScripts: 'dangerously',
    resources: localOnly,
    pretendToBeVisual: true,
    beforeParse(win) {
      let stored;
      Object.defineProperty(win, 'IDODO_CONTENT', {
        configurable: true,
        get: () => stored,
        set: (v) => { stored = patch(structuredClone(v)); },
      });
    },
  });
  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete') resolve();
    else dom.window.addEventListener('load', resolve);
  });
  return dom;
}

function withDom(query, patch, fn) {
  return async () => {
    const dom = await open(query, patch);
    try { await fn(dom.window, dom.window.document); } finally { dom.window.close(); }
  };
}

const text = (doc, sel) => doc.querySelector(sel).textContent.trim();

// 1. envelope
test('1. page starts sealed; clicking the envelope opens it', withDom('', undefined, (win, doc) => {
  assert.ok(doc.body.classList.contains('sealed'));
  assert.ok(!doc.body.classList.contains('opened'));
  doc.querySelector('#envelope').click();
  assert.ok(doc.body.classList.contains('opened'));
  assert.ok(!doc.body.classList.contains('sealed'));
}));

test('1. Enter and Space on the envelope also open it', async () => {
  for (const key of ['Enter', ' ']) {
    const dom = await open();
    const { document: doc, KeyboardEvent } = dom.window;
    doc.querySelector('#envelope').dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    assert.ok(doc.body.classList.contains('opened'), `key ${JSON.stringify(key)} should open`);
    dom.window.close();
  }
});

test('1. while sealed, the page behind the envelope is inert', withDom('', undefined, (win, doc) => {
  assert.ok(doc.querySelector('#main').hasAttribute('inert'));
  doc.querySelector('#envelope').click();
  assert.ok(!doc.querySelector('#main').hasAttribute('inert'));
}));

// 2–3. guest name
test('2. ?to=林小美 greets 林小美 in the CJK font', withDom('?to=' + encodeURIComponent('林小美'), undefined, (win, doc) => {
  assert.equal(text(doc, '#guest-name'), '林小美');
  assert.ok(doc.querySelector('#guest-name').classList.contains('cjk'));
  assert.match(text(doc, '#greeting'), /親愛的/);
}));

test('2. ?to=Amy greets Amy in the script font', withDom('?to=Amy', undefined, (win, doc) => {
  assert.equal(text(doc, '#guest-name'), 'Amy');
  assert.ok(!doc.querySelector('#guest-name').classList.contains('cjk'));
}));

test('3. no ?to= greets 親愛的朋友', withDom('', undefined, (win, doc) => {
  assert.equal(text(doc, '#greeting'), '親愛的朋友');
}));

// 4. language
test('4. switching to English changes the text and <html lang>', withDom('?to=Amy', undefined, (win, doc) => {
  assert.equal(doc.documentElement.lang, 'zh-Hant');
  const zhEyebrow = text(doc, '#hero-eyebrow');
  doc.querySelector('[data-lang="en"]').click();
  assert.equal(doc.documentElement.lang, 'en');
  assert.notEqual(text(doc, '#hero-eyebrow'), zhEyebrow);
  assert.match(text(doc, '#greeting'), /^Dear\s+Amy$/);
  assert.equal(doc.querySelector('[data-lang="en"]').getAttribute('aria-pressed'), 'true');
  doc.querySelector('[data-lang="zh"]').click();
  assert.equal(text(doc, '#hero-eyebrow'), zhEyebrow);
}));

test('4. ?lang=en opens in English', withDom('?lang=en', undefined, (win, doc) => {
  assert.equal(doc.documentElement.lang, 'en');
  assert.equal(text(doc, '#greeting'), 'Dear friend');
}));

// 5. no date yet
const noDate = (c) => ({ ...c, date: null });
test('5. date null: hero says 日期即將公布, countdown waits', withDom('', noDate, (win, doc) => {
  assert.equal(text(doc, '#hero-date'), '日期即將公布');
  assert.equal(text(doc, '#countdown-note'), '日期確定後就開始倒數');
  assert.ok(doc.querySelector('#countdown-clock').hidden);
}));

// 6. countdown
test('6. countdownParts splits the time left', withDom('', undefined, (win) => {
  // Spread copies the jsdom object into this realm so deepEqual compares values only.
  const countdownParts = (...args) => ({ ...win.IDODO.countdownParts(...args) });
  const target = '2027-05-20T17:00:00+08:00';
  assert.deepEqual(
    countdownParts(target, Date.parse('2027-05-18T15:58:57+08:00')),
    { state: 'ahead', days: 2, hours: 1, minutes: 1, seconds: 3 },
  );
  assert.equal(countdownParts(target, Date.parse('2027-05-21T00:00:00+08:00')).state, 'past');
  assert.deepEqual(countdownParts(null, Date.now()), { state: 'unset' });
}));

const future = (c) => ({ ...c, date: '2099-05-20T17:00:00+08:00' });
test('6. date ahead: the clock shows numbers', withDom('', future, (win, doc) => {
  assert.ok(!doc.querySelector('#countdown-clock').hidden);
  assert.match(text(doc, '#cd-days'), /^\d+$/);
  assert.ok(Number(text(doc, '#cd-days')) > 1000);
  for (const id of ['#cd-hours', '#cd-minutes', '#cd-seconds']) assert.match(text(doc, id), /^\d{1,2}$/);
}));

const past = (c) => ({ ...c, date: '2020-01-01T12:00:00+08:00' });
test('6. date passed: countdown says 我們結婚啦', withDom('', past, (win, doc) => {
  assert.match(text(doc, '#countdown-note'), /我們結婚啦/);
  assert.ok(doc.querySelector('#countdown-clock').hidden);
}));

// 7. program
test('7. the program lists every item with time, title and icon', withDom('', undefined, (win, doc) => {
  const items = win.IDODO_CONTENT.program;
  const rows = doc.querySelectorAll('#timeline li');
  assert.ok(items.length >= 5);
  assert.equal(rows.length, items.length);
  rows.forEach((row, i) => {
    assert.equal(row.querySelector('.t-time').textContent, items[i].time);
    assert.equal(row.querySelector('.t-title').textContent, items[i].zh);
    assert.ok(row.querySelector('.t-icon'));
  });
}));

// 8. date strip
test('8. date set: a five-day strip with the wedding day in a heart', withDom('', future, (win, doc) => {
  const days = doc.querySelectorAll('#datestrip li');
  assert.equal(days.length, 5);
  const wed = doc.querySelector('#datestrip li.wed');
  assert.equal(wed, days[2]);
  assert.equal(wed.textContent.trim(), '20');
  assert.equal(days[0].textContent.trim(), '18');
}));

// 9. map
test('9. address null: no map button', withDom('', (c) => ({ ...c, venue: { ...c.venue, address: null } }), (win, doc) => {
  assert.ok(doc.querySelector('#map-link').hidden);
}));

test('9. address set: map button searches that address', withDom('', (c) => ({ ...c, venue: { ...c.venue, address: '新竹市東區光復路二段101號' } }), (win, doc) => {
  const a = doc.querySelector('#map-link');
  assert.ok(!a.hidden);
  assert.equal(a.href, 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('新竹市東區光復路二段101號'));
}));

// 10. host link maker
test('10. ?host makes one ?to= link per name', withDom('?host', undefined, (win, doc) => {
  const panel = doc.querySelector('#host');
  assert.ok(!panel.hidden);
  doc.querySelector('#host-names').value = '林小美\n\n  Amy  \n';
  doc.querySelector('#host-make').click();
  const links = [...doc.querySelectorAll('#host-links input')].map((i) => i.value);
  assert.equal(links.length, 2);
  assert.ok(links[0].endsWith('/idodo-invite/index.html?to=' + encodeURIComponent('林小美')), links[0]);
  assert.ok(links[1].endsWith('?to=Amy'), links[1]);
}));

test('10. ?host skips the envelope and leaves the page usable', withDom('?host', undefined, (win, doc) => {
  assert.ok(doc.querySelector('#envelope').hidden);
  assert.ok(!doc.querySelector('#main').hasAttribute('inert'));
  assert.ok(!doc.body.classList.contains('sealed'));
}));

test('10. guests never see the link maker', withDom('?to=Amy', undefined, (win, doc) => {
  assert.ok(doc.querySelector('#host').hidden);
}));

// 11. noindex
test('11. the page asks search engines not to index it', withDom('', undefined, (win, doc) => {
  assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/);
}));
