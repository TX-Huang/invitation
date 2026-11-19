/*
 * 慈惠道場 堂慶 invitation: a bluebird (the Queen Mother's messenger) brings a letter;
 * it opens in golden light onto a hanging scroll. Guest name, dates, countdown, program,
 * place, the dojo's deities, and the host's link maker. Everything written comes from content.js.
 */
(function () {
  'use strict';

  const TZ = 'Asia/Taipei';
  const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  const DIGIT = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const MAPS = 'https://www.google.com/maps/search/?api=1&query=';
  const ART = ['heaven', 'envelope-back', 'env-foil', 'env-inside', 'seal-red', 'yaochi', 'cloud-band', 'peach-branch',
    'lotus-pond'];
  const DELIVERY_MS = 4800; // the letter has flown at you and fills the screen: must match its arrival in style.css
  const OPEN_MS = 5200; // the golden light has faded: must match the .sky hide delay in style.css

  const state = { content: null, guest: '', timer: 0, wantsOpen: false };

  const $ = (sel) => document.querySelector(sel);
  const t = (key) => state.content.text[key];
  const two = (n) => String(n).padStart(2, '0');

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- dates ---------- */

  // '2027-01-16' → { y, m, d, wd }
  function dayParts(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return { y, m, d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
  }

  // 16 → 十六, 20 → 二十, 31 → 三十一
  function cnNumber(n) {
    if (n < 10) return DIGIT[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return `${tens === 1 ? '' : DIGIT[tens]}十${ones ? DIGIT[ones] : ''}`;
  }

  // 2027 → 二〇二七
  const cnYear = (y) => String(y).split('').map((c) => DIGIT[Number(c)]).join('');

  // 謹訂於國曆二〇二七年一月十六日至十七日
  function scrollDates(days) {
    const a = dayParts(days[0]);
    const b = dayParts(days[days.length - 1]);
    const from = `${cnYear(a.y)}年${cnNumber(a.m)}月${cnNumber(a.d)}日`;
    if (days.length === 1) return `${t('held')}國曆${from}`;
    const to = a.m === b.m ? `${cnNumber(b.d)}日` : `${cnNumber(b.m)}月${cnNumber(b.d)}日`;
    return `${t('held')}國曆${from}至${to}`;
  }

  const dayLabel = (iso) => {
    const p = dayParts(iso);
    return `${p.m} 月 ${p.d} 日（${WEEK[p.wd]}）`;
  };

  function taipeiClock(iso) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    return fmt.format(new Date(iso));
  }

  // The countdown runs to the start time, or to midnight of the first day if there is none yet.
  const target = () => state.content.start || `${state.content.days[0]}T00:00:00+08:00`;

  function countdownParts(targetIso, nowMs) {
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

  /* ---------- rendering ---------- */

  function renderStaticText() {
    document.querySelectorAll('[data-t]').forEach((node) => { node.textContent = t(node.dataset.t); });
    $('#sky').setAttribute('aria-label', t('openLabel'));
    $('#host-names').placeholder = t('hostPlaceholder');
  }

  function renderGuest() {
    const who = state.guest || t('everyone');
    $('#letter-to').textContent = who;
    $('#scroll-guest').textContent = `${t('invite')} ${who}`;
  }

  function renderDates() {
    const { days, start } = state.content;
    // two columns on the scroll: break after the year, so the date is not split in the middle
    const line = scrollDates(days);
    const cut = line.indexOf('年') + 1;
    $('#scroll-dates').replaceChildren(el('span', '', line.slice(0, cut)), el('span', '', line.slice(cut)));
    const list = $('#dates');
    list.textContent = '';
    days.forEach((iso) => list.append(el('li', '', dayLabel(iso))));
    $('#time-line').textContent = start ? `${taipeiClock(start)} 開始` : t('timeTba');
  }

  function renderPlace() {
    const { name, address } = state.content.venue;
    $('#venue-name').textContent = name;
    $('#venue-address').textContent = address || t('addressTba');
    const map = $('#map-link');
    map.hidden = !address;
    if (address) map.href = MAPS + encodeURIComponent(address);
    else map.removeAttribute('href');
    $('#site-link').href = state.content.site;
  }

  function programDay(dayNo, items) {
    const box = el('div', 'p-block');
    box.dataset.reveal = '';
    box.append(el('h3', 'p-day', dayLabel(state.content.days[dayNo - 1])));
    const list = el('ol', 'p-list');
    items.forEach((item) => {
      const li = el('li', 'p-item');
      li.append(el('span', 'p-time', item.time), ' ', el('span', 'p-title', item.title));
      list.append(li);
    });
    box.append(list);
    return box;
  }

  function renderProgram() {
    const box = $('#program');
    box.textContent = '';
    const items = [...state.content.program].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
    $('#program-note').textContent = t('programTba');
    $('#program-note').hidden = items.length > 0;
    state.content.days.forEach((iso, i) => {
      const dayItems = items.filter((item) => item.day === i + 1);
      if (dayItems.length) box.append(programDay(i + 1, dayItems));
    });
  }

  function renderDeities() {
    const list = $('#deities');
    list.textContent = '';
    state.content.deities.forEach((deity) => {
      const li = el('li', `deity${deity.role === '主祀' ? ' main' : ''}`);
      li.dataset.reveal = '';
      const img = el('img', 'd-img');
      img.src = `art/deity-${deity.key}.webp`;
      img.alt = '';
      li.append(img, el('span', 'd-role', deity.role), el('span', 'd-name', deity.name));
      list.append(li);
    });
  }

  function updateCountdown() {
    const parts = countdownParts(target(), Date.now());
    const ahead = parts.state === 'ahead';
    $('#countdown-clock').hidden = !ahead;
    $('#countdown-note').hidden = ahead;
    if (!ahead) {
      $('#countdown-note').textContent = t('countdownPast');
      return;
    }
    $('#cd-days').textContent = String(parts.days);
    ['hours', 'minutes', 'seconds'].forEach((unit) => { $(`#cd-${unit}`).textContent = two(parts[unit]); });
  }

  function render() {
    renderStaticText();
    renderGuest();
    renderDates();
    renderPlace();
    renderProgram();
    renderDeities();
    updateCountdown();
  }

  /* ---------- the bluebird, the letter, the light ---------- */

  function reducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // The light has faded: the scroll unrolls and the page can scroll.
  function reveal() {
    $('#sky').hidden = true;
    document.body.classList.add('revealed');
  }

  function openLetter() {
    const body = document.body;
    if (body.classList.contains('opened')) return;
    if (!body.classList.contains('landed')) {
      state.wantsOpen = true; // opened as soon as the bird has brought it
      return;
    }
    body.classList.remove('sealed');
    body.classList.add('opened');
    const sky = $('#sky');
    sky.setAttribute('aria-hidden', 'true');
    sky.tabIndex = -1;
    $('#main').removeAttribute('inert');
    $('#main').focus({ preventScroll: true });
    if (reducedMotion()) reveal();
    else window.setTimeout(reveal, OPEN_MS);
  }

  // The bluebird lets go of the letter in front of you.
  function land() {
    document.body.classList.add('landed');
    if (state.wantsOpen) openLetter();
  }

  function setupSky() {
    const sky = $('#sky');
    if (document.body.classList.contains('sealed')) $('#main').setAttribute('inert', '');
    sky.addEventListener('click', openLetter);
    sky.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openLetter();
    });
    if (reducedMotion()) land();
    else window.setTimeout(land, DELIVERY_MS);
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
    if (!isHost) return false;
    $('#host').hidden = false;
    document.body.classList.remove('sealed');
    document.body.classList.add('landed', 'opened', 'hosting');
    reveal();
    $('#main').removeAttribute('inert');
    $('#host-make').addEventListener('click', makeLinks);
    $('#host-copy-all').addEventListener('click', (e) => {
      const all = [...document.querySelectorAll('#host-links li')]
        .map((li) => `${li.querySelector('.who').textContent}\t${li.querySelector('input').value}`);
      copyText(all.join('\n'), e.currentTarget);
    });
    return true;
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

  // Paintings switch on only once they load, so the stand-ins show until then.
  function loadArt() {
    const root = document.documentElement;
    ART.forEach((name) => {
      const img = new Image();
      img.onload = () => root.classList.add(`art-${name}`);
      img.src = `art/${name}.webp`;
    });
  }

  /* ---------- start ---------- */

  function cleanName(raw) {
    return (raw || '').trim().slice(0, 40);
  }

  function startClock() {
    window.clearInterval(state.timer);
    if (countdownParts(target(), Date.now()).state !== 'ahead') return;
    state.timer = window.setInterval(updateCountdown, 1000);
  }

  function boot() {
    const params = new URLSearchParams(window.location.search);
    state.content = window.CIHUI_CONTENT;
    state.guest = cleanName(params.get('to'));
    render();
    setupReveal();
    if (!setupHost(params.has('host'))) setupSky();
    startClock();
    loadArt();
  }

  window.CIHUI = { countdownParts, scrollDates, open: openLetter };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
