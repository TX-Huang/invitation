/*
 * Dodo's birthday-dinner invitation: a burgundy envelope with a wax seal opens in golden light
 * onto an arched card, then the countdown, the place and a letter from the heart.
 * Everything written comes from content.js.
 */
(function () {
  'use strict';

  const TZ = 'Asia/Taipei';
  const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  const MAPS = 'https://www.google.com/maps/search/?api=1&query=';
  const ART = ['envelope', 'foil', 'seal', 'card', 'swans', 'roses-corner', 'venue'];
  const OPEN_MS = 5600; // the envelope has opened and faded: must match the .envelope hide delay in style.css

  const state = { content: null, timer: 0 };

  const $ = (sel) => document.querySelector(sel);
  const t = (key) => state.content.text[key];
  const two = (n) => String(n).padStart(2, '0');

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- time ---------- */

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

  // 2026 年 12 月 12 日（六） 18:30, as seen in Taiwan
  function whenLine(iso) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    });
    const p = {};
    fmt.formatToParts(new Date(iso)).forEach((part) => { p[part.type] = part.value; });
    const wd = new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day))).getUTCDay();
    return `${p.year} 年 ${Number(p.month)} 月 ${Number(p.day)} 日（${WEEK[wd]}） ${p.hour}:${p.minute}`;
  }

  /* ---------- rendering ---------- */

  function renderText() {
    document.querySelectorAll('[data-t]').forEach((node) => { node.textContent = t(node.dataset.t); });
    $('#envelope').setAttribute('aria-label', t('openLabel'));
    document.querySelectorAll('[data-to]').forEach((node) => { node.textContent = state.content.to; });
  }

  function renderWhenWhere() {
    const { date, venue } = state.content;
    $('#card-date').textContent = whenLine(date);
    $('#venue-when').textContent = whenLine(date);
    $('#venue-name').textContent = venue.name;
    $('#venue-area').textContent = venue.area;
    $('#venue-address').textContent = venue.address || '';
    $('#venue-address').hidden = !venue.address;
    $('#map-link').href = MAPS + encodeURIComponent(venue.address || `${venue.name} ${venue.area}`);
  }

  function renderLetter() {
    const box = $('#letter-text');
    box.textContent = '';
    state.content.letter.forEach((line) => box.append(el('p', '', line)));
    $('#letter-from').textContent = `—— ${state.content.from}`;
  }

  function updateCountdown() {
    const parts = countdownParts(state.content.date, Date.now());
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

  /* ---------- envelope ---------- */

  function reducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // The light has faded: the card's words appear, and the page can scroll.
  function reveal() {
    $('#envelope').hidden = true;
    document.body.classList.add('revealed');
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
    $('#main').focus({ preventScroll: true });
    if (reducedMotion()) reveal();
    else window.setTimeout(reveal, OPEN_MS);
  }

  function setupEnvelope() {
    const env = $('#envelope');
    $('#main').setAttribute('inert', '');
    env.addEventListener('click', openEnvelope);
    env.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openEnvelope();
    });
  }

  /* ---------- reveal on scroll + art ---------- */

  function setupReveal() {
    const nodes = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    nodes.forEach((node) => observer.observe(node));
  }

  // Paintings switch on only once they load, so the drawn stand-ins show until then.
  function loadArt() {
    const root = document.documentElement;
    ART.forEach((name) => {
      const img = new Image();
      img.onload = () => root.classList.add(`art-${name}`);
      img.src = `art/${name}.webp`;
    });
  }

  /* ---------- start ---------- */

  function boot() {
    state.content = window.BDAY_CONTENT;
    renderText();
    renderWhenWhere();
    renderLetter();
    updateCountdown();
    if (countdownParts(state.content.date, Date.now()).state === 'ahead') {
      state.timer = window.setInterval(updateCountdown, 1000);
    }
    setupReveal();
    setupEnvelope();
    loadArt();
  }

  window.BDAY = { countdownParts, whenLine, open: openEnvelope };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
