/*
 * Isaac & Dodo invitation: envelope, guest name, language, countdown,
 * program, map link and the host's personal-link maker.
 * Content (text, date, venue, program) comes from content.js.
 */
(function () {
  'use strict';

  const TZ = 'Asia/Taipei';
  const CJK = /[㐀-鿿豈-﫿぀-ヿ]/;
  const WEEK_ZH = ['日', '一', '二', '三', '四', '五', '六'];
  const WEEK_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  const MAPS = 'https://www.google.com/maps/search/?api=1&query=';
  const ICONS = ['welcome', 'ceremony', 'cocktail', 'dinner', 'cake', 'dance', 'stars', 'goodnight'];
  const ART = ['envelope', 'card-frame', 'clouds', 'garden', 'blossoms', 'birds', 'bow'];
  const OPEN_MS = 7400; // must match the end of the opening timeline in style.css
  const ART_WAIT_MS = 2500; // show the envelope even if its painting is slow

  const state = { content: null, lang: 'zh', guest: '', timer: 0 };

  const $ = (sel) => document.querySelector(sel);
  const t = (key) => state.content.text[state.lang][key];

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- time ---------- */

  function countdownParts(targetIso, nowMs) {
    if (!targetIso) return { state: 'unset' };
    const left = Date.parse(targetIso) - nowMs;
    if (left <= 0) return { state: 'past' };
    const s = Math.floor(left / 1000);
    return {
      state: 'ahead',
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
  }

  // Calendar parts of an ISO time as seen in Taiwan.
  function taipeiParts(iso) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    });
    const p = {};
    fmt.formatToParts(new Date(iso)).forEach((part) => { p[part.type] = part.value; });
    const y = Number(p.year);
    const m = Number(p.month);
    const d = Number(p.day);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return { y, m, d, wd, hh: Number(p.hour), mm: p.minute };
  }

  function dateLine(p) {
    if (state.lang === 'zh') return `${p.y} 年 ${p.m} 月 ${p.d} 日（${WEEK_ZH[p.wd]}）`;
    return `${WEEK_EN[p.wd]}, ${p.d} ${MONTH_EN[p.m - 1]} ${p.y}`;
  }

  function timeLine(p) {
    if (state.lang === 'zh') return `${String(p.hh).padStart(2, '0')}:${p.mm}`;
    const h12 = ((p.hh + 11) % 12) + 1;
    return `${h12}:${p.mm} ${p.hh < 12 ? 'AM' : 'PM'}`;
  }

  /* ---------- rendering ---------- */

  function renderStaticText() {
    document.querySelectorAll('[data-t]').forEach((node) => { node.textContent = t(node.dataset.t); });
    $('#envelope').setAttribute('aria-label', t('openLabel'));
    $('#host-names').placeholder = t('hostPlaceholder');
  }

  function renderGreeting() {
    const g = $('#greeting');
    g.textContent = '';
    if (!state.guest) {
      g.textContent = t('dearFriend');
      return;
    }
    const name = el('span', 'script', state.guest);
    name.id = 'guest-name';
    name.classList.toggle('cjk', CJK.test(state.guest));
    g.append(el('span', 'dear', t('dear')), ' ', name);
  }

  function renderHeroDate() {
    const box = $('#hero-date');
    box.textContent = '';
    box.classList.toggle('tba', !state.content.date);
    if (!state.content.date) {
      box.textContent = t('dateTba');
      return;
    }
    const p = taipeiParts(state.content.date);
    const month = state.lang === 'zh' ? `${p.m} 月` : MONTH_EN[p.m - 1];
    const week = state.lang === 'zh' ? `星期${WEEK_ZH[p.wd]}` : WEEK_EN[p.wd];
    box.append(
      el('p', 'hd-month', month),
      el('p', 'hd-day', String(p.d)),
      el('p', 'hd-week', week),
      el('p', 'hd-year', `${p.y} · ${timeLine(p)}`),
    );
  }

  function venueName() {
    const name = state.content.venue.name;
    return name ? name[state.lang] : t('venueTba');
  }

  function renderVenue() {
    const { address } = state.content.venue;
    $('#hero-venue').textContent = venueName();
    $('#cele-venue').textContent = venueName();
    $('#cele-address').textContent = address || '';
    $('#cele-address').hidden = !address;
    const map = $('#map-link');
    map.hidden = !address;
    if (address) map.href = MAPS + encodeURIComponent(address);
    else map.removeAttribute('href');
  }

  function renderWhen() {
    const { date } = state.content;
    const p = date && taipeiParts(date);
    $('#cele-when').textContent = p ? `${dateLine(p)} · ${timeLine(p)}` : t('dateTba');
    $('#countdown-sub').textContent = p ? t('countdownUntil').replace('{date}', dateLine(p)) : '';
    $('#day-sub').textContent = p ? `${t('dayEyebrow')} · ${dateLine(p)}` : t('dayEyebrow');
  }

  function renderStory() {
    const box = $('#story-text');
    box.textContent = '';
    state.content.story[state.lang].forEach((line) => box.append(el('p', '', line)));
  }

  function renderDateStrip() {
    const strip = $('#datestrip');
    strip.textContent = '';
    strip.hidden = !state.content.date;
    if (!state.content.date) return;
    const p = taipeiParts(state.content.date);
    for (let k = -2; k <= 2; k += 1) {
      const day = new Date(Date.UTC(p.y, p.m - 1, p.d + k)).getUTCDate();
      strip.append(el('li', k === 0 ? 'wed' : '', String(day)));
    }
  }

  function timelineRow(item) {
    const li = el('li', 't-item');
    li.dataset.reveal = '';
    const text = el('div', 't-text');
    text.append(el('span', 't-time', item.time), el('span', 't-title', item[state.lang]));
    const icon = el('span', 't-icon');
    if (ICONS.includes(item.icon)) icon.style.setProperty('--img', `url("art/icon-${item.icon}.webp")`);
    li.append(text, el('span', 't-dot'), icon);
    return li;
  }

  function renderTimeline() {
    const list = $('#timeline');
    list.textContent = '';
    state.content.program.forEach((item) => list.append(timelineRow(item)));
    observeReveal(list);
  }

  function updateCountdown() {
    const parts = countdownParts(state.content.date, Date.now());
    const ahead = parts.state === 'ahead';
    $('#countdown-clock').hidden = !ahead;
    $('#countdown-note').hidden = ahead;
    if (!ahead) {
      $('#countdown-note').textContent = t(parts.state === 'past' ? 'countdownPast' : 'countdownUnset');
      return;
    }
    ['days', 'hours', 'minutes', 'seconds'].forEach((unit) => {
      $(`#cd-${unit}`).textContent = String(parts[unit]);
    });
  }

  function render() {
    renderStaticText();
    renderGreeting();
    renderHeroDate();
    renderVenue();
    renderWhen();
    renderStory();
    renderDateStrip();
    renderTimeline();
    updateCountdown();
  }

  /* ---------- language ---------- */

  function setLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'zh';
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-Hant';
    document.querySelectorAll('[data-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang));
    });
    render();
  }

  function setupLang() {
    document.querySelectorAll('[data-lang]').forEach((b) => {
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });
  }

  /* ---------- envelope + music ---------- */

  function reducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function playMusic() {
    const audio = $('#audio');
    if (!state.content.music) return;
    try {
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
      $('#music').setAttribute('aria-pressed', 'true');
    } catch (err) {
      // Autoplay refused or not supported: the guest can press the music button.
    }
  }

  function openEnvelope() {
    const body = document.body;
    if (body.classList.contains('opened')) return;
    body.classList.remove('sealed');
    body.classList.add('opened');
    const env = $('#envelope');
    env.setAttribute('aria-hidden', 'true');
    env.tabIndex = -1;
    $('#main').removeAttribute('inert');
    window.setTimeout(() => { env.hidden = true; }, reducedMotion() ? 0 : OPEN_MS);
    $('#main').focus({ preventScroll: true });
    playMusic();
  }

  function setupEnvelope() {
    const env = $('#envelope');
    if (document.body.classList.contains('sealed')) $('#main').setAttribute('inert', '');
    env.addEventListener('click', openEnvelope);
    env.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openEnvelope();
    });
  }

  function setupMusic() {
    const btn = $('#music');
    const audio = $('#audio');
    if (!state.content.music) return;
    audio.src = state.content.music;
    btn.hidden = false;
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      if (on) playMusic();
      else audio.pause();
    });
  }

  /* ---------- host: personal links ---------- */

  function pageUrl() {
    return window.location.href.split(/[?#]/)[0];
  }

  function copyText(text, button) {
    const done = () => {
      button.textContent = t('hostCopied');
      window.setTimeout(() => { button.textContent = t('hostCopy'); }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => {});
    }
  }

  function linkRow(name) {
    const li = el('li');
    const input = el('input');
    input.readOnly = true;
    input.value = `${pageUrl()}?to=${encodeURIComponent(name)}`;
    const copy = el('button', 'ghost', t('hostCopy'));
    copy.type = 'button';
    copy.addEventListener('click', () => copyText(input.value, copy));
    li.append(el('span', 'who', name), input, copy);
    return li;
  }

  function makeLinks() {
    const names = $('#host-names').value.split('\n').map((n) => n.trim()).filter(Boolean);
    const list = $('#host-links');
    list.textContent = '';
    names.forEach((name) => list.append(linkRow(name)));
  }

  function setupHost(isHost) {
    if (!isHost) return;
    $('#host').hidden = false;
    document.body.classList.remove('sealed');
    document.body.classList.add('opened', 'hosting');
    $('#envelope').hidden = true;
    $('#main').removeAttribute('inert');
    $('#host-make').addEventListener('click', makeLinks);
    $('#host-copy-all').addEventListener('click', (e) => {
      const all = [...document.querySelectorAll('#host-links li')]
        .map((li) => `${li.querySelector('.who').textContent}\t${li.querySelector('input').value}`);
      copyText(all.join('\n'), e.currentTarget);
    });
  }

  /* ---------- reveal on scroll + art ---------- */

  let observer = null;

  function observeReveal(root) {
    root.querySelectorAll('[data-reveal]').forEach((node) => {
      if (observer) observer.observe(node);
      else node.classList.add('in');
    });
  }

  function setupReveal() {
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -6% 0px' });
    }
    observeReveal(document);
  }

  // Paintings switch on only once they load, so the colour stand-ins show until then.
  // The envelope fades in when its painting is ready (or after ART_WAIT_MS at the latest).
  function loadArt() {
    const root = document.documentElement;
    const ready = () => root.classList.add('art-ready');
    window.setTimeout(ready, ART_WAIT_MS);
    ART.forEach((name) => {
      const img = new Image();
      img.onload = () => {
        root.classList.add(`art-${name}`);
        if (name === 'envelope') ready();
      };
      if (name === 'envelope') img.onerror = ready;
      img.src = `art/${name}.webp`;
    });
  }

  /* ---------- start ---------- */

  function cleanName(raw) {
    return (raw || '').trim().slice(0, 40);
  }

  function startClock() {
    window.clearInterval(state.timer);
    if (countdownParts(state.content.date, Date.now()).state !== 'ahead') return;
    state.timer = window.setInterval(updateCountdown, 1000);
  }

  function boot() {
    const params = new URLSearchParams(window.location.search);
    state.content = window.IDODO_CONTENT;
    state.guest = cleanName(params.get('to'));
    setupReveal();
    setupLang();
    setupEnvelope();
    setupMusic();
    setupHost(params.has('host'));
    setLang(params.get('lang'));
    startClock();
    loadArt();
  }

  window.IDODO = { countdownParts, setLang, open: openEnvelope };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
