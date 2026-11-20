/*
 * 慈惠道場 堂慶 invitation: paper-cut clouds closed over a seal of 慈惠道場; tap, and they open one of three ways
 * (?open=a 雲散霧開, b 金光法陣, c both). Then the invitation, dates, countdown, program, place, and the host's
 * link maker (?host). Words come from content.js; a link can change the guest's name (?to=), the
 * big title (?title=), the lines of the invitation (?msg=, one per line) and the signature (?sign=).
 * Only friends are invited, so it does not introduce the dojo or its deities.
 */
(function () {
  'use strict';

  const TZ = 'Asia/Taipei';
  const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  const DIGIT = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const MAPS = 'https://www.google.com/maps/search/?api=1&query=';
  const OPENINGS = ['a', 'b', 'c'];
  // the clouds start to close only once these have loaded, so nothing pops in
  const OPENING_ART = ['cloud-front', 'cloud-mid', 'cloud-back', 'paper', 'seal-ink', 'seal-slip'];
  // needed only once it opens: asked for straight away, not waited for
  const LATER_ART = ['mist-1', 'mist-2', 'mist-3', 'gold-foil', 'gold-flakes'];
  const READY_CAP_MS = 3000; // on a slow line, start anyway after this long
  const DELIVERY_MS = 2700; // the clouds have closed and the seal is stamped: matches style.css
  const OPEN_MS = 5000; // the opening layer is done: must match the .sky hide delay in style.css
  const LIMIT = { name: 20, title: 6, lines: 6, line: 22, sign: 20 };
  const CHARS_PER_COLUMN = 11; // the invitation's vertical lines hold about this many characters before wrapping

  const state = { content: null, guest: '', opening: 'c', words: null, timer: 0, wantsOpen: false };

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

  // ['謹訂於國曆二〇二七年', '一月十六日至十七日']: two vertical lines, broken after the year
  function dateLines(days) {
    const a = dayParts(days[0]);
    const b = dayParts(days[days.length - 1]);
    const first = `${t('held')}國曆${cnYear(a.y)}年`;
    const from = `${cnNumber(a.m)}月${cnNumber(a.d)}日`;
    if (days.length === 1) return [first, from];
    const to = a.m === b.m ? `${cnNumber(b.d)}日` : `${cnNumber(b.m)}月${cnNumber(b.d)}日`;
    return [first, `${from}至${to}`];
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

  /* ---------- the words: content.js, changed by the link ---------- */

  const clip = (s, n) => [...(s || '').trim()].slice(0, n).join('');

  // The dojo is always 慈惠道場, never 慈惠 alone; cutting a line can leave 慈惠, so this runs after clip.
  // (A guest's own name is left alone: a person may well be called 慈惠.)
  const fullName = (s) => s.replace(/慈惠(?!道場)/g, '慈惠道場');
  const clipWords = (s, n) => fullName(clip(s, n));
  const linesOf = (s) => (s || '').split('\n').map((l) => clipWords(l, LIMIT.line)).filter(Boolean).slice(0, LIMIT.lines);

  function defaultWords() {
    const c = state.content;
    return {
      title: c.title,
      lines: c.message ? [...c.message] : [...dateLines(c.days), t('welcome')],
      sign: t('signature'),
    };
  }

  function linkWords(params) {
    const words = defaultWords();
    const title = clipWords(params.get('title'), LIMIT.title);
    const sign = clipWords(params.get('sign'), LIMIT.sign);
    const lines = linesOf(params.get('msg'));
    if (title) words.title = title;
    if (sign) words.sign = sign;
    if (lines.length) words.lines = lines;
    return words;
  }

  /* ---------- rendering ---------- */

  function renderStaticText() {
    document.querySelectorAll('[data-t]').forEach((node) => { node.textContent = t(node.dataset.t); });
    $('#sky').setAttribute('aria-label', t('openLabel'));
    ['#sky .seal', '.stamp', '.foot-seal'].forEach((sel) => $(sel).setAttribute('aria-label', t('sealLabel')));
    $('#host-names').placeholder = t('hostPlaceholder');
  }

  function renderInvitation() {
    const who = state.guest || t('everyone');
    const { title, lines, sign } = state.words;
    $('#tag-to').textContent = who;
    $('#hero-host').textContent = state.content.host;
    const h1 = $('#hero-title');
    h1.textContent = title;
    h1.style.setProperty('--n', [...title].length);
    $('#hero-guest').textContent = `${t('invite')} ${who}`;
    const box = $('#hero-text');
    box.querySelectorAll('.v-line').forEach((p) => p.remove());
    lines.forEach((line) => box.insertBefore(el('p', 'v-line', line), $('#hero-sign')));
    $('#hero-sign').textContent = sign;
    // the lines come in one after another (style.css staggers them by --i)
    const all = [...box.querySelectorAll('p')];
    all.forEach((p, i) => p.style.setProperty('--i', i));
    // long words wrap into more columns; style.css makes the text smaller so they all fit on the screen
    const columns = all.reduce((n, p) => n + Math.max(1, Math.ceil([...p.textContent].length / CHARS_PER_COLUMN)), 0);
    box.style.setProperty('--cols', columns);
  }

  function renderDates() {
    const { days, start } = state.content;
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
    renderInvitation();
    renderDates();
    renderPlace();
    renderProgram();
    updateCountdown();
  }

  /* ---------- the clouds ---------- */

  // Each cloud picture is 1024 × 2304: paper on the left, the cloud tips at `tip` of its width, `heads` cloud
  // heads down it. reach: the tips' distance from the middle when closed (below 0: they cross and interlock).
  // shift: the right side moves down by this many heads, so its lobes fall between the left ones.
  // dx, dy, sc: where the layer drifts to when it opens (a and c). The right side is a mirror image.
  const LAYERS = {
    back: { tip: .85, heads: 13, reach: -16, shift: .5, dx: -.45, dy: -.05, sc: 1.04 },
    mid: { tip: .85, heads: 8, reach: -6, shift: .5, dx: -.62, dy: .05, sc: 1.12 },
    front: { tip: .85, heads: 5, reach: 36, shift: 0, dx: -.85, dy: -.03, sc: 1.26 },
  };
  const HEIGHT = 1.18; // each picture is this many screens tall
  const ASPECT = 1024 / 2304;

  function layClouds() {
    const w = window.innerWidth;
    const h = window.innerHeight * HEIGHT;
    const cx = w / 2;
    document.querySelectorAll('#sky .side').forEach((side) => {
      const name = ['back', 'mid', 'front'].find((n) => side.classList.contains(n));
      const layer = LAYERS[name];
      const right = side.classList.contains('R');
      const img = side.querySelector('img');
      const mover = side.querySelector('.mover');
      img.style.height = `${h}px`;
      img.style.left = `${cx - layer.reach - layer.tip * h * ASPECT}px`;
      img.style.translate = `0 calc(-50% + ${right ? layer.shift * (h / layer.heads) : 0}px)`;
      mover.style.setProperty('--dx', `${layer.dx * w}px`);
      mover.style.setProperty('--dy', `${layer.dy * window.innerHeight * (right ? -1 : 1)}px`);
      mover.style.setProperty('--sc', layer.sc);
      mover.style.setProperty('--px', `${-.28 * w}px`);
    });
    // b and c: how far the ring of light must grow to clear the screen
    const far = Math.hypot(Math.max(cx, w - cx), window.innerHeight * .55) + 60;
    document.body.style.setProperty('--smax', (far / 100).toFixed(2));
    document.body.style.setProperty('--rmax', `${far.toFixed(0)}px`);
  }

  /* ---------- gold leaf and sparkles ---------- */

  const fx = { ctx: null, sprites: [], flakes: [], motes: [], spark: null, running: false, last: 0, ring: null, until: 0 };

  function fitCanvas() {
    const canvas = $('#gold');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    fx.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // one sparkle drawn once: a thin gold cross with a white point in the middle
  function makeSpark() {
    const n = 64;
    const h = n / 2;
    const c = el('canvas');
    c.width = n;
    c.height = n;
    const g = c.getContext('2d');
    [[1, 0], [0, 1]].forEach(([ax, ay]) => {
      const lg = g.createLinearGradient(h - ax * h, h - ay * h, h + ax * h, h + ay * h);
      lg.addColorStop(0, 'rgba(214, 176, 98, 0)');
      lg.addColorStop(0.5, 'rgba(214, 176, 98, .95)');
      lg.addColorStop(1, 'rgba(214, 176, 98, 0)');
      g.fillStyle = lg;
      if (ax) g.fillRect(0, h - 1.2, n, 2.4);
      else g.fillRect(h - 1.2, 0, 2.4, n);
    });
    const rg = g.createRadialGradient(h, h, 0, h, h, h * 0.35);
    rg.addColorStop(0, 'rgba(255, 255, 250, 1)');
    rg.addColorStop(0.35, 'rgba(240, 210, 140, .8)');
    rg.addColorStop(1, 'rgba(240, 210, 140, 0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, n, n);
    return c;
  }

  // the flakes picture: 8 × 3 cells, one trimmed gold leaf in each; shrink each to a small picture once
  function cutFlakes(img) {
    const cell = img.naturalHeight / 3;
    for (let i = 0; i < 24; i += 1) {
      const c = el('canvas');
      c.width = 96;
      c.height = 96;
      const g = c.getContext('2d');
      if (!g) return;
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, (i % 8) * cell, Math.floor(i / 8) * cell, cell, cell, 0, 0, 96, 96);
      fx.sprites.push(c);
    }
  }

  function flake(x, y, z, vx, vy, vz, life, size) {
    return {
      x, y, z, vx, vy, vz, life, size, age: 0,
      sprite: fx.sprites[Math.floor(Math.random() * fx.sprites.length)],
      rot: Math.random() * 6.3, spin: (Math.random() - 0.5) * 3,
      flip: Math.random() * 6.3, flipV: 2 + Math.random() * 4,
      sway: Math.random() * 6.3, swayV: 1 + Math.random() * 1.5,
    };
  }

  // x, y from the seal (px); vx, vy in px/s; spin turns it around the seal (rad/s)
  function mote(x, y, vx, vy, life, size, spin = 0) {
    fx.motes.push({ x, y, vx, vy, life, size, spin, age: 0, tw: Math.random() * 6.3, twV: 3 + Math.random() * 5 });
  }

  // the seal's ink lifting off as light
  function inkToLight(n) {
    for (let i = 0; i < n; i += 1) {
      mote((Math.random() - 0.5) * 90, (Math.random() - 0.5) * 90, (Math.random() - 0.5) * 30, -(25 + Math.random() * 55),
        1.6 + Math.random() * 2.2, 1.2 + Math.random() * 2.6);
    }
  }

  // light dust rising slowly through the parting clouds
  function dust(n, spread) {
    for (let i = 0; i < n; i += 1) {
      mote((Math.random() - 0.5) * spread, (Math.random() - 0.3) * spread * 1.6, (Math.random() - 0.5) * 16,
        -(8 + Math.random() * 26), 2.5 + Math.random() * 2.5, 0.8 + Math.random() * 2);
    }
  }

  function leaves(n) {
    if (!fx.sprites.length) return;
    for (let i = 0; i < n; i += 1) {
      fx.flakes.push(flake((Math.random() - 0.5) * window.innerWidth * 1.2, -window.innerHeight * (0.5 + Math.random() * 0.2),
        0.9 + Math.random() * 0.5, 0, 0.1 + Math.random() * 0.1, 0, 14, 9 + Math.random() * 12));
    }
  }

  function driftLeaf() {
    if (!fx.sprites.length || fx.flakes.length > 12) return;
    fx.flakes.push(flake((Math.random() - 0.5) * window.innerWidth * 1.1, -window.innerHeight * 0.6, 0.9 + Math.random() * 0.6,
      0, 0.11 + Math.random() * 0.08, 0, 16, 7 + Math.random() * 9));
  }

  // b and c: the ring of light grows like style.css's cubic-bezier(.33, 1, .68, 1) (an ease-out cubic)
  function ringRadius(ms) {
    const u = Math.min(1, Math.max(0, ms / fx.ring.dur));
    return fx.ring.r0 + (fx.ring.r1 - fx.ring.r0) * (1 - (1 - u) ** 3);
  }

  function drawFlakes(dt, cx, cy) {
    const { ctx } = fx;
    for (let i = fx.flakes.length - 1; i >= 0; i -= 1) {
      const f = fx.flakes[i];
      f.age += dt;
      // thin gold leaf: air stops it quickly, then it floats down, rocking from side to side
      const drag = 0.25 ** dt;
      f.vx *= drag;
      f.vy = f.vy * drag + 0.07 * dt;
      f.vz *= drag;
      f.sway += f.swayV * dt;
      f.x += (f.vx + Math.sin(f.sway) * 0.06) * dt * 260;
      f.y += f.vy * dt * 260;
      f.z += f.vz * dt * 2;
      f.rot += f.spin * dt;
      f.flip += f.flipV * dt;
      if (f.age > f.life || f.z < 0.4) { fx.flakes.splice(i, 1); continue; }
      const p = 1 / f.z;
      const size = f.size * p;
      const fade = Math.min(1, (f.life - f.age) / 1.4) * Math.min(1, f.age * 3) * Math.min(1, (f.z - 0.4) / 0.2);
      const c = Math.cos(f.flip);
      ctx.save();
      ctx.translate(cx + f.x * p, cy + f.y * p);
      ctx.rotate(f.rot);
      ctx.scale(Math.max(0.08, Math.abs(c)), 1);
      ctx.globalAlpha = fade;
      ctx.drawImage(f.sprite, -size / 2, -size / 2, size, size);
      // when the leaf turns to face the light, it flashes
      const lit = Math.max(0, c) ** 8;
      if (lit > 0.02) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * lit * 0.9;
        ctx.drawImage(f.sprite, -size / 2, -size / 2, size, size);
      }
      ctx.restore();
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
      m.vx *= 0.6 ** dt;
      m.tw += m.twV * dt;
      const k = Math.min(1, m.age * 4) * Math.min(1, (m.life - m.age) / 1.1) * (0.5 + 0.5 * Math.sin(m.tw)) ** 2;
      if (k < 0.03) continue;
      const arm = m.size * (2.4 + 2.2 * k);
      ctx.globalAlpha = k;
      ctx.drawImage(fx.spark, cx + m.x - arm, cy + m.y - arm, arm * 2, arm * 2);
      ctx.globalAlpha = 1;
    }
  }

  // dust thrown off the ring of light as it grows, spiralling outward
  function ringDust(now) {
    if (!fx.ring || now - fx.ring.start >= fx.ring.dur * 0.8) return;
    const r = ringRadius(now - fx.ring.start);
    for (let k = 0; k < 2; k += 1) {
      const a = Math.random() * Math.PI * 2;
      mote(Math.cos(a) * r, Math.sin(a) * r, Math.cos(a) * 30, Math.sin(a) * 30, 1 + Math.random() * 1.2, 1 + Math.random() * 1.8, 0.9);
    }
  }

  // a few leaves keep drifting over the invitation while it is in view
  function ambient(now, dt) {
    const inView = window.scrollY < window.innerHeight * 0.5;
    if (now < fx.until && inView && Math.random() < dt * 1.2) driftLeaf();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - fx.last) / 1000 || 0);
    fx.last = now;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.45;
    fx.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawFlakes(dt, cx, cy);
    drawMotes(dt, cx, cy);
    ringDust(now);
    ambient(now, dt);
    const busy = fx.flakes.length > 0 || fx.motes.length > 0 || now < fx.until;
    if (busy) window.requestAnimationFrame(frame);
    fx.running = busy;
  }

  function runFx() {
    if (!fx.ctx || fx.running) return;
    fx.running = true;
    fx.last = performance.now();
    window.requestAnimationFrame(frame);
  }

  function setupFx() {
    const canvas = $('#gold');
    fx.ctx = canvas.getContext ? canvas.getContext('2d') : null;
    if (!fx.ctx) return;
    fx.spark = makeSpark();
    fitCanvas();
  }

  // the effects of each way of opening (times from the tap, ms)
  function playOpening() {
    if (!fx.ctx) return;
    fx.until = performance.now() + 30000;
    runFx();
    window.setTimeout(() => inkToLight(30), 330);
    const ring = () => {
      fx.ring = { start: performance.now(), dur: 2200, r0: 45, r1: parseFloat(document.body.style.getPropertyValue('--rmax')) };
    };
    if (state.opening === 'a') {
      let k = 0;
      const id = window.setInterval(() => {
        dust(3, 150 + k * 16);
        k += 1;
        if (k > 20) window.clearInterval(id);
      }, 110);
      window.setTimeout(() => leaves(9), 1300);
    } else if (state.opening === 'b') {
      window.setTimeout(ring, 400);
      window.setTimeout(() => leaves(12), 900);
    } else {
      window.setTimeout(ring, 400);
      window.setTimeout(() => dust(14, 220), 900);
      window.setTimeout(() => leaves(10), 1100);
    }
  }

  /* ---------- opening ---------- */

  function reducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // The opening layer is done: the page can be scrolled and used.
  function reveal() {
    $('#sky').hidden = true;
    document.body.classList.add('revealed');
    $('#main').removeAttribute('inert');
    $('#main').focus({ preventScroll: true });
  }

  function openLetter() {
    const body = document.body;
    if (body.classList.contains('opened')) return;
    if (!body.classList.contains('landed')) {
      state.wantsOpen = true; // opened as soon as the seal is stamped
      return;
    }
    body.classList.remove('sealed');
    body.classList.add('opened');
    const sky = $('#sky');
    sky.setAttribute('aria-hidden', 'true');
    sky.tabIndex = -1;
    if (reducedMotion()) {
      reveal();
      return;
    }
    playOpening();
    window.setTimeout(reveal, OPEN_MS);
  }

  // Ask for every painting; call done once the opening's own have loaded, or READY_CAP_MS has passed.
  function whenOpeningArtLoaded(done) {
    let left = OPENING_ART.length;
    let called = false;
    const finish = () => {
      if (called) return;
      called = true;
      done();
    };
    OPENING_ART.forEach((name) => {
      const img = new Image();
      img.onload = () => {
        left -= 1;
        if (left === 0) finish();
      };
      img.onerror = img.onload;
      img.src = `art/${name}.webp`;
    });
    LATER_ART.forEach((name) => {
      const img = new Image();
      if (name === 'gold-flakes') img.onload = () => cutFlakes(img);
      img.src = `art/${name}.webp`;
    });
    window.setTimeout(finish, READY_CAP_MS);
  }

  // The clouds have closed and the seal is stamped.
  function land() {
    document.body.classList.add('landed');
    if (state.wantsOpen) openLetter();
  }

  function setupSky() {
    const sky = $('#sky');
    $('#main').setAttribute('inert', '');
    sky.addEventListener('click', openLetter);
    sky.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openLetter();
    });
    layClouds();
    window.addEventListener('resize', () => {
      layClouds();
      if (fx.ctx) fitCanvas();
    });
    if (reducedMotion()) {
      document.body.classList.add('ready');
      land();
      return;
    }
    whenOpeningArtLoaded(() => {
      document.body.classList.add('ready');
      window.setTimeout(land, DELIVERY_MS);
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

  // The words typed in the link maker that differ from content.js: { title?, msg?, sign? }
  function changedWords() {
    const base = defaultWords();
    const typed = {
      title: clipWords($('#host-title').value, LIMIT.title),
      msg: linesOf($('#host-msg').value).join('\n'),
      sign: clipWords($('#host-sign').value, LIMIT.sign),
    };
    const was = { title: base.title, msg: base.lines.join('\n'), sign: base.sign };
    return Object.fromEntries(Object.entries(typed).filter(([key, value]) => value && value !== was[key]));
  }

  // The link for one guest (or none): the opening always, the words only where they differ from content.js.
  function linkFor(name) {
    const params = new URLSearchParams();
    if (name) params.set('to', name);
    params.set('open', $('#host-open').value);
    Object.entries(changedWords()).forEach(([key, value]) => params.set(key, value));
    return `${pageUrl()}?${params}`;
  }

  function linkRow(name) {
    const li = el('li');
    const input = el('input');
    input.readOnly = true;
    input.value = linkFor(name);
    const copy = el('button', 'ghost', t('hostCopy'));
    copy.type = 'button';
    copy.addEventListener('click', () => copyText(input.value, copy));
    const look = el('a', 'btn-s ghost', t('hostPreview'));
    look.href = input.value;
    look.target = '_blank';
    look.rel = 'noopener';
    li.append(el('span', 'who', name), input, copy, look);
    return li;
  }

  function makeLinks() {
    const names = $('#host-names').value.split('\n').map((n) => clip(n, LIMIT.name)).filter(Boolean);
    const list = $('#host-links');
    list.textContent = '';
    names.forEach((name) => list.append(linkRow(name)));
    const general = linkFor('');
    $('#host-general').value = general;
    $('#host-general-open').href = general;
  }

  function fillWords(words) {
    $('#host-title').value = words.title;
    $('#host-msg').value = words.lines.join('\n');
    $('#host-sign').value = words.sign;
  }

  function setupHost(isHost) {
    if (!isHost) return false;
    $('#host').hidden = false;
    document.body.classList.remove('sealed');
    document.body.classList.add('ready', 'landed', 'opened', 'hosting');
    reveal();
    $('#host-open').value = state.opening;
    fillWords(state.words);
    makeLinks();
    $('#host-make').addEventListener('click', makeLinks);
    $('#host-reset').addEventListener('click', () => {
      fillWords(defaultWords());
      makeLinks();
    });
    $('#host-open').addEventListener('change', makeLinks);
    $('#host-general-copy').addEventListener('click', (e) => copyText($('#host-general').value, e.currentTarget));
    $('#host-copy-all').addEventListener('click', (e) => {
      const rows = [...document.querySelectorAll('#host-links li')]
        .map((li) => `${li.querySelector('.who').textContent}\t${li.querySelector('input').value}`);
      copyText(rows.join('\n'), e.currentTarget);
    });
    return true;
  }

  /* ---------- reveal on scroll ---------- */

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

  /* ---------- start ---------- */

  function startClock() {
    window.clearInterval(state.timer);
    if (countdownParts(target(), Date.now()).state !== 'ahead') return;
    state.timer = window.setInterval(updateCountdown, 1000);
  }

  function boot() {
    const params = new URLSearchParams(window.location.search);
    state.content = window.CIHUI_CONTENT;
    state.guest = clip(params.get('to'), LIMIT.name);
    const asked = params.get('open') || state.content.opening;
    state.opening = OPENINGS.includes(asked) ? asked : 'c';
    document.body.classList.add(`open-${state.opening}`);
    state.words = linkWords(params);
    render();
    setupReveal();
    setupFx();
    if (!setupHost(params.has('host'))) setupSky();
    startClock();
  }

  window.CIHUI = { countdownParts, dateLines, open: openLetter };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
