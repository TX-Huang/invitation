// Shared helpers for the acceptance tests: load a card's real page in jsdom and use it like a guest would.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import jsdom from 'jsdom';

const { JSDOM, requestInterceptor } = jsdom;

// Only load our own files; answer Google Fonts and anything else on the network with an empty body.
const localOnly = {
  interceptors: [
    requestInterceptor((request) => (request.url.startsWith('file:') ? undefined : new Response(''))),
  ],
};

// Open a page with a query string. `patch` edits the content object right after content.js sets it,
// before app.js reads it. `setup` runs on the window before any script. `contentName` is the global
// content.js fills in.
export async function openPage(page, query = '', patch = (c) => c, setup = () => {}, contentName = 'IDODO_CONTENT') {
  const dom = await JSDOM.fromFile(page, {
    url: pathToFileURL(page).href + query,
    runScripts: 'dangerously',
    resources: localOnly,
    pretendToBeVisual: true,
    beforeParse(win) {
      setup(win);
      let stored;
      Object.defineProperty(win, contentName, {
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

// Several setups in a row.
export const all = (...setups) => (win) => setups.forEach((setup) => setup(win));

// Replace Image so a test can see which paintings the page asks for, and finish loading them by hand.
export function recordImages(list) {
  return (win) => {
    class FakeImage {
      set src(value) { this.url = value; list.push(this); }
      get src() { return this.url; }
    }
    Object.defineProperty(win, 'Image', { configurable: true, writable: true, value: FakeImage });
  };
}

// Record timers instead of waiting for them, so a test can run them by hand.
export function recordTimers(list) {
  return (win) => {
    const real = win.setTimeout.bind(win);
    win.setTimeout = (fn, ms, ...rest) => { list.push({ fn, ms }); return real(() => {}, 0, ...rest); };
  };
}

// Run (and forget) every recorded timer due within `maxMs`.
export const runTimers = (timers, maxMs) => timers.splice(0).filter((t) => t.ms <= maxMs).forEach((t) => t.fn());

// Make videos play (or refuse to) without a real media engine.
export function stubVideo(plays) {
  return (win) => {
    win.HTMLMediaElement.prototype.play = function play() {
      this.played_ = true;
      return plays ? Promise.resolve() : Promise.reject(new Error('NotAllowedError'));
    };
  };
}

export const flush = () => new Promise((resolve) => { setImmediate(resolve); });

export const css = (page) => readFile(path.join(path.dirname(page), 'style.css'), 'utf8');

// The delay (ms) after which a rule's `visibility 0s linear Xs` transition hides it.
export function hideDelayMs(stylesheet, selector) {
  const rule = stylesheet.match(new RegExp(`(^|\\n)${selector.replace('.', '\\.')} \\{[^}]*\\}`))[0];
  return Number(rule.match(/visibility 0s linear ([\d.]+)s/)[1]) * 1000;
}
