/* =========================================================
   RONIN — main.js
   Everything you will want to change lives in CONFIG.
   ========================================================= */

const CONFIG = {
  // Stage name. Change it here and the logo, top bar and footer follow.
  brand: 'Ronin',

  // One price for the current drop. Whoever buys gets this month's cycle + every earlier one.
  price: 27,

  // Whop checkout link for each month's drop (the bundle that is live while that cycle is current).
  checkoutUrls: {
    earth: 'https://whop.com/checkout/plan_mAkmG309DbNgZ/?accent_color=FFD600',
    water: '',
    fire: '',
    wind: '',
    void: '',
  },

  // The free guide. The download button appears as soon as someone leaves their email.
  guideUrl: 'assets/guide/Ronin-Supplement-Truth.pdf',

  // Serverless endpoints (see /api). On localhost forms run in demo mode.
  endpoints: {
    subscribe: '/api/subscribe',
    apply: '/api/apply',
  },

  // 1:1 coaching. Update `open` by hand every time a spot is taken. Keep it true.
  coaching: {
    total: 10,
    open: 3,
    priceNote: 'Price shared after your application is reviewed.',
  },

  // The five rings = five 4-week gym cycles.
  // `drop` is the release date (YYYY-MM-DD). The site switches to the new cycle by itself on that day.
  // Preview any date by adding ?today=2026-11-05 to the address.
  rings: [
    {
      id: 'earth', kanji: '地', ring: 'Earth', cycle: 'Cycle I', drop: '2026-10-01', color: '#A8433A',
      title: 'Demon Back',
      what: 'Four weeks to a wider, thicker back. Training, meal plan, calories, food list, sleep and supplements.',
      desc: 'Width and thickness. Pull-ups, rows and heavy pulls built to spread your lats and carve the upper back.',
      length: '4 weeks', sessions: '5 a week',
    },
    {
      id: 'water', kanji: '水', ring: 'Water', cycle: 'Cycle II', drop: '2026-11-01', color: '#5E9C8F',
      title: 'Armor',
      what: 'Four weeks to a full chest and capped shoulders. Training, meal plan, calories, food list, sleep and supplements.',
      desc: 'Chest and shoulders. Presses, flyes and overhead work to build a frame that fills out a shirt.',
      length: '4 weeks', sessions: '5 a week',
    },
    {
      id: 'fire', kanji: '火', ring: 'Fire', cycle: 'Cycle III', drop: '2026-12-01', color: '#C9A45C',
      title: 'War Legs',
      what: 'Four weeks to strong legs and a big engine. Training, meal plan, calories, food list, sleep and supplements.',
      desc: 'Legs and endurance. Squats, lunges and conditioning that build legs you can run, jump and fight on.',
      length: '4 weeks', sessions: '5 a week',
    },
    {
      id: 'wind', kanji: '風', ring: 'Wind', cycle: 'Cycle IV', drop: '2027-01-01', color: '#8BA3B8',
      title: 'Sealed',
      what: 'Revealed on drop day.',
      desc: 'This ring stays sealed until it drops. Join the list to see it first.',
      length: '4 weeks', sessions: '5 a week',
    },
    {
      id: 'void', kanji: '空', ring: 'Void', cycle: 'Cycle V', drop: '2027-02-01', color: '#E2DACB',
      title: 'Sealed',
      what: 'Revealed on drop day.',
      desc: 'The last ring. It stays sealed until the other four are walked.',
      length: '4 weeks', sessions: '5 a week',
    },
  ],
};

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = (n) => `$${n}`;
const isLocal = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

const onColor = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3 ? '#0A0A0A' : '#F3EFE8';
};
const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmtDate = (s) => parseDate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function today() {
  const q = new URLSearchParams(location.search).get('today');
  if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return parseDate(q);
  return new Date();
}

function countdown(dropStr) {
  const ms = parseDate(dropStr) - today();
  const days = Math.ceil(ms / 86400000);
  if (days > 1) return `in ${days} days`;
  if (days === 1) return 'tomorrow';
  const hours = Math.max(1, Math.ceil(ms / 3600000));
  return `in ${hours} hours`;
}

/* ---------- drop state: which cycle is live today ---------- */
const DROP = (() => {
  const rings = CONFIG.rings;
  const now = today();
  let cur = -1;
  rings.forEach((r, i) => { if (parseDate(r.drop) <= now) cur = i; });
  if (cur < 0) cur = 0; // before launch, show Cycle I
  const current = rings[cur];
  const next = rings[cur + 1] || null;
  const status = (i) => (i < cur ? 'included' : i === cur ? 'open' : i === cur + 1 ? 'next' : 'locked');
  const label = (r) => (r.title === 'Sealed' ? `the ${r.ring} ring` : r.title);
  const count = cur + 1;
  const cta = count === 1 ? `Get ${current.title} for ${money(CONFIG.price)}` : `Get all ${count} cycles for ${money(CONFIG.price)}`;
  return { cur, current, next, status, label, count, cta, url: CONFIG.checkoutUrls[current.id] || '#' };
})();

/* ---------- brand ---------- */
function applyBrand() {
  const name = CONFIG.brand;
  const wm = $('[data-brand-wordmark]');
  if (wm) {
    wm.setAttribute('aria-label', name);
    wm.innerHTML = [...name].map((ch, i) => `<span style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  }
  const mark = $('.topbar__mark');
  if (mark) { mark.textContent = name; mark.setAttribute('aria-label', `${name}, back to top`); }
  $$('[data-brand-name]').forEach((el) => (el.textContent = name));
  const copy = $('.footer__copy');
  if (copy) copy.innerHTML = `&copy; ${new Date().getFullYear()} ${name}`;
  document.title = document.title.replace(/^[^—]+/, `${name} `);
}

/* ---------- this month's drop: hero, offer card, buy bar, FAQ ---------- */
function applyDrop() {
  const { cur, current, next, cta, url, count } = DROP;
  document.documentElement.style.setProperty('--accent', current.color);
  document.documentElement.style.setProperty('--on-accent', onColor(current.color));

  const set = (key, html) => $$(`[data-current="${key}"]`).forEach((el) => (el.innerHTML = html));

  set('line', count === 1
    ? `${current.cycle}: ${current.title}. Training, meal plan, sleep and supplements in one PDF.`
    : `${current.cycle}: ${current.title}, plus ${cur} earlier cycle${cur > 1 ? 's' : ''}. The full system in every one.`);
  set('cta', cta);
  set('cycle', `${current.cycle}, ${current.ring}`);
  set('title', current.title);
  set('what', current.what);
  set('price', money(CONFIG.price));
  set('short', count === 1 ? current.title : `All ${count} cycles`);

  const items = CONFIG.rings.slice(0, cur + 1).reverse().map((r, i) =>
    `<li style="--c:${r.color}"><span>${r.cycle}, ${r.title}</span><em>${i === 0 ? 'New' : 'Included'}</em></li>`);
  set('includes', items.join(''));

  set('next', next
    ? `Next drop: <strong>${DROP.label(next)}</strong> on ${fmtDate(next.drop)}, ${countdown(next.drop)}.`
    : '');
  set('faq-next', next
    ? `The next cycle drops on ${fmtDate(next.drop)}. A new one lands at the start of every month. Join the drop list and you\u2019ll know the day it lands.`
    : 'All five rings are out. Buy once and you get every one of them.');

  $$('[data-checkout-current]').forEach((a) => (a.href = url));
}

/* Whop checkout opens in the same theme the visitor is using on the site */
function checkoutHref(url) {
  if (!url || url === '#') return url;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('whop.com')) {
      u.searchParams.delete('session');
      u.searchParams.set('theme', document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    }
    return u.toString();
  } catch (e) { return url; }
}
function initCheckoutLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="whop.com"]');
    if (a) a.href = checkoutHref(a.href);
  }, true);
}

/* ---------- theme ---------- */
function initTheme() {
  const btn = $('.theme-toggle');
  const glyph = $('.theme-toggle__glyph');
  const label = $('.theme-toggle__label');
  const metas = $$('meta[name="theme-color"]');

  const paint = (t) => {
    const ink = t === 'dark';
    glyph.textContent = ink ? '墨' : '紙';
    label.textContent = ink ? 'Ink' : 'Paper';
    btn.setAttribute('aria-label', ink ? 'Switch to paper theme' : 'Switch to ink theme');
    metas.forEach((m) => m.setAttribute('content', ink ? '#000000' : '#E3E0D8'));
  };

  paint(document.documentElement.dataset.theme);

  btn.addEventListener('click', (e) => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      document.documentElement.dataset.theme = next;
      paint(next);
    };
    try { localStorage.setItem('ronin-theme', next); } catch (err) { /* private mode */ }

    if (document.startViewTransition && !reduceMotion) {
      const r = btn.getBoundingClientRect();
      document.documentElement.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
      document.documentElement.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });
}

/* ---------- ensō: one loaded brush stroke ---------- */
function buildEnso() {
  const g = $('.enso__g');
  if (!g) return;

  // seeded random so the stroke looks the same on every visit
  let seed = 1337;
  const rand = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  const cx = 100, cy = 100, R = 72, N = 220;
  const start = (-112 * Math.PI) / 180;
  const sweep = (326 * Math.PI) / 180;
  const radius = (t) => R + 2.4 * Math.sin(t * Math.PI * 2.6 + .4) + 1.2 * Math.sin(t * Math.PI * 7.3);
  // loaded brush: pressed hard at the start, swelling, then running dry
  const width = (t) => {
    const press = 0.55 + 0.45 * Math.min(1, t / 0.07);
    return (19 * Math.pow(1 - t, 0.42) + 1.5) * press;
  };
  const at = (t, off) => {
    const a = start + sweep * t, r = radius(t) + off;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const f = (p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

  let out = '';

  // ink body (narrower than the brush, so bristles fray the edges)
  const outer = [], inner = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, w = width(t) * 0.36 * (t > 0.82 ? 1 - (t - 0.82) * 3.2 : 1);
    outer.push(at(t, w)); inner.push(at(t, -w));
  }
  out += `<path class="enso__ink" d="M${f(outer[0])}${outer.slice(1).map((p) => `L${f(p)}`).join('')}${inner.reverse().map((p) => `L${f(p)}`).join('')}Z"/>`;

  // bristles: each hair ends at its own point and breaks up as the brush runs dry
  const B = 30;
  for (let k = 0; k < B; k++) {
    const o = k / (B - 1) - 0.5;
    const edge = Math.abs(o) * 2;
    const end = 1 - 0.02 - rand() * 0.34 * Math.pow(edge, 1.3) - rand() * 0.05;
    const sw = (0.5 + rand() * 1.1) * (1 - edge * 0.35);
    const phase = rand() * 6.28, wob = 0.03 + rand() * 0.04;
    let d = '', pen = false, gapLeft = 0;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * end;
      const dry = Math.max(0, (t - 0.42) / 0.58);
      if (gapLeft > 0) { gapLeft--; pen = false; continue; }
      if (rand() < dry * dry * 0.09 * (0.6 + edge)) { gapLeft = 1 + Math.floor(rand() * 5 * (0.5 + dry)); pen = false; continue; }
      const p = at(t, (o + wob * Math.sin(t * 9 + phase)) * width(t));
      d += (pen ? 'L' : 'M') + f(p);
      pen = true;
    }
    out += `<path class="enso__bristle" d="${d}" stroke-width="${sw.toFixed(2)}" opacity="${(0.55 + rand() * 0.45).toFixed(2)}"/>`;
  }

  // ink pooled where the brush first touched the paper
  const p0 = at(0.004, 0);
  out += `<ellipse class="enso__drop" cx="${p0[0].toFixed(2)}" cy="${p0[1].toFixed(2)}" rx="7.5" ry="9" transform="rotate(-20 ${p0[0].toFixed(2)} ${p0[1].toFixed(2)})" opacity=".9"/>`;
  for (let i = 0; i < 4; i++) {
    const q = at(rand() * 0.06, (rand() - .5) * 26);
    out += `<circle class="enso__drop" cx="${q[0].toFixed(2)}" cy="${q[1].toFixed(2)}" r="${(0.5 + rand() * 1.2).toFixed(2)}" opacity=".7"/>`;
  }

  g.innerHTML = out;

  // the reveal follows the same centre line
  const mid = [];
  for (let i = 0; i <= N; i++) mid.push(at(i / N, 0));
  $('.enso__reveal').setAttribute('d', `M${f(mid[0])}${mid.slice(1).map((p) => `L${f(p)}`).join('')}`);
}

/* ---------- Five Rings player ---------- */
function initPlayer() {
  const player = $('.player');
  if (!player) return;
  buildEnso();

  const rings = CONFIG.rings;
  let index = DROP.cur;
  let drawn = false;

  const els = {
    kanji: $('.player__kanji', player),
    phase: $('.player__phase', player),
    name: $('.player__name', player),
    pill: $('.pill', player),
    desc: $('.player__desc', player),
    length: $('[data-field="length"]', player),
    sessions: $('[data-field="sessions"]', player),
    date: $('[data-field="date"]', player),
    action: $('.player__action', player),
    note: $('.player__note', player),
    dots: $('.player__dots', player),
    prev: $('[data-dir="-1"]', player),
    next: $('[data-dir="1"]', player),
  };

  rings.forEach((r, i) => {
    const b = document.createElement('button');
    b.className = 'player__dot';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('lang', 'ja');
    b.setAttribute('aria-label', `${r.cycle}, ${r.ring}`);
    b.style.setProperty('--dot', r.color);
    b.textContent = r.kanji;
    b.addEventListener('click', () => go(i));
    els.dots.appendChild(b);
  });

  function render() {
    const r = rings[index];
    const st = DROP.status(index);

    player.dataset.ring = r.id;
    player.dataset.status = st;
    player.style.setProperty('--ring', r.color);
    player.style.setProperty('--on-ring', onColor(r.color));

    els.kanji.textContent = r.kanji;
    els.phase.textContent = `${r.cycle}, ${r.ring}`;
    els.name.textContent = r.title;
    els.pill.dataset.status = st;
    els.pill.textContent = st === 'open' ? 'New this month' : st === 'included' ? 'Included' : `Drops ${fmtDate(r.drop)}`;
    els.desc.textContent = r.desc;
    els.length.textContent = r.length;
    els.sessions.textContent = r.sessions;
    els.date.textContent = fmtDate(r.drop);

    const a = els.action;
    a.removeAttribute('aria-disabled');
    a.removeAttribute('tabindex');
    a.classList.toggle('btn--accent', st !== 'locked');
    a.classList.toggle('btn--ghost', st === 'locked');
    if (st === 'open' || st === 'included') {
      a.textContent = DROP.cta;
      a.href = DROP.url;
    } else if (st === 'next') {
      a.textContent = `Remind me on ${fmtDate(r.drop)}`;
      a.href = '#';
    } else {
      a.textContent = `Drops ${fmtDate(r.drop)}`;
      a.href = '#';
      a.setAttribute('aria-disabled', 'true');
      a.setAttribute('tabindex', '-1');
    }

    let note = '';
    if (st === 'open' && DROP.next) note = `Next ring drops ${countdown(DROP.next.drop)}. Everything you buy is yours to keep.`;
    if (st === 'included') note = `Comes free with this month\u2019s drop, ${DROP.current.title}.`;
    if (st === 'next') note = `Drops ${countdown(r.drop)}. Buy then and you get it plus every ring before it.`;
    els.note.textContent = note;
    els.note.hidden = !note;

    $$('.player__dot', els.dots).forEach((d, i) => d.setAttribute('aria-selected', String(i === index)));
    els.prev.disabled = index === 0;
    els.next.disabled = index === rings.length - 1;
  }

  function draw() {
    if (reduceMotion) { player.classList.add('is-drawn'); return; }
    player.classList.remove('is-drawing', 'is-drawn');
    void player.offsetWidth;
    player.classList.add('is-drawing');
  }

  function go(i) {
    if (i < 0 || i >= rings.length || i === index) return;
    index = i;
    if (reduceMotion) { render(); return; }
    player.classList.add('is-switching');
    setTimeout(() => {
      render();
      player.classList.remove('is-switching');
      if (drawn) draw();
    }, 260);
  }

  els.prev.addEventListener('click', () => go(index - 1));
  els.next.addEventListener('click', () => go(index + 1));
  player.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });

  const stage = $('.player__stage', player);
  let x0 = null;
  stage.addEventListener('pointerdown', (e) => (x0 = e.clientX));
  stage.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  stage.style.touchAction = 'pan-y';

  els.action.addEventListener('click', (e) => {
    const st = DROP.status(index);
    if (st === 'next') { e.preventDefault(); openSheet(rings[index]); }
    if (st === 'locked') e.preventDefault();
  });

  render();

  const io = new IntersectionObserver((entries) => {
    if (entries.some((en) => en.isIntersecting)) { drawn = true; draw(); io.disconnect(); }
  }, { threshold: 0.45 });
  io.observe(stage);
}

/* ---------- drop-list sheet ---------- */
function openSheet(ring) {
  const sheet = $('.sheet');
  if (!sheet) return;
  $('.sheet__title', sheet).textContent = `Get ${DROP.label(ring)} first`;
  $('.sheet__text', sheet).textContent = `One email on ${fmtDate(ring.drop)}, the day it drops. Nothing else.`;
  $('input[name="ring"]', sheet).value = ring.id;
  const form = $('form', sheet);
  form.classList.remove('is-done');
  setStatus(form, '');
  if (typeof sheet.showModal === 'function') sheet.showModal();
  else sheet.setAttribute('open', '');
}
function initSheet() {
  const sheet = $('.sheet');
  if (!sheet) return;
  $('.sheet__close', sheet).addEventListener('click', () => sheet.close());
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
}

/* ---------- the saying: trunk grows, words surface, roots go down ---------- */
function initSaying() {
  const sec = $('.saying');
  if (!sec) return;
  if (reduceMotion || !('IntersectionObserver' in window)) { sec.classList.add('is-lit'); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((en) => en.isIntersecting)) { sec.classList.add('is-lit'); io.disconnect(); }
  }, { rootMargin: '0px 0px -30% 0px', threshold: 0.3 });
  io.observe($('.saying__fig'));
}

/* ---------- top bar + sticky buy bar ---------- */
function initBars() {
  const topbar = $('.topbar');
  const buybar = $('.buybar');
  const hero = $('.hero');
  const blockers = ['.offer__card', '.player__action', '#guide', '#coaching', '.footer'].map((s) => $(s)).filter(Boolean);
  const visible = new Set();
  let pastHero = false;

  const update = () => {
    topbar.classList.toggle('is-solid', pastHero);
    const show = pastHero && visible.size === 0;
    buybar.classList.toggle('is-visible', show);
    buybar.setAttribute('aria-hidden', String(!show));
    $('a', buybar).tabIndex = show ? 0 : -1;
  };

  new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting; update(); },
    { rootMargin: '-72px 0px 0px 0px', threshold: 0.02 }).observe(hero);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
    update();
  });
  blockers.forEach((b) => io.observe(b));
}

/* ---------- coaching spots ---------- */
function initCoaching() {
  const { total, open, priceNote } = CONFIG.coaching;
  const marks = $('.spots__marks');
  const text = $('.spots__text');
  const price = $('.spots__price');
  const openBtn = $('.coach__open');
  const panel = $('#apply');

  marks.style.gridTemplateColumns = `repeat(${total}, 1fr)`;
  for (let i = 0; i < total; i++) {
    const m = document.createElement('span');
    m.className = 'spots__mark' + (i >= total - open ? ' is-open' : '');
    marks.appendChild(m);
  }

  const full = open <= 0;
  text.innerHTML = full
    ? `All <strong>${total}</strong> spots are taken`
    : `<strong>${open} of ${total}</strong> spots open`;
  price.textContent = priceNote || '';

  if (full) {
    openBtn.textContent = 'Join the coaching waitlist';
    const form = $('form', panel);
    const hidden = document.createElement('input');
    hidden.type = 'hidden'; hidden.name = 'waitlist'; hidden.value = 'yes';
    form.appendChild(hidden);
    $('button[type="submit"]', form).textContent = 'Join the waitlist';
  }

  openBtn.addEventListener('click', () => {
    openBtn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    $('input', panel).focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
}

/* ---------- forms ---------- */
const MESSAGES = {
  guide: 'You\u2019re in. Your guide is ready:',
  waitlist: 'You\u2019re on the list. You\u2019ll hear from me the day it drops.',
  apply: 'Application received. I review every profile myself and reply within 48 hours.',
  applyWaitlist: 'You\u2019re on the coaching waitlist. I\u2019ll message you when a spot opens.',
  error: 'That didn\u2019t go through. Check your connection and try again, or DM me on Instagram.',
  invalid: 'Fill in the highlighted fields to continue.',
};

function setStatus(form, msg, tone) {
  const s = $('.form__status', form);
  s.textContent = msg;
  if (tone) s.dataset.tone = tone; else delete s.dataset.tone;
}

function initForms() {
  $$('form[data-endpoint]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // validation
      let ok = true;
      $$('input[required], select[required], textarea[required]', form).forEach((f) => {
        const bad = !f.checkValidity();
        f.setAttribute('aria-invalid', String(bad));
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) { setStatus(form, MESSAGES.invalid, 'error'); return; }

      const data = Object.fromEntries(new FormData(form).entries());
      const kind = form.dataset.endpoint;
      const list = form.dataset.list;
      if (list) data.list = list;

      const success = () => {
        form.classList.add('is-done');
        let msg = MESSAGES[list] || MESSAGES[kind];
        if (kind === 'apply' && data.waitlist === 'yes') msg = MESSAGES.applyWaitlist;
        setStatus(form, msg, 'ok');
        // free guide: hand over the PDF right away
        if (list === 'guide' && !$('.form__download', form)) {
          const a = document.createElement('a');
          a.className = 'btn btn--accent btn--wide form__download';
          a.href = CONFIG.guideUrl;
          a.setAttribute('download', '');
          a.textContent = 'Download the guide';
          form.appendChild(a);
        }
      };

      // bots fill the hidden field; pretend it worked
      if (data.company) { success(); return; }
      delete data.company;

      const btn = $('button[type="submit"]', form);
      const label = btn.textContent;
      btn.textContent = 'Sending\u2026';
      btn.disabled = true;
      setStatus(form, '');

      try {
        if (isLocal) {
          await new Promise((r) => setTimeout(r, 700)); // demo mode on your machine
          console.info('[demo] would send', kind, data);
        } else {
          const res = await fetch(CONFIG.endpoints[kind], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }
        success();
      } catch (err) {
        console.error(err);
        setStatus(form, MESSAGES.error, 'error');
      } finally {
        btn.textContent = label;
        btn.disabled = false;
      }
    });

    form.addEventListener('input', (e) => {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  });
}

/* ---------- go ---------- */
applyBrand();
applyDrop();
initCheckoutLinks();
initTheme();
initPlayer();
initSheet();
initSaying();
initBars();
initCoaching();
initForms();
