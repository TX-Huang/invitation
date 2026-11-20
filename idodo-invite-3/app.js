/*
 * Dodo's birthday-dinner invitation: a burgundy envelope with a wax seal opens like a spell — the seal gathers
 * light, a ring of gold light lights the foil roses, gold dust swirls out with rose petals — onto an arched card,
 * then the countdown, the place and a letter from the heart.
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

  /* ---------- the spell: sparkles, gold dust, petals (drawn on a canvas) ---------- */

  const fx = { ctx: null, motes: [], petals: [], spark: null, petal: [], ring: null, running: false, last: 0, until: 0 };

  // a sparkle drawn once: a thin gold cross with a white point
  function makeSpark() {
    const n = 64;
    const h = n / 2;
    const c = el('canvas');
    c.width = n;
    c.height = n;
    const g = c.getContext('2d');
    [[1, 0], [0, 1]].forEach(([ax, ay]) => {
      const lg = g.createLinearGradient(h - ax * h, h - ay * h, h + ax * h, h + ay * h);
      lg.addColorStop(0, 'rgba(255, 214, 140, 0)');
      lg.addColorStop(0.5, 'rgba(255, 226, 160, .95)');
      lg.addColorStop(1, 'rgba(255, 214, 140, 0)');
      g.fillStyle = lg;
      if (ax) g.fillRect(0, h - 1.2, n, 2.4);
      else g.fillRect(h - 1.2, 0, 2.4, n);
    });
    const rg = g.createRadialGradient(h, h, 0, h, h, h * 0.4);
    rg.addColorStop(0, 'rgba(255, 255, 248, 1)');
    rg.addColorStop(0.4, 'rgba(255, 220, 150, .75)');
    rg.addColorStop(1, 'rgba(255, 220, 150, 0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, n, n);
    return c;
  }

  // a rose petal drawn once, in a blush pink and in wine
  function makePetal(light, dark) {
    const n = 48;
    const c = el('canvas');
    c.width = n;
    c.height = n;
    const g = c.getContext('2d');
    const s = n * 0.44;
    g.translate(n / 2, n / 2);
    const fill = g.createLinearGradient(0, -s, 0, s);
    fill.addColorStop(0, light);
    fill.addColorStop(1, dark);
    g.fillStyle = fill;
    g.beginPath();
    g.moveTo(0, -s);
    g.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.75, s * 0.75, 0, s);
    g.bezierCurveTo(-s * 0.75, s * 0.75, -s * 0.95, -s * 0.55, 0, -s);
    g.fill();
    // a sheen across one side, and a faint fold down the middle
    g.globalCompositeOperation = 'source-atop';
    const sheen = g.createRadialGradient(-s * 0.3, -s * 0.3, 0, -s * 0.3, -s * 0.3, s * 1.1);
    sheen.addColorStop(0, 'rgba(255, 255, 255, .45)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
    g.fillStyle = sheen;
    g.fillRect(-s, -s, s * 2, s * 2);
    g.strokeStyle = 'rgba(120, 30, 50, .18)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, -s * 0.8);
    g.quadraticCurveTo(s * 0.12, 0, 0, s * 0.85);
    g.stroke();
    return c;
  }

  // a mote of light: x, y from the seal (px), velocity in px/s, spin turns it around the seal (rad/s)
  function mote(x, y, vx, vy, life, size, spin = 0) {
    fx.motes.push({ x, y, vx, vy, life, size, spin, age: 0, tw: Math.random() * 6.3, twV: 4 + Math.random() * 5 });
  }

  // motes drift in towards the seal from all around, as it gathers light
  function gather(n) {
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const r = 120 + Math.random() * 150;
      const t = 0.5 + Math.random() * 0.25;
      mote(Math.cos(a) * r, Math.sin(a) * r, -Math.cos(a) * r / t, -Math.sin(a) * r / t, t, 1 + Math.random() * 1.6, 1.2);
    }
  }

  // the flash on release: sparkles thrown out from the seal
  function flare(n) {
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const v = 60 + Math.random() * 160;
      mote(Math.cos(a) * 20, Math.sin(a) * 20, Math.cos(a) * v, Math.sin(a) * v, 0.8 + Math.random() * 0.8, 1.4 + Math.random() * 2);
    }
  }

  // gold dust swirling up out of the opening (just below the seal), turning as it rises
  function swirl(n) {
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const r = 10 + Math.random() * 40;
      mote(Math.cos(a) * r, 40 + Math.sin(a) * r * 0.4, Math.cos(a) * 50, -(70 + Math.random() * 110), 1.6 + Math.random() * 1.4,
        1 + Math.random() * 2, 1.6 * (Math.random() < 0.5 ? -1 : 1));
    }
  }

  // rose petals fly out of the opening towards you, tumbling
  function petals(n) {
    for (let i = 0; i < n; i += 1) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
      const v = 0.6 + Math.random() * 1.2;
      fx.petals.push({
        x: (Math.random() - 0.5) * 60, y: 40, z: 1, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: -(0.15 + Math.random() * 0.35),
        size: 16 + Math.random() * 14, rot: Math.random() * 6.3, spin: (Math.random() - 0.5) * 4,
        flip: Math.random() * 6.3, flipV: 2 + Math.random() * 3, age: 0, life: 3.5 + Math.random() * 1.5,
        sprite: fx.petal[i % fx.petal.length],
      });
    }
  }

  // a few sparkles twinkling here and there over the screen
  function twinkle(n) {
    for (let i = 0; i < n; i += 1) {
      mote((Math.random() - 0.5) * window.innerWidth, (Math.random() - 0.5) * window.innerHeight, 0, -6, 1.2 + Math.random() * 1.6,
        1 + Math.random() * 1.8);
    }
  }

  // the ring grows like style.css's cubic-bezier(.33, 1, .68, 1): an ease-out cubic
  function ringRadius(ms) {
    const u = Math.min(1, Math.max(0, ms / fx.ring.dur));
    return fx.ring.r0 + (fx.ring.r1 - fx.ring.r0) * (1 - (1 - u) ** 3);
  }

  // sparkles thrown off the edge of the ring as it spreads
  function ringDust(now) {
    if (!fx.ring || now - fx.ring.start >= fx.ring.dur * 0.75) return;
    const r = ringRadius(now - fx.ring.start);
    for (let k = 0; k < 3; k += 1) {
      const a = Math.random() * Math.PI * 2;
      mote(Math.cos(a) * r, Math.sin(a) * r, Math.cos(a) * 25, Math.sin(a) * 25, 0.7 + Math.random() * 0.8, 1 + Math.random() * 1.6);
    }
  }

  function drawMotes(dt, cx, cy) {
    const { ctx } = fx;
    for (let i = fx.motes.length - 1; i >= 0; i -= 1) {
      const m = fx.motes[i];
      m.age += dt;
      if (m.age > m.life) { fx.motes.splice(i, 1); continue; }
      if (m.spin) {
        const a = m.spin * dt;
        const x = m.x * Math.cos(a) - m.y * Math.sin(a);
        m.y = m.x * Math.sin(a) + m.y * Math.cos(a);
        m.x = x;
      }
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.tw += m.twV * dt;
      const k = Math.min(1, m.age * 5) * Math.min(1, (m.life - m.age) / 0.6) * (0.55 + 0.45 * Math.sin(m.tw));
      const arm = m.size * (2.6 + 2 * k);
      ctx.globalAlpha = Math.max(0, k);
      ctx.drawImage(fx.spark, cx + m.x - arm, cy + m.y - arm, arm * 2, arm * 2);
    }
    ctx.globalAlpha = 1;
  }

  function drawPetals(dt, cx, cy) {
    const { ctx } = fx;
    for (let i = fx.petals.length - 1; i >= 0; i -= 1) {
      const p = fx.petals[i];
      p.age += dt;
      // light petals: the air slows them, then they drift down
      const drag = 0.4 ** dt;
      p.vx *= drag;
      p.vy = p.vy * drag + 0.12 * dt;
      p.vz *= drag;
      p.x += p.vx * dt * 240;
      p.y += p.vy * dt * 240;
      p.z += p.vz * dt * 2;
      p.rot += p.spin * dt;
      p.flip += p.flipV * dt;
      if (p.age > p.life || p.z < 0.35) { fx.petals.splice(i, 1); continue; }
      const k = 1 / p.z;
      const size = p.size * k;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.age * 4) * Math.min(1, (p.life - p.age) / 1.2) * Math.min(1, (p.z - 0.35) / 0.2);
      ctx.translate(cx + p.x * k, cy + p.y * k);
      ctx.rotate(p.rot);
      ctx.scale(Math.max(0.15, Math.abs(Math.cos(p.flip))), 1);
      ctx.drawImage(p.sprite, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - fx.last) / 1000 || 0);
    fx.last = now;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    fx.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawPetals(dt, cx, cy);
    drawMotes(dt, cx, cy);
    ringDust(now);
    const busy = fx.motes.length > 0 || fx.petals.length > 0 || now < fx.until;
    if (busy) window.requestAnimationFrame(frame);
    fx.running = busy;
  }

  function fitCanvas() {
    const canvas = $('#magic');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    fx.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setupMagic() {
    const canvas = $('#magic');
    fx.ctx = canvas.getContext ? canvas.getContext('2d') : null;
    if (!fx.ctx) return;
    fx.spark = makeSpark();
    fx.petal = [makePetal('#F6C9CF', '#C9707F'), makePetal('#D9707F', '#7A2335'), makePetal('#FBE3E2', '#E3A2AA')];
    fitCanvas();
    window.addEventListener('resize', fitCanvas);
  }

  // The spell, in time with style.css (ms from the tap).
  function castSpell() {
    if (!fx.ctx) return;
    fx.until = performance.now() + 9000;
    if (!fx.running) {
      fx.running = true;
      fx.last = performance.now();
      window.requestAnimationFrame(frame);
    }
    [0, 150, 300].forEach((ms) => window.setTimeout(() => gather(14), ms));
    window.setTimeout(() => {
      flare(26);
      const far = Math.hypot(window.innerWidth / 2, window.innerHeight / 2);
      fx.ring = { start: performance.now(), dur: 1600, r0: 30, r1: far * 1.15 };
    }, 700);
    [2600, 2800, 3000, 3200, 3400, 3600, 3800].forEach((ms) => window.setTimeout(() => swirl(9), ms));
    window.setTimeout(() => petals(24), 3000);
    [4400, 5000, 5600, 6200].forEach((ms) => window.setTimeout(() => twinkle(8), ms));
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
    if (reducedMotion()) {
      reveal();
      return;
    }
    castSpell();
    window.setTimeout(reveal, OPEN_MS);
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
    setupMagic();
    setupEnvelope();
    loadArt();
  }

  window.BDAY = { countdownParts, whenLine, open: openEnvelope };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
