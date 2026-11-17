/* Unsupervised Lab — interactive simulators for distances, clustering and dimensionality reduction.
 * © Mohammad Khalooei (mohammad.khalooei@sharif.edu)
 * Plain JavaScript + Canvas 2D. Algorithms live in algos.js. No build step. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const U = window.UL;
  const I18N = window.UL_I18N || { fa: {}, dyn: { en: {}, fa: {} } };
  const TAU = Math.PI * 2, clamp = U.clamp;
  const YEL = '#ffcb57', TEAL = '#46e4b0', BLUE = '#7798ff', VIO = '#a68bff', PINK = '#ff5d9e', CYAN = '#45d9f5', GREY = '#5d6b88';
  const PAL = ['#45d9f5', '#ff5d9e', '#ffcb57', '#a68bff', '#46e4b0', '#ff8a5b', '#7798ff', '#e879f9', '#9be15d', '#f9a8d4', '#38bdf8', '#fde047'];
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const PAL_RGB = PAL.map(hex), BG_RGB = [7, 12, 25];
  const pal = (k) => (k < 0 ? GREY : PAL[k % PAL.length]);
  const palRGB = (k) => (k < 0 ? hex(GREY) : PAL_RGB[k % PAL.length]);

  /* ---------------------------------------------------------------- i18n */
  let lang = 'en';
  try { lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('mlLabLang') || ''; } catch (e) { lang = ''; }
  if (lang !== 'en' && lang !== 'fa') lang = /^fa/i.test(navigator.language || '') ? 'fa' : 'en';
  const t = (k, vars) => {
    const d = I18N.dyn;
    let s = d[lang] && d[lang][k] != null ? d[lang][k] : d.en && d.en[k] != null ? d.en[k] : k;
    if (vars) s = s.replace(/\{(\w+)\}/g, (_, v) => (vars[v] != null ? vars[v] : ''));
    return s;
  };
  const fontFamily = () => (lang === 'fa' ? 'Vazirmatn, Inter, sans-serif' : 'Inter, system-ui, sans-serif');

  /* --------------------------------------------------------- formatting */
  const pct = (v) => (v == null || !isFinite(v) ? '—' : (v * 100).toFixed(1) + '%');
  const num = (v, d = 2) => (v == null || !isFinite(v) ? '—' : (+v).toFixed(d));
  const ms = (v) => (v < 10 ? v.toFixed(1) : Math.round(v)) + ' ms';
  function readouts(el, items) {
    el.innerHTML = items.map(([k, v, cls]) => `<div class="ro ${cls || ''}"><small>${t(k)}</small><b>${v}</b></div>`).join('');
  }
  function renderTex(el, tex) {
    if (window.katex) { try { window.katex.render(tex, el, { throwOnError: false }); return; } catch (e) { /* fall through */ } }
    el.textContent = tex;
  }
  const now = () => performance.now();

  /* ------------------------------------------------------ canvas helpers */
  function prep(cv) {
    const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, r.width), h = Math.max(1, r.height), W = Math.round(w * d), H = Math.round(h * d);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, w, h);
    return { c, w, h };
  }
  function txt(c, s, x, y, color = '#8d9db9', size = 11, align = 'left', weight = 500) {
    c.fillStyle = color; c.font = `${weight} ${size}px ${fontFamily()}`; c.textAlign = align; c.textBaseline = 'alphabetic';
    c.direction = /[؀-ۿ]/.test(s) ? 'rtl' : 'ltr';
    c.fillText(s, x, y);
  }
  function stroke(c, color, width = 2, glow = 0, dash = null) {
    c.strokeStyle = color; c.lineWidth = width; c.lineJoin = 'round'; c.lineCap = 'round';
    if (dash) c.setLineDash(dash);
    if (glow) { c.shadowColor = color; c.shadowBlur = glow; }
    c.stroke(); c.shadowBlur = 0; c.setLineDash([]);
  }
  function line(c, x1, y1, x2, y2, color, width = 1, dash = null) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); stroke(c, color, width, 0, dash); }
  function ring(c, x, y, r, color, width = 2, dash = null) { c.beginPath(); c.arc(x, y, r, 0, TAU); stroke(c, color, width, 0, dash); }
  function dot(c, x, y, r, fill, edge = '#050912') { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = fill; c.fill(); if (edge) { c.lineWidth = 1.2; c.strokeStyle = edge; c.stroke(); } }
  function cross(c, x, y, r, color, width = 2) { line(c, x - r, y - r, x + r, y + r, color, width); line(c, x - r, y + r, x + r, y - r, color, width); }
  function grid(c, x, y, w, h, rows = 4, cols = 8, color = 'rgba(112,137,184,.11)') {
    c.strokeStyle = color; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i <= rows; i++) { const yy = Math.round(y + (i * h) / rows) + 0.5; c.moveTo(x, yy); c.lineTo(x + w, yy); }
    for (let i = 0; i <= cols; i++) { const xx = Math.round(x + (i * w) / cols) + 0.5; c.moveTo(xx, y); c.lineTo(xx, y + h); }
    c.stroke();
  }
  function arrow(c, x1, y1, x2, y2, color, width = 2.5) {
    line(c, x1, y1, x2, y2, color, width);
    const a = Math.atan2(y2 - y1, x2 - x1), L = 9;
    c.beginPath(); c.moveTo(x2, y2);
    c.lineTo(x2 - L * Math.cos(a - 0.45), y2 - L * Math.sin(a - 0.45)); c.lineTo(x2 - L * Math.cos(a + 0.45), y2 - L * Math.sin(a + 0.45));
    c.closePath(); c.fillStyle = color; c.fill();
  }
  const rgba = (rgb, a) => `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${a})`;
  const mixRGB = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  function makeLUT(stops) {
    const lut = [];
    for (let i = 0; i < 256; i++) { const u = (i / 255) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(u)); lut.push(mixRGB(stops[k], stops[k + 1], u - k)); }
    return (v) => lut[clamp(Math.round(v * 255), 0, 255)];
  }
  const RAINBOW = makeLUT([[110, 64, 170], [70, 110, 230], [40, 190, 220], [80, 220, 130], [240, 220, 70], [255, 130, 60], [235, 70, 110]]);

  /* -------------------------------------------- views & animation loop */
  const views = [], tickers = [], jobs = new Map(), refreshers = [];
  const later = (key, fn) => jobs.set(key, fn);
  const vio = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target._view; if (v) v.visible = e.isIntersecting; }), { rootMargin: '250px 0px' });
  const rso = new ResizeObserver((es) => es.forEach((e) => { const v = e.target._view; if (v) { v.dirty = true; if (v.onResize) v.onResize(); } }));
  function view(cv, draw) {
    const v = { cv, draw, dirty: true, visible: false };
    cv._view = v; views.push(v); vio.observe(cv); rso.observe(cv);
    return v;
  }
  const markAll = () => views.forEach((v) => { v.dirty = true; if (v.onResize) v.onResize(); });

  /* --------------------------------------------------------------- plot */
  function plot(cv, sp) {
    const { c, w, h } = prep(cv);
    const L = sp.L != null ? sp.L : 44, R = sp.R != null ? sp.R : 14, T = sp.T != null ? sp.T : 30, Bt = 24;
    const pw = Math.max(10, w - L - R), ph = Math.max(10, h - T - Bt), series = sp.series || [];
    let x0 = sp.xMin != null ? sp.xMin : 0, x1 = sp.xMax;
    if (x1 == null) x1 = Math.max(1, ...series.map((s) => (s.xs ? s.xs[s.xs.length - 1] : (s.x0 || 0) + s.data.length - 1)));
    let y0 = sp.yMin, y1 = sp.yMax;
    if (y0 == null || y1 == null) {
      let lo = Infinity, hi = -Infinity;
      series.forEach((s) => s.data.forEach((v) => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
      if (!isFinite(lo)) { lo = 0; hi = 1; }
      if (hi - lo < 1e-9) { hi += 0.5; lo -= 0.5; }
      const pad = (hi - lo) * 0.08;
      if (y0 == null) y0 = lo - pad;
      if (y1 == null) y1 = hi + pad;
    }
    const X = (v) => L + ((v - x0) / (x1 - x0 || 1)) * pw, Y = (v) => T + ph - ((v - y0) / (y1 - y0 || 1)) * ph;
    grid(c, L, T, pw, ph, 4, 6);
    const fy = sp.yFmt || ((v) => num(v, Math.abs(y1 - y0) < 0.5 ? 2 : 1)), fx = sp.xFmt || ((v) => String(Math.round(v)));
    for (let i = 0; i <= 4; i++) { const v = y0 + ((y1 - y0) * i) / 4; txt(c, fy(v), L - 6, Y(v) + 3, '#7385a6', 9.5, 'right'); }
    let xt = sp.xTicks;
    if (!xt && Number.isInteger(x0) && Number.isInteger(x1) && x1 - x0 <= 12) xt = Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i);
    if (!xt) xt = Array.from({ length: 7 }, (_, i) => x0 + ((x1 - x0) * i) / 6);
    xt.forEach((v) => txt(c, fx(v), X(v), h - 8, '#7385a6', 9.5, 'center'));
    if (sp.xLabel) txt(c, sp.xLabel, L + pw - 2, T + ph - 6, '#8d9db9', 10, 'right', 600);
    (sp.hlines || []).forEach((hl) => {
      if (hl.v < y0 || hl.v > y1) return;
      line(c, L, Y(hl.v), L + pw, Y(hl.v), hl.color || '#ffffff66', 1.3, [5, 5]);
      if (hl.label) txt(c, hl.label, L + 6, Y(hl.v) - 4, hl.color || '#ffffff99', 9.5, 'left', 700);
    });
    (sp.vlines || []).forEach((vl) => {
      if (vl.v < x0 || vl.v > x1) return;
      line(c, X(vl.v), T, X(vl.v), T + ph, vl.color || '#ffffff66', 1.4, vl.dash || [4, 4]);
      if (vl.label) { const right = X(vl.v) > L + pw - 60; txt(c, vl.label, X(vl.v) + (right ? -4 : 4), T + 11, vl.color || '#fff', 9.5, right ? 'right' : 'left', 700); }
    });
    series.forEach((s) => {
      const xs = s.xs, x00 = s.x0 || 0;
      if (s.type === 'bar') {
        const bw = Math.max(1, (pw / Math.max(1, s.data.length)) * (s.fill || 0.75));
        s.data.forEach((v, i) => { c.fillStyle = s.colors ? s.colors[i] : s.color; const xx = X(xs ? xs[i] : x00 + i), yy = Y(Math.max(y0, v)); c.fillRect(xx - bw / 2, yy, bw, Y(Math.max(y0, 0)) - yy); });
        return;
      }
      c.beginPath();
      let st = false;
      s.data.forEach((v, i) => { if (!isFinite(v)) return; const xx = X(xs ? xs[i] : x00 + i), yy = Y(clamp(v, y0, y1)); if (st) c.lineTo(xx, yy); else { c.moveTo(xx, yy); st = true; } });
      stroke(c, s.color, s.width || 2, s.glow || 0, s.dash || null);
      if (s.dots) s.data.forEach((v, i) => { if (isFinite(v)) dot(c, X(xs ? xs[i] : x00 + i), Y(clamp(v, y0, y1)), 2.8, s.color, null); });
    });
    if (sp.mark != null && sp.mark >= x0 && sp.mark <= x1) {
      line(c, X(sp.mark), T, X(sp.mark), T + ph, YEL, 1.3, [3, 3]);
      series.forEach((s) => {
        if (s.type === 'bar' || s.noDot) return;
        const i = s.xs ? s.xs.indexOf(sp.mark) : Math.round(sp.mark - (s.x0 || 0)), v = s.data[i];
        if (isFinite(v)) dot(c, X(sp.mark), Y(clamp(v, y0, y1)), 4.2, s.color, null);
      });
    }
    c.font = `600 10.5px ${fontFamily()}`;
    const items = series.filter((s) => s.label), total = items.reduce((a, s) => a + c.measureText(s.label).width + 28, 0);
    let lx = lang === 'fa' ? L : L + pw - total;
    items.forEach((s) => {
      line(c, lx, 12, lx + 11, 12, s.color, 2.5, s.dash || null);
      txt(c, s.label, lx + 16, 16, '#b8c5de', 10.5, 'left', 600);
      c.font = `600 10.5px ${fontFamily()}`;
      lx += c.measureText(s.label).width + 28;
    });
    return { X, Y, L, T, pw, ph, x0, x1, y0, y1, w, h, c };
  }
  const chartX = (map, e, cv) => { const r = cv.getBoundingClientRect(); return map.x0 + ((e.clientX - r.left - map.L) / map.pw) * (map.x1 - map.x0); };
  const chartY = (map, e, cv) => { const r = cv.getBoundingClientRect(); return map.y0 + ((map.T + map.ph - (e.clientY - r.top)) / map.ph) * (map.y1 - map.y0); };

  /* --------------------------------------------------- controls helpers */
  function seg(id, value, onPick, attr = 'v') {
    const el = $(id);
    const set = (v) => el.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset[attr] === String(v)));
    el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { if (b.disabled) return; set(b.dataset[attr]); onPick(b.dataset[attr]); }));
    set(value);
    return set;
  }
  function slider(id, fmt, onInput) {
    const el = $(id), out = $(id + 'Out');
    const upd = () => { if (out) out.textContent = fmt(+el.value); };
    el.addEventListener('input', () => { upd(); onInput(+el.value); });
    upd();
    return { el, upd, set(v) { el.value = v; upd(); } };
  }
  const playLabel = (btn, isOn, onKey = 'stopBtn') => () => { btn.innerHTML = isOn() ? t(onKey) : labelOf(btn); btn.classList.toggle('playing', isOn()); };

  /* --------------------------------------------------------------- data */
  const DS_EN = { blobs3: '3 blobs', blobs5: '5 blobs', varied: 'Different spreads', aniso: 'Stretched blobs', moons: 'Moons', circles: 'Circles', density: 'Different densities', uniform: 'No structure (uniform)' };
  function makeData(cfg) {
    const D = Object.assign({ ds: 'blobs3', n: 180, noise: 0.2, seed: 1, brush: 1, truth: false, angle: 30, stretch: 3 }, cfg);
    D.subs = []; D.bars = [];
    D.on = (f) => D.subs.push(f);
    D.emit = (kind) => { D.subs.forEach((f) => f(kind)); D.bars.forEach((b) => b()); };
    D.load = () => {
      if (D.ds === 'pca') {
        const r = U.rng(D.seed * 31 + 7), a = (D.angle * Math.PI) / 180, s2 = 0.09, s1 = Math.min(0.42, s2 * D.stretch);
        D.X = []; D.y = [];
        while (D.X.length < D.n) {
          const u = U.gauss(r) * s1, v = U.gauss(r) * s2, x = 0.05 + u * Math.cos(a) - v * Math.sin(a), y = -0.02 + u * Math.sin(a) + v * Math.cos(a);
          if (Math.abs(x) < 0.97 && Math.abs(y) < 0.97) { D.X.push([x, y]); D.y.push(0); }
        }
        D.k = 1;
        return;
      }
      const g = U.makeClusters(D.ds, D.n, D.noise, D.seed);
      D.X = g.X; D.y = g.y; D.k = g.k;
    };
    D.regen = () => { D.load(); D.emit('regen'); };
    D.load();
    return D;
  }
  function dataBar(key, D, opts = {}) {
    const el = document.querySelector(`[data-bar="${key}"]`);
    if (!el) return;
    const maxN = opts.maxN || 400;
    const sel = D.ds === 'pca' ? '' : `<select aria-label="Dataset" data-r="ds">${U.CL_LIST.map((d) => `<option value="${d}" data-i18n="ds_${d}">${DS_EN[d]}</option>`).join('')}</select>`;
    const extra = D.ds === 'pca'
      ? `<div class="ctrl"><label><span data-i18n="corrAngle">Orientation</span><output data-o="angle"></output></label><input type="range" data-r="angle" min="0" max="180" step="1" /></div>
         <div class="ctrl"><label><span data-i18n="stretch">Stretch (σ₁ / σ₂)</span><output data-o="stretch"></output></label><input type="range" data-r="stretch" min="1" max="6" step="0.1" /></div>`
      : `<div class="ctrl"><label><span data-i18n="dbNoise">Noise</span><output data-o="noise"></output></label><input type="range" data-r="noise" min="0" max="1" step="0.05" /></div>`;
    el.innerHTML = `
      <div class="db-top">
        ${sel}
        <button class="btn small" data-r="new" type="button" data-i18n="dbNew">↻ New sample</button>
        <div class="seg brush" role="group">
          <button type="button" data-b="1"><i style="background:var(--teal)"></i><span data-i18n="dbAdd">Add points</span></button>
          <button type="button" data-b="0" data-i18n="dbErase">⌫ Erase</button>
        </div>
        <button class="btn small" data-r="clear" type="button" data-i18n="dbClear">Clear</button>
        <span class="db-spacer"></span>
        ${D.ds === 'pca' ? '' : '<label class="toggle"><input type="checkbox" data-r="truth" /> <span data-i18n="dbTruth">Colour by true groups</span></label>'}
      </div>
      <div class="db-sliders">
        <div class="ctrl"><label><span data-i18n="dbN">Points</span><output data-o="n"></output></label><input type="range" data-r="n" min="10" max="${maxN}" step="10" /></div>
        ${extra}
      </div>`;
    const q = (s) => el.querySelector(s);
    const sync = () => {
      if (q('[data-r="ds"]')) q('[data-r="ds"]').value = D.ds;
      q('[data-r="n"]').value = D.n; q('[data-o="n"]').textContent = D.n;
      if (q('[data-r="noise"]')) { q('[data-r="noise"]').value = D.noise; q('[data-o="noise"]').textContent = (+D.noise).toFixed(2); }
      if (q('[data-r="angle"]')) { q('[data-r="angle"]').value = D.angle; q('[data-o="angle"]').textContent = D.angle + '°'; q('[data-r="stretch"]').value = D.stretch; q('[data-o="stretch"]').textContent = (+D.stretch).toFixed(1) + '×'; }
      if (q('[data-r="truth"]')) q('[data-r="truth"]').checked = D.truth;
      el.querySelectorAll('[data-b]').forEach((b) => b.classList.toggle('on', +b.dataset.b === D.brush));
    };
    D.bars.push(sync);
    if (q('[data-r="ds"]')) q('[data-r="ds"]').addEventListener('change', (e) => { D.ds = e.target.value; D.regen(); });
    q('[data-r="new"]').addEventListener('click', () => { D.seed++; D.regen(); });
    q('[data-r="clear"]').addEventListener('click', () => { D.X.length = 0; D.y.length = 0; D.emit('edit'); });
    if (q('[data-r="truth"]')) q('[data-r="truth"]').addEventListener('change', (e) => { D.truth = e.target.checked; D.emit('view'); });
    q('[data-r="n"]').addEventListener('input', (e) => { D.n = +e.target.value; D.regen(); });
    ['noise', 'angle', 'stretch'].forEach((k) => { const s = q(`[data-r="${k}"]`); if (s) s.addEventListener('input', (e) => { D[k] = +e.target.value; D.regen(); }); });
    el.querySelectorAll('[data-b]').forEach((b) => b.addEventListener('click', () => { D.brush = +b.dataset.b; D.bars.forEach((s) => s()); }));
    sync();
  }
  /** colour clusters consistently with the true groups (greedy matching), for nicer comparisons */
  function alignLabels(labels, truth) {
    const ks = [...new Set(labels.filter((l) => l >= 0))], used = new Set(), map = new Map();
    const pairs = [];
    ks.forEach((k) => {
      const cnt = {};
      labels.forEach((l, i) => { if (l === k && truth[i] >= 0) cnt[truth[i]] = (cnt[truth[i]] || 0) + 1; });
      Object.entries(cnt).forEach(([tl, c]) => pairs.push([c, k, +tl]));
    });
    pairs.sort((a, b) => b[0] - a[0]).forEach(([, k, tl]) => { if (!map.has(k) && !used.has(tl)) { map.set(k, tl); used.add(tl); } });
    let next = Math.max(-1, ...truth) + 1;
    ks.forEach((k) => { if (!map.has(k)) { while (used.has(next)) next++; map.set(k, next); used.add(next); } });
    return labels.map((l) => (l < 0 ? -1 : map.get(l)));
  }
  const ariTruth = (labels, D) => {
    const a = [], b = [];
    labels.forEach((l, i) => { if (D.y[i] >= 0) { a.push(l); b.push(D.y[i]); } });
    return a.length > 1 && D.ds !== 'uniform' ? U.ari(a, b) : NaN;
  };

  /* -------------------------------------------------------------- board */
  function geo(w, h, span = 1.08) {
    const s = Math.min(w, h) / (2 * span), cx = w / 2, cy = h / 2;
    return { w, h, s, cx, cy, X: (x) => cx + x * s, Y: (y) => cy - y * s, ix: (px) => (px - cx) / s, iy: (py) => (cy - py) / s, xmin: -cx / s, xmax: cx / s, ymin: -cy / s, ymax: cy / s };
  }
  function drawAxes(c, g, origin = false) {
    c.strokeStyle = 'rgba(160,180,220,.09)'; c.lineWidth = 1; c.beginPath();
    for (let v = -1; v <= 1.001; v += 0.5) { c.moveTo(g.X(v) + 0.5, 0); c.lineTo(g.X(v) + 0.5, g.h); c.moveTo(0, g.Y(v) + 0.5); c.lineTo(g.w, g.Y(v) + 0.5); }
    c.stroke();
    if (origin) { line(c, g.X(0), 0, g.X(0), g.h, 'rgba(180,195,225,.25)', 1); line(c, 0, g.Y(0), g.w, g.Y(0), 'rgba(180,195,225,.25)', 1); }
    txt(c, 'x₁', g.w - 8, g.Y(0) - 6, 'rgba(180,195,225,.5)', 11, 'right', 700);
    txt(c, 'x₂', g.X(0) + 6, 13, 'rgba(180,195,225,.5)', 11, 'left', 700);
  }
  function board(cv, o) {
    const B = Object.assign({ data: null, editable: true, cell: 4, crisp: true, field: null, color: null, radius: null, over: null, under: null, onHover: null, insp: null, inspect: null, drag: null, pointR: 4, origin: false, points: true }, o);
    B.cv = cv; B.hover = null; B.fieldKey = ''; B.fieldDirty = true;
    B.view = view(cv, () => drawBoard(B));
    B.redraw = () => { B.view.dirty = true; };
    B.refield = () => { B.fieldDirty = true; B.view.dirty = true; };
    if (B.data) B.data.on(() => B.refield());
    const toData = (e) => { const r = cv.getBoundingClientRect(), g = geo(r.width, r.height); return [g.ix(e.clientX - r.left), g.iy(e.clientY - r.top), g]; };
    const paint = (b, x, y, g) => {
      const D = B.data;
      if (b === 0) {
        let best = -1, bd = 14 / g.s;
        D.X.forEach((p, i) => { const dd = Math.hypot(p[0] - x, p[1] - y); if (dd < bd) { bd = dd; best = i; } });
        if (best < 0) return;
        D.X.splice(best, 1); D.y.splice(best, 1);
      } else { D.X.push([clamp(x, g.xmin + 0.02, g.xmax - 0.02), clamp(y, g.ymin + 0.02, g.ymax - 0.02)]); D.y.push(-1); }
      D.emit('edit');
    };
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    cv.addEventListener('pointerdown', (e) => {
      const [x, y, g] = toData(e);
      if (B.drag) {
        const h = B.drag.hit(x, y, g);
        if (h != null) { B.dragging = h; try { cv.setPointerCapture(e.pointerId); } catch (err) { /* */ } e.preventDefault(); return; }
      }
      if (!B.editable || !B.data) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* */ }
      B.paint = { b: B.data.brush, x, y };
      paint(B.paint.b, x, y, g);
    });
    cv.addEventListener('pointermove', (e) => {
      const [x, y, g] = toData(e);
      B.hover = [x, y];
      if (B.dragging != null) B.drag.move(B.dragging, clamp(x, g.xmin + 0.01, g.xmax - 0.01), clamp(y, g.ymin + 0.01, g.ymax - 0.01));
      else if (B.paint && Math.hypot(x - B.paint.x, y - B.paint.y) * g.s > (B.paint.b === 0 ? 6 : 16)) { B.paint.x = x; B.paint.y = y; paint(B.paint.b, x, y, g); }
      if (B.drag) cv.style.cursor = B.dragging != null ? 'grabbing' : B.drag.hit(x, y, g) != null ? 'grab' : 'crosshair';
      if (B.onHover) B.onHover(x, y);
      B.writeInsp(); B.redraw();
    });
    const end = () => { if (B.dragging != null && B.drag.end) B.drag.end(B.dragging); B.dragging = null; B.paint = null; };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('pointerleave', () => { B.hover = null; if (B.dragging == null) B.paint = null; if (B.onHover) B.onHover(null, null); B.writeInsp(); B.redraw(); });
    B.writeInsp = () => {
      if (!B.insp) return;
      if (!B.hover || !B.inspect) { B.insp.innerHTML = t(B.drag ? 'inspDrag' : B.editable ? 'inspHint' : 'inspHintRO'); return; }
      B.insp.innerHTML = B.inspect(B.hover[0], B.hover[1]);
    };
    refreshers.push(() => B.writeInsp());
    B.writeInsp();
    return B;
  }
  function drawBoard(B) {
    const { c, w, h } = prep(B.cv), g = geo(w, h);
    B.g = g;
    c.fillStyle = '#070c19'; c.fillRect(0, 0, w, h);
    if (B.field) {
      const key = `${Math.round(w)}x${Math.round(h)}`;
      if (B.fieldDirty || B.fieldKey !== key) {
        const cols = Math.max(8, Math.round(w / B.cell)), rows = Math.max(8, Math.round(h / B.cell));
        const off = B.off || (B.off = document.createElement('canvas'));
        off.width = cols; off.height = rows;
        const oc = off.getContext('2d'), img = oc.createImageData(cols, rows), d = img.data;
        for (let r = 0; r < rows; r++) {
          const y = g.iy(((r + 0.5) * h) / rows);
          for (let q = 0; q < cols; q++) {
            const x = g.ix(((q + 0.5) * w) / cols), f = B.field(x, y), k = (r * cols + q) * 4;
            const col = f ? f[0] : BG_RGB, a = f ? f[1] : 0;
            d[k] = BG_RGB[0] + (col[0] - BG_RGB[0]) * a; d[k + 1] = BG_RGB[1] + (col[1] - BG_RGB[1]) * a; d[k + 2] = BG_RGB[2] + (col[2] - BG_RGB[2]) * a; d[k + 3] = 255;
          }
        }
        oc.putImageData(img, 0, 0);
        B.fieldKey = key; B.fieldDirty = false;
      }
      c.imageSmoothingEnabled = !B.crisp;
      c.drawImage(B.off, 0, 0, w, h);
      c.imageSmoothingEnabled = true;
    }
    drawAxes(c, g, B.origin);
    if (B.under) B.under(c, g);
    const D = B.data;
    if (D && B.points) {
      for (let i = 0; i < D.X.length; i++) {
        const p = D.X[i], x = g.X(p[0]), y = g.Y(p[1]);
        if (B.drawPoint) { B.drawPoint(c, i, x, y); continue; }
        const col = D.truth ? (D.y[i] >= 0 ? pal(D.y[i]) : '#d6deef') : B.color ? B.color(i) : '#d6deef';
        dot(c, x, y, B.radius ? B.radius(i) : B.pointR, col);
      }
    }
    if (B.over) B.over(c, g);
    if (B.hover && !B.drag) ring(c, g.X(B.hover[0]), g.Y(B.hover[1]), 5, 'rgba(255,255,255,.7)', 1.3);
  }
  function hull(pts) {
    if (pts.length < 3) return pts.slice();
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    P.forEach((p) => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    P.slice().reverse().forEach((p) => { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function drawHulls(c, g, X, labels, minSize = 3) {
    const groups = {};
    labels.forEach((l, i) => { if (l >= 0) (groups[l] = groups[l] || []).push(X[i]); });
    Object.entries(groups).forEach(([l, pts]) => {
      if (pts.length < minSize) return;
      const H = hull(pts);
      c.beginPath(); H.forEach((p, k) => (k ? c.lineTo(g.X(p[0]), g.Y(p[1])) : c.moveTo(g.X(p[0]), g.Y(p[1])))); c.closePath();
      c.fillStyle = rgba(palRGB(+l), 0.1); c.fill(); stroke(c, rgba(palRGB(+l), 0.55), 1.4);
    });
  }
  function ellipse(c, g, mu, S, k, col, width = 1.8, dash = null) {
    const e = U.eig2(S);
    c.beginPath();
    c.ellipse(g.X(mu[0]), g.Y(mu[1]), Math.sqrt(Math.max(e.vals[0], 1e-9)) * k * g.s, Math.sqrt(Math.max(e.vals[1], 1e-9)) * k * g.s, -e.angle, 0, TAU);
    stroke(c, col, width, 0, dash);
  }
  /** a metric "ball" of radius r around (x, y) */
  function metricBall(c, g, x, y, r, metric, p = 2) {
    c.beginPath();
    if (metric === 'euclid') c.arc(g.X(x), g.Y(y), r * g.s, 0, TAU);
    else if (metric === 'chebyshev') c.rect(g.X(x - r), g.Y(y + r), 2 * r * g.s, 2 * r * g.s);
    else {
      const pp = metric === 'manhattan' ? 1 : p;
      for (let i = 0; i <= 240; i++) {
        const a = (i / 240) * TAU, ca = Math.cos(a), sa = Math.sin(a);
        const px = x + r * Math.sign(ca) * Math.pow(Math.abs(ca), 2 / pp), py = y + r * Math.sign(sa) * Math.pow(Math.abs(sa), 2 / pp);
        if (i) c.lineTo(g.X(px), g.Y(py)); else c.moveTo(g.X(px), g.Y(py));
      }
      c.closePath();
    }
  }

  /* =========================================================== DATA SETUP */
  const DKm = makeData({ ds: 'blobs5', n: 200, noise: 0.15, seed: 2 });
  const DH = makeData({ ds: 'blobs3', n: 120, noise: 0.1, seed: 3 });
  const DD = makeData({ ds: 'moons', n: 300, noise: 0.08, seed: 4 });
  const DGm = makeData({ ds: 'aniso', n: 240, noise: 0.25, seed: 5 });
  const DP = makeData({ ds: 'pca', n: 120, seed: 6, angle: 30, stretch: 3.5 });
  const DCa = makeData({ ds: 'moons', n: 300, noise: 0.08, seed: 7 });
  [['km', DKm], ['hc', DH, { maxN: 250 }], ['db', DD], ['gm', DGm], ['pca', DP], ['ca', DCa]].forEach(([k, D, o]) => dataBar(k, D, o));

  // dynamic DOM built before the i18n scan
  const VOR_METRICS = ['euclid', 'manhattan', 'chebyshev', 'cosine'];
  $('vorQuad').innerHTML = VOR_METRICS.map((m) => `<div class="qp"><div class="qcv"><canvas data-m="${m}"></canvas></div><small data-i18n="vor_${m}">${{ euclid: 'Euclidean (L₂)', manhattan: 'Manhattan (L₁)', chebyshev: 'Chebyshev (L∞)', cosine: 'Cosine (angle only)' }[m]}</small></div>`).join('');
  const CA_ALGOS = ['kmeans', 'gmm', 'ward', 'single', 'average', 'dbscan', 'spectral', 'meanshift'];
  $('caGrid').innerHTML = CA_ALGOS.map((a) => `<div class="lad" data-id="${a}"><div class="lad-cv"><canvas></canvas></div><div class="lad-info"><div class="lad-name"><span data-i18n="ca_${a}">${t('ca_' + a)}</span></div><div class="lad-stats"></div></div></div>`).join('');

  /* --------------------------------------------- i18n application */
  const originals = new Map();
  document.querySelectorAll('[data-i18n]').forEach((el) => originals.set(el, el.innerHTML));
  function labelOf(el, k) { const key = k || el.dataset.i18n; return lang === 'fa' && I18N.fa[key] != null ? I18N.fa[key] : originals.get(el) || key; }
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    originals.forEach((_, el) => { el.innerHTML = labelOf(el); });
    $('langBtn').textContent = lang === 'fa' ? 'English' : 'فارسی';
    document.title = t('docTitle');
    refreshers.forEach((f) => f());
    markAll();
  }
  $('langBtn').addEventListener('click', () => {
    lang = lang === 'fa' ? 'en' : 'fa';
    try { localStorage.setItem('mlLabLang', lang); } catch (e) { /* storage unavailable */ }
    applyLang();
  });
  document.querySelectorAll('[data-tex]').forEach((el) => renderTex(el, el.dataset.tex));

  /* ================================================ 1.1 DISTANCE EXPLORER */
  const MT = { A: [-0.4, -0.25], B: [0.35, 0.4], C: [0.35, -0.25], metric: 'euclid', p: Math.pow(10, 0.48) };
  const mtDist = (m, a, b) => (m === 'minkowski' ? U.minkowski(MT.p)(a, b) : U.METRICS[m](a, b));
  const MT_LIST = ['euclid', 'manhattan', 'chebyshev', 'minkowski', 'cosine'];
  function mtHit(pts) {
    return (x, y, g) => { let best = null, bd = 16 / g.s; pts().forEach(([k, p]) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = k; } }); return best; };
  }
  const mtB = board($('mtBoard'), {
    editable: false, origin: true,
    drag: { hit: mtHit(() => [['A', MT.A], ['B', MT.B]]), move: (k, x, y) => { MT[k] = [x, y]; mtUpdate(); } },
    over(c, g) {
      const A = MT.A, B = MT.B, m = MT.metric, d = mtDist(m, A, B);
      if (m === 'cosine') {
        const aA = Math.atan2(A[1], A[0]), aB = Math.atan2(B[1], B[0]);
        let dA = aB - aA; while (dA > Math.PI) dA -= TAU; while (dA < -Math.PI) dA += TAU;
        const R = 3;
        // the cone of directions at the same angle from A
        [aA + dA, aA - dA].forEach((a) => line(c, g.X(0), g.Y(0), g.X(R * Math.cos(a)), g.Y(R * Math.sin(a)), YEL, 2, [6, 5]));
        c.beginPath(); c.moveTo(g.X(0), g.Y(0)); c.arc(g.X(0), g.Y(0), 0.25 * g.s, -aA, -(aA + dA), dA > 0); c.closePath();
        c.fillStyle = 'rgba(255,203,87,.18)'; c.fill();
        arrow(c, g.X(0), g.Y(0), g.X(A[0]), g.Y(A[1]), TEAL, 2.2); arrow(c, g.X(0), g.Y(0), g.X(B[0]), g.Y(B[1]), PINK, 2.2);
        txt(c, `θ = ${num((Math.abs(dA) * 180) / Math.PI, 1)}°`, g.X(0.3 * Math.cos(aA + dA / 2)), g.Y(0.3 * Math.sin(aA + dA / 2)), YEL, 12, 'center', 800);
      } else {
        metricBall(c, g, A[0], A[1], d, m, MT.p);
        c.fillStyle = 'rgba(255,203,87,.07)'; c.fill(); stroke(c, YEL, 2.2, 6);
        // the path the metric "travels"
        if (m === 'manhattan') { c.beginPath(); c.moveTo(g.X(A[0]), g.Y(A[1])); c.lineTo(g.X(B[0]), g.Y(A[1])); c.lineTo(g.X(B[0]), g.Y(B[1])); stroke(c, '#fff', 2, 0, [6, 5]); }
        else if (m === 'chebyshev') {
          const dx = B[0] - A[0], dy = B[1] - A[1], s = Math.min(Math.abs(dx), Math.abs(dy));
          const mid = [A[0] + Math.sign(dx) * s, A[1] + Math.sign(dy) * s];
          c.beginPath(); c.moveTo(g.X(A[0]), g.Y(A[1])); c.lineTo(g.X(mid[0]), g.Y(mid[1])); c.lineTo(g.X(B[0]), g.Y(B[1])); stroke(c, '#fff', 2, 0, [6, 5]);
        } else line(c, g.X(A[0]), g.Y(A[1]), g.X(B[0]), g.Y(B[1]), '#fff', 2, [6, 5]);
      }
      [['A', A, TEAL], ['B', B, PINK]].forEach(([k, p, col]) => { dot(c, g.X(p[0]), g.Y(p[1]), 8, col, '#fff'); txt(c, k, g.X(p[0]), g.Y(p[1]) + 4, '#06122a', 11, 'center', 900); });
      txt(c, `d(A, B) = ${num(d, 3)}`, g.X((A[0] + B[0]) / 2) + 10, g.Y((A[1] + B[1]) / 2) - 8, '#fff', 13, 'left', 800);
    },
  });
  function mtUpdate() {
    const vals = MT_LIST.map((m) => mtDist(m, MT.A, MT.B));
    const mx = Math.max(...vals.slice(0, 4), 1e-9);
    const names = { euclid: t('mEuclid'), manhattan: t('mManhattan'), chebyshev: t('mChebyshev'), minkowski: `Minkowski p=${num(MT.p, 2)}`, cosine: t('mCosine') };
    $('mtBars').innerHTML = MT_LIST.map((m, i) => `<div class="db-row ${m === MT.metric ? 'on' : ''}"><span class="nm">${names[m]}</span><span class="tr"><i style="width:${(clamp(m === 'cosine' ? vals[i] / 2 : vals[i] / mx, 0, 1) * 100).toFixed(1)}%"></i></span><b>${num(vals[i], 3)}</b></div>`).join('');
    $('mtNote').innerHTML = t('mtNote_' + MT.metric);
    $('mtPCtrl').classList.toggle('disabled', MT.metric !== 'minkowski');
    mtB.redraw(); ballsV.dirty = true; triV.dirty = true;
  }
  seg('mtMetric', MT.metric, (m) => { MT.metric = m; mtUpdate(); }, 'm');
  slider('mtP', (v) => num(Math.pow(10, v), 2), (v) => { MT.p = Math.pow(10, v); if (MT.metric !== 'minkowski') { MT.metric = 'minkowski'; document.querySelectorAll('#mtMetric button').forEach((b) => b.classList.toggle('on', b.dataset.m === 'minkowski')); } mtUpdate(); });
  const ballsV = view($('mtBalls'), () => {
    const { c, w, h } = prep($('mtBalls')), g = geo(w, h - 20, 1.25);
    g.cy += 10;
    drawAxes(c, g, true);
    const ps = [[0.5, '#7b8ab0'], [1, PINK], [1.5, VIO], [2, CYAN], [4, TEAL], [Infinity, BLUE]];
    ps.forEach(([p, col]) => { metricBall(c, g, 0, 0, 1, p === Infinity ? 'chebyshev' : p === 1 ? 'manhattan' : p === 2 ? 'euclid' : 'mink', p); stroke(c, col, 1.6); });
    if (MT.metric === 'minkowski') { metricBall(c, g, 0, 0, 1, 'mink', MT.p); stroke(c, YEL, 3, 8); }
    let ly = 46;
    ps.concat(MT.metric === 'minkowski' ? [[MT.p, YEL]] : []).forEach(([p, col]) => {
      line(c, 14, ly - 4, 30, ly - 4, col, 2.5);
      txt(c, p === Infinity ? 'p = ∞' : `p = ${num(p, p % 1 ? 2 : 0)}`, 36, ly, '#c9d5ee', 11, 'left', 700);
      ly += 17;
    });
  });
  let triG = null;
  const triV = view($('mtTri'), () => {
    const { c, w, h } = prep($('mtTri')), g = geo(w, h - 20, 1.1);
    g.cy += 10; triG = g;
    drawAxes(c, g, false);
    const m = MT.metric, A = MT.A, B = MT.B, C = MT.C;
    const ab = mtDist(m, A, B), ac = mtDist(m, A, C), cb = mtDist(m, C, B), ok = ab <= ac + cb + 1e-9;
    line(c, g.X(A[0]), g.Y(A[1]), g.X(B[0]), g.Y(B[1]), ok ? TEAL : PINK, 3);
    line(c, g.X(A[0]), g.Y(A[1]), g.X(C[0]), g.Y(C[1]), '#c9d5ee', 2, [5, 4]);
    line(c, g.X(C[0]), g.Y(C[1]), g.X(B[0]), g.Y(B[1]), '#c9d5ee', 2, [5, 4]);
    const lab = (p, q, v) => txt(c, num(v, 2), g.X((p[0] + q[0]) / 2) + 6, g.Y((p[1] + q[1]) / 2) - 6, '#e9f0ff', 12, 'left', 800);
    lab(A, B, ab); lab(A, C, ac); lab(C, B, cb);
    [['A', A, TEAL], ['B', B, PINK], ['C', C, YEL]].forEach(([k, p, col]) => { dot(c, g.X(p[0]), g.Y(p[1]), 8, col, '#fff'); txt(c, k, g.X(p[0]), g.Y(p[1]) + 4, '#06122a', 11, 'center', 900); });
    txt(c, `${num(ab, 2)} ${ok ? '≤' : '>'} ${num(ac, 2)} + ${num(cb, 2)}  ${ok ? '✓ ' + t('triOk') : '✗ ' + t('triBad')}`, w / 2, h - 12, ok ? TEAL : PINK, 13, 'center', 800);
  });
  (() => {
    const cv = $('mtTri');
    let drag = false;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [triG.ix(e.clientX - r.left), triG.iy(e.clientY - r.top)]; };
    cv.style.cursor = 'grab';
    cv.addEventListener('pointerdown', (e) => { if (!triG) return; const [x, y] = pos(e); if (Math.hypot(x - MT.C[0], y - MT.C[1]) * triG.s < 18) { drag = true; try { cv.setPointerCapture(e.pointerId); } catch (err) { /* */ } } });
    cv.addEventListener('pointermove', (e) => { if (!drag) return; MT.C = pos(e).map((v) => clamp(v, -1.05, 1.05)); triV.dirty = true; });
    ['pointerup', 'pointercancel'].forEach((ev) => cv.addEventListener(ev, () => { drag = false; }));
  })();
  refreshers.push(mtUpdate);

  /* ================================================== 1.2 VORONOI ×4 */
  const VOR = { sites: [], seed: 3 };
  const vorRandom = (n) => { const r = U.rng(VOR.seed++); VOR.sites = Array.from({ length: n }, () => [r() * 1.7 - 0.85, r() * 1.7 - 0.85]); };
  vorRandom(7);
  const vorBoards = [...document.querySelectorAll('#vorQuad canvas')].map((cv) => {
    const m = cv.dataset.m, dist = U.METRICS[m];
    const B = board(cv, {
      editable: false, cell: 2, origin: m === 'cosine',
      field(x, y) {
        let b = 0, bd = Infinity;
        VOR.sites.forEach((s, k) => { const d = dist([x, y], s); if (d < bd) { bd = d; b = k; } });
        return [PAL_RGB[b % PAL.length], 0.32];
      },
      drag: {
        hit: (x, y, g) => { let best = null, bd = 14 / g.s; VOR.sites.forEach((s, k) => { const d = Math.hypot(s[0] - x, s[1] - y); if (d < bd) { bd = d; best = k; } }); return best; },
        move: (k, x, y) => { VOR.sites[k] = [x, y]; vorBoards.forEach((b) => b.refield()); },
      },
      over(c, g) {
        if (m === 'cosine') VOR.sites.forEach((s) => line(c, g.X(0), g.Y(0), g.X(s[0] * 3), g.Y(s[1] * 3), 'rgba(255,255,255,.18)', 1, [3, 4]));
        VOR.sites.forEach((s, k) => { dot(c, g.X(s[0]), g.Y(s[1]), 7, PAL[k % PAL.length], '#fff'); });
      },
    });
    return B;
  });
  const vorAll = () => vorBoards.forEach((b) => b.refield());
  $('vorRand').addEventListener('click', () => { vorRandom(VOR.sites.length); vorAll(); });
  $('vorAdd').addEventListener('click', () => { if (VOR.sites.length < 12) { const r = U.rng(VOR.seed++); VOR.sites.push([r() * 1.7 - 0.85, r() * 1.7 - 0.85]); vorAll(); } });
  $('vorDel').addEventListener('click', () => { if (VOR.sites.length > 2) { VOR.sites.pop(); vorAll(); } });

  /* ================================================ 1.3 MAHALANOBIS */
  const MH = { angle: 35, stretch: 4, Q: [0.12, 0.32], X: [], st: null };
  function mhGen() {
    const r = U.rng(41), a = (MH.angle * Math.PI) / 180, s2 = 0.075, s1 = Math.min(0.32, s2 * MH.stretch);
    MH.X = [];
    for (let i = 0; i < 260; i++) { const u = U.gauss(r) * s1, v = U.gauss(r) * s2; MH.X.push([u * Math.cos(a) - v * Math.sin(a), u * Math.sin(a) + v * Math.cos(a)]); }
    MH.st = U.cov2(MH.X);
    MH.inv = U.inv2(MH.st.S);
  }
  const mhB = board($('mhBoard'), {
    editable: false, points: false,
    drag: { hit: (x, y, g) => (Math.hypot(x - MH.Q[0], y - MH.Q[1]) * g.s < 18 ? 'Q' : null), move: (k, x, y) => { MH.Q = [x, y]; mhStats(); } },
    over(c, g) {
      const { mu, S } = MH.st, sAvg = Math.sqrt((S[0] + S[2]) / 2);
      MH.X.forEach((p) => dot(c, g.X(p[0]), g.Y(p[1]), 2.8, 'rgba(214,222,239,.75)', null));
      [1, 2, 3].forEach((k) => {
        ring(c, g.X(mu[0]), g.Y(mu[1]), k * sAvg * g.s, 'rgba(119,152,255,.85)', 1.5, k === 3 ? null : [5, 4]);
        ellipse(c, g, mu, S, k, 'rgba(255,93,158,.95)', 2, k === 3 ? null : [5, 4]);
        txt(c, k + 'σ', g.X(mu[0]) + k * sAvg * g.s + 4, g.Y(mu[1]) - 4, 'rgba(160,185,255,.9)', 10, 'left', 700);
      });
      cross(c, g.X(mu[0]), g.Y(mu[1]), 6, '#fff', 2.4);
      line(c, g.X(mu[0]), g.Y(mu[1]), g.X(MH.Q[0]), g.Y(MH.Q[1]), YEL, 1.4, [4, 4]);
      dot(c, g.X(MH.Q[0]), g.Y(MH.Q[1]), 9, YEL, '#fff');
      txt(c, 'x', g.X(MH.Q[0]), g.Y(MH.Q[1]) + 4, '#06122a', 11, 'center', 900);
    },
  });
  function mhStats() {
    const { mu, S } = MH.st, sAvg = Math.sqrt((S[0] + S[2]) / 2);
    const dE = U.METRICS.euclid(MH.Q, mu), dM = U.mahalanobis(MH.inv)(MH.Q, mu), pr = 1 - Math.exp(-(dM * dM) / 2);
    readouts($('mhRo'), [
      ['eucRaw', num(dE, 3)], ['eucSig', num(dE / sAvg, 2) + 'σ'], ['mahaD', num(dM, 2) + 'σ', dM > 3 ? 'warn' : 'ok'], ['chiPct', pct(pr)],
    ]);
    $('mhNote').innerHTML = dM > 3 && dE / sAvg < 2.5 ? t('mhHidden') : dM > 3 ? t('mhOut') : dE / sAvg > 2 ? t('mhFine') : t('mhIn');
    $('mhNote').className = 'note' + (dM > 3 ? ' warn' : ' teal');
    mhB.redraw();
  }
  slider('mhA', (v) => v + '°', (v) => { MH.angle = v; mhGen(); mhStats(); });
  slider('mhS', (v) => num(v, 1) + '×', (v) => { MH.stretch = v; mhGen(); mhStats(); });
  mhGen();
  refreshers.push(mhStats);

  /* ================================================ 1.4 FEATURE SCALING */
  const SC = { f: 1, z: false, q: 0, X: [] };
  (() => { const r = U.rng(77); for (let i = 0; i < 46; i++) SC.X.push([U.gauss(r) * 0.42, U.gauss(r) * 0.42]); SC.X[0] = [0.05, 0.02]; })();
  function scSpace() {
    let T = SC.X.map((p) => [p[0], p[1] * SC.f]);
    if (SC.z) {
      const st = U.cov2(T), s1 = Math.sqrt(st.S[0]) || 1, s2 = Math.sqrt(st.S[2]) || 1;
      T = T.map((p) => [(p[0] - st.mu[0]) / s1 * 0.4, (p[1] - st.mu[1]) / s2 * 0.4]);
    }
    return T;
  }
  const scNN = (T, q, k = 3) => T.map((p, i) => [U.METRICS.euclid(p, T[q]), i]).filter((d) => d[1] !== q).sort((a, b) => a[0] - b[0]).slice(0, k).map((d) => d[1]);
  let scMap = null;
  const scV = view($('scBoard'), () => {
    const { c, w, h } = prep($('scBoard'));
    const T = scSpace();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    T.forEach((p) => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    const pad = 36, s = Math.min((w - 2 * pad) / Math.max(1e-6, x1 - x0), (h - 2 * pad) / Math.max(1e-6, y1 - y0));
    const cx = w / 2 - ((x0 + x1) / 2) * s, cy = h / 2 + ((y0 + y1) / 2) * s;
    const X = (v) => cx + v * s, Y = (v) => cy - v * s;
    scMap = { X, Y, T };
    // axes with unit ticks
    line(c, pad / 2, Y(0), w - pad / 2, Y(0), 'rgba(180,195,225,.2)', 1); line(c, X(0), pad / 2, X(0), h - pad / 2, 'rgba(180,195,225,.2)', 1);
    txt(c, 'x₁', w - 10, Y(0) - 6, 'rgba(200,210,235,.7)', 12, 'right', 800);
    txt(c, SC.z ? 'z₂' : `x₂ × ${num(SC.f, SC.f < 1 ? 2 : 1)}`, X(0) + 6, 16, 'rgba(200,210,235,.7)', 12, 'left', 800);
    const nn = scNN(T, SC.q), nnStd = scNN((() => { const st = U.cov2(SC.X), s1 = Math.sqrt(st.S[0]), s2 = Math.sqrt(st.S[2]); return SC.X.map((p) => [p[0] / s1, p[1] / s2]); })(), SC.q);
    nn.forEach((i) => line(c, X(T[SC.q][0]), Y(T[SC.q][1]), X(T[i][0]), Y(T[i][1]), YEL, 2));
    T.forEach((p, i) => dot(c, X(p[0]), Y(p[1]), i === SC.q ? 8 : 4.5, i === SC.q ? YEL : nn.includes(i) ? TEAL : nnStd.includes(i) ? 'rgba(166,139,255,.95)' : 'rgba(214,222,239,.8)'));
    txt(c, t('scLegend'), 12, h - 10, '#8d9db9', 10.5, 'left', 600);
    const same = nn.filter((i) => nnStd.includes(i)).length;
    const st = U.cov2(T), share = st.S[2] / (st.S[0] + st.S[2]);
    readouts($('scRo'), [['nnSame', `${same} / 3`, same === 3 ? 'ok' : 'warn'], ['x2Share', pct(share), share > 0.85 || share < 0.15 ? 'warn' : 'ok']]);
  });
  $('scBoard').addEventListener('click', (e) => {
    if (!scMap) return;
    const r = $('scBoard').getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = -1, bd = 20;
    scMap.T.forEach((p, i) => { const d = Math.hypot(scMap.X(p[0]) - x, scMap.Y(p[1]) - y); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { SC.q = best; scV.dirty = true; }
  });
  slider('scF', (v) => `× ${num(Math.pow(10, v), Math.pow(10, v) < 1 ? 2 : 1)}`, (v) => { SC.f = Math.pow(10, v); scV.dirty = true; });
  $('scZ').addEventListener('change', (e) => { SC.z = e.target.checked; scV.dirty = true; });

  /* ======================================== 1.5 CURSE OF DIMENSIONALITY */
  const CU = { d: 2, dists: [], curve: null };
  const CU_DS = [1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000];
  function cuPairs(d, n, seed) {
    const r = U.rng(seed + d * 13), P = Array.from({ length: n }, () => Float64Array.from({ length: d }, () => r()));
    const out = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { let s = 0; const a = P[i], b = P[j]; for (let k = 0; k < d; k++) { const q = a[k] - b[k]; s += q * q; } out.push(Math.sqrt(s)); }
    return out;
  }
  function cuCompute() {
    CU.dists = cuPairs(CU.d, 160, 5);
    if (!CU.curve) CU.curve = CU_DS.map((d) => { const v = cuPairs(d, 90, 9); const mn = Math.min(...v), mx = Math.max(...v); return (mx - mn) / mn; });
    cuHistV.dirty = cuRatioV.dirty = true;
    const v = CU.dists, mn = Math.min(...v), mx = Math.max(...v), mean = v.reduce((a, b) => a + b, 0) / v.length;
    const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length);
    readouts($('cuRo'), [['dimension', String(CU.d)], ['meanDist', num(mean, 3)], ['cv', num(sd / mean, 3)], ['contrast', num((mx - mn) / mn, 2), (mx - mn) / mn < 0.5 ? 'warn' : ''], ['sqrtD6', num(Math.sqrt(CU.d / 6), 3)]]);
  }
  const cuHistV = view($('cuHist'), () => {
    const v = CU.dists, mx = Math.max(...v, 1e-9), bins = new Array(40).fill(0);
    v.forEach((d) => { bins[Math.min(39, Math.floor((d / mx) * 40))]++; });
    plot($('cuHist'), { xMin: 0, xMax: 1, yMin: 0, yFmt: (q) => String(Math.round(q)), xFmt: (q) => num(q, 1), series: [{ type: 'bar', data: bins, xs: bins.map((_, i) => (i + 0.5) / 40), color: 'rgba(70,228,176,.75)', fill: 0.9 }], xLabel: 'd / d_max' });
  });
  const cuRatioV = view($('cuRatio'), () => {
    if (!CU.curve) return;
    const lx = CU_DS.map((d) => Math.log10(d));
    plot($('cuRatio'), {
      xMin: 0, xMax: 3, xTicks: [0, 1, 2, 3], xFmt: (q) => String(Math.round(Math.pow(10, q))), mark: Math.log10(CU.d),
      yFmt: (q) => { const v = Math.pow(10, q); return v >= 10 ? String(Math.round(v)) : v >= 1 ? v.toFixed(1) : v.toFixed(2); },
      series: [{ data: CU.curve.map((v) => Math.log10(v)), xs: lx, color: YEL, width: 2.4, dots: true, noDot: true, label: '(max − min) / min  (log)' }], xLabel: 'd (log)',
    });
  });
  slider('cuD', (v) => String(Math.round(Math.pow(10, v))), (v) => { CU.d = Math.max(1, Math.round(Math.pow(10, v))); later('cu', cuCompute); });
  CU.d = Math.round(Math.pow(10, +$('cuD').value));

  /* ===================================================== 2.1 K-MEANS */
  const KM = { k: 3, init: 'kmeans++', metric: 'euclid', C: [], L: [], phase: 'update', iter: 0, trails: [], hist: [], run: false, last: 0, done: false, seed: 1 };
  KM.k = DKm.k;
  function kmInit() {
    const X = DKm.X;
    if (!X.length) { KM.C = []; KM.L = []; KM.hist = []; kmShow(); return; }
    const k = Math.min(KM.k, X.length);
    KM.C = U.initCenters(X, k, KM.init, U.rng(KM.seed++), KM.metric);
    KM.L = U.assign(X, KM.C, KM.metric);
    KM.trails = KM.C.map((c) => [c.slice()]);
    KM.hist = [U.inertia(X, KM.L, KM.C, KM.metric)];
    KM.phase = 'update'; KM.iter = 0; KM.done = false;
    kmShow();
  }
  function kmStep() {
    const X = DKm.X;
    if (!X.length || KM.done) return;
    if (KM.phase === 'update') {
      const C2 = U.update(X, KM.L, KM.C, KM.metric);
      const moved = C2.some((c, j) => Math.hypot(c[0] - KM.C[j][0], c[1] - KM.C[j][1]) > 1e-7);
      KM.C = C2; KM.C.forEach((c, j) => KM.trails[j].push(c.slice()));
      KM.phase = 'assign';
      if (!moved) KM.done = true;
    } else {
      const L2 = U.assign(X, KM.C, KM.metric), changed = L2.some((l, i) => l !== KM.L[i]);
      KM.L = L2; KM.phase = 'update'; KM.iter++;
      if (!changed) KM.done = true;
    }
    KM.hist.push(U.inertia(X, KM.L, KM.C, KM.metric));
    kmShow();
  }
  const kmB = board($('kmBoard'), {
    data: DKm, insp: $('kmInsp'), cell: 3,
    field(x, y) {
      if (!KM.C.length) return null;
      const L = U.assign([[x, y]], KM.C, KM.metric)[0];
      return [PAL_RGB[L % PAL.length], 0.17];
    },
    color: (i) => (KM.L[i] != null ? pal(KM.L[i]) : '#d6deef'),
    drag: {
      hit: (x, y, g) => { let best = null, bd = 16 / g.s; KM.C.forEach((c, j) => { const d = Math.hypot(c[0] - x, c[1] - y); if (d < bd) { bd = d; best = j; } }); return best; },
      move: (j, x, y) => {
        KM.C[j] = [x, y]; KM.trails[j] = [[x, y]];
        KM.L = U.assign(DKm.X, KM.C, KM.metric); KM.phase = 'update'; KM.done = false;
        KM.hist.push(U.inertia(DKm.X, KM.L, KM.C, KM.metric));
        kmShow();
      },
    },
    over(c, g) {
      KM.trails.forEach((tr, j) => {
        if (tr.length < 2) return;
        c.beginPath(); tr.forEach((p, k) => (k ? c.lineTo(g.X(p[0]), g.Y(p[1])) : c.moveTo(g.X(p[0]), g.Y(p[1])))); stroke(c, pal(j), 2, 0, [3, 3]);
        tr.slice(0, -1).forEach((p) => dot(c, g.X(p[0]), g.Y(p[1]), 2.5, pal(j), null));
      });
      KM.C.forEach((cc, j) => {
        const x = g.X(cc[0]), y = g.Y(cc[1]);
        dot(c, x, y, 11, 'rgba(6,10,20,.85)', pal(j));
        cross(c, x, y, 5.5, '#fff', 3.2); cross(c, x, y, 5, pal(j), 2);
      });
    },
    inspect(x, y) {
      if (!KM.C.length) return '';
      const dist = U.METRICS[KM.metric];
      return KM.C.map((cc, j) => `<b style="color:${pal(j)}">μ${j + 1}</b> ${num(dist([x, y], cc), 3)}`).join(' · ');
    },
  });
  const kmRunLabel = playLabel($('kmRun'), () => KM.run, 'pauseBtn');
  function kmShow() {
    kmB.refield();
    const X = DKm.X, L = KM.L;
    const sil = X.length && X.length <= 400 && KM.C.length > 1 ? U.silhouette(X, L, KM.metric).mean : NaN;
    readouts($('kmRo'), [
      ['iteration', String(KM.iter)], ['nextStep', KM.done ? '✓ ' + t('converged') : t(KM.phase === 'update' ? 'phaseUpdate' : 'phaseAssign'), KM.done ? 'ok' : ''],
      ['inertiaLbl', num(KM.hist[KM.hist.length - 1], 3)], ['silhouette', num(sil, 3)],
      ['ariLbl', num(ariTruth(L, DKm), 3), 'ok'], ['trueK', String(DKm.k)],
    ]);
    kmCurveV.dirty = true;
    if (KM.done && KM.run) { KM.run = false; kmRunLabel(); }
  }
  const kmCurveV = view($('kmCurve'), () => {
    if (!KM.hist.length) { prep($('kmCurve')); return; }
    plot($('kmCurve'), { xMin: 0, xMax: Math.max(4, KM.hist.length - 1), yMin: 0, L: 40, T: 26, series: [{ data: KM.hist, color: YEL, width: 2, dots: true }] });
  });
  const kmK = slider('kmK', (v) => String(v), (v) => { KM.k = v; kmInit(); });
  kmK.set(KM.k);
  seg('kmInit', KM.init, (v) => { KM.init = v; kmInit(); });
  seg('kmMetric', KM.metric, (v) => { KM.metric = v; kmInit(); later('k', kCompute); });
  $('kmInitBtn').addEventListener('click', kmInit);
  $('kmStep').addEventListener('click', () => { KM.run = false; kmRunLabel(); kmStep(); });
  $('kmRun').addEventListener('click', () => { if (KM.done) kmInit(); KM.run = !KM.run; kmRunLabel(); });
  tickers.push((ts) => { if (KM.run && ts - KM.last > 420) { KM.last = ts; kmStep(); } });
  DKm.on((k) => { if (k === 'view') return; if (k === 'regen') { KM.k = DKm.k; kmK.set(KM.k); } kmInit(); later('k', kCompute); });
  refreshers.push(kmShow, kmRunLabel);

  /* ------------------------------------------------ 2.2 choosing k */
  const KC = { res: [], sel: 3, maps: {} };
  function kCompute() {
    const X = DKm.X;
    KC.res = [];
    if (X.length < 3) { kViews(); return; }
    for (let k = 1; k <= 10; k++) {
      if (k > X.length) break;
      const r = U.kmeans(X, k, { restarts: 4, metric: KM.metric, seed: 11 });
      KC.res.push({ k, r, J: r.inertia, sil: k > 1 && X.length <= 400 ? U.silhouette(X, r.labels, KM.metric) : { s: [], mean: NaN } });
    }
    KC.sel = clamp(KM.k, 1, KC.res.length);
    kViews();
  }
  function kViews() {
    kElbowV.dirty = kSilV.dirty = kPlotV.dirty = true;
    if (!KC.res.length) { $('kRo').innerHTML = ''; return; }
    const J = KC.res.map((r) => r.J);
    let elbow = J.length;
    for (let i = 1; i < J.length - 1; i++) { if (J[i + 1] / Math.max(J[i], 1e-12) > 0.75) { elbow = i + 1; break; } }
    let sk = 2, sb = -Infinity;
    KC.res.forEach((r) => { if (r.k > 1 && r.sil.mean > sb) { sb = r.sil.mean; sk = r.k; } });
    readouts($('kRo'), [['elbowK', String(elbow)], ['silBestK', String(sk), 'ok'], ['trueK', String(DKm.k)], ['selK', String(KC.sel)], ['silSel', num(KC.res[KC.sel - 1] ? KC.res[KC.sel - 1].sil.mean : NaN, 3)]]);
    $('kPlotLbl').textContent = `${t('silPlot')} · k = ${KC.sel}`;
  }
  const kPick = (k) => { if (k >= 1 && k <= KC.res.length) { KC.sel = k; KM.k = k; kmK.set(k); kmInit(); kViews(); } };
  const kElbowV = view($('kElbow'), () => {
    if (!KC.res.length) { prep($('kElbow')); return; }
    KC.maps.e = plot($('kElbow'), { xMin: 1, xMax: KC.res.length, yMin: 0, mark: KC.sel, series: [{ data: KC.res.map((r) => r.J), x0: 1, color: YEL, width: 2.4, dots: true }], xLabel: 'k' });
  });
  const kSilV = view($('kSil'), () => {
    if (!KC.res.length) { prep($('kSil')); return; }
    KC.maps.s = plot($('kSil'), { xMin: 1, xMax: KC.res.length, yMin: 0, yMax: 1, mark: KC.sel, series: [{ data: KC.res.map((r) => r.sil.mean), x0: 1, color: TEAL, width: 2.4, dots: true }], xLabel: 'k' });
  });
  const kPlotV = view($('kSilPlot'), () => {
    const { c, w, h } = prep($('kSilPlot'));
    const R = KC.res[KC.sel - 1];
    if (!R || KC.sel < 2 || !R.sil.s.length) { txt(c, t('silNeedK'), w / 2, h / 2, '#7385a6', 11.5, 'center'); return; }
    const L = 30, Rm = 14, T = 30, Bt = 26, pw = w - L - Rm, ph = h - T - Bt;
    const X0 = (v) => L + ((v + 0.2) / 1.2) * pw;
    const items = R.r.labels.map((l, i) => [l, R.sil.s[i]]).filter((q) => isFinite(q[1])).sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const bh = ph / Math.max(1, items.length + R.r.centers.length * 2);
    let y = T, prev = -1;
    items.forEach(([l, v]) => {
      if (l !== prev) { y += bh * 2; prev = l; }
      c.fillStyle = pal(l); c.fillRect(Math.min(X0(0), X0(v)), y, Math.abs(X0(v) - X0(0)), Math.max(1, bh));
      y += bh;
    });
    line(c, X0(0), T, X0(0), T + ph, 'rgba(255,255,255,.4)', 1);
    line(c, X0(R.sil.mean), T, X0(R.sil.mean), T + ph, YEL, 1.6, [5, 4]);
    txt(c, `${t('meanLbl')} ${num(R.sil.mean, 2)}`, X0(R.sil.mean) + 4, T - 6, YEL, 10.5, 'left', 700);
    [-0.2, 0, 0.5, 1].forEach((v) => txt(c, String(v), X0(v), h - 8, '#7385a6', 9.5, 'center'));
  });
  ['kElbow', 'kSil'].forEach((id) => $(id).addEventListener('click', (e) => { const m = KC.maps[id === 'kElbow' ? 'e' : 's']; if (m) kPick(Math.round(chartX(m, e, $(id)))); }));
  refreshers.push(kViews);

  /* =================================================== 3.1 HIERARCHICAL */
  const HC = { link: 'ward', metric: 'euclid', k: 3, m: 0, tree: null, labels: [], play: false, last: 0, hoverLeaf: -1, dmap: null };
  function hcFit() {
    const X = DH.X;
    HC.tree = X.length >= 2 ? U.agglomerative(X, HC.link, HC.metric) : null;
    $('hcK').max = Math.max(1, Math.min(12, X.length));
    HC.k = clamp(HC.k, 1, Math.max(1, X.length));
    HC.m = HC.tree ? U.mergesForK(HC.tree, HC.k) : 0;
    hcShow();
  }
  function hcShow() {
    const X = DH.X;
    HC.labels = HC.tree ? U.cutMerges(HC.tree, HC.m) : X.map(() => 0);
    const nc = new Set(HC.labels).size;
    // colour only the multi-point clusters when there are many singletons
    const sizes = {};
    HC.labels.forEach((l) => { sizes[l] = (sizes[l] || 0) + 1; });
    const order = Object.keys(sizes).sort((a, b) => sizes[b] - sizes[a]), rank = {};
    order.forEach((l, i) => { rank[l] = sizes[l] > 1 || nc <= 12 ? i : -1; });
    HC.col = HC.labels.map((l) => rank[l]);
    if (DH.y.some((v) => v >= 0) && nc <= 12) HC.col = alignLabels(HC.col, DH.y);
    const h = HC.tree && HC.m > 0 ? HC.tree.merges[HC.m - 1].h : 0;
    readouts($('hcRo'), [
      ['clusters', String(nc)], ['mergesDone', `${HC.m} / ${Math.max(0, X.length - 1)}`], ['cutH', num(h, 3)],
      ['ariLbl', num(ariTruth(HC.labels, DH), 3), 'ok'], ['silhouette', num(nc > 1 && nc < X.length ? U.silhouette(X, HC.labels, HC.link === 'ward' ? 'euclid' : HC.metric).mean : NaN, 3)],
    ]);
    document.querySelectorAll('#hcMetric button').forEach((b) => { b.disabled = HC.link === 'ward'; b.style.opacity = HC.link === 'ward' ? 0.4 : 1; });
    hcB.redraw(); dendV.dirty = true;
  }
  const hcB = board($('hcBoard'), {
    data: DH, pointR: 5,
    color: (i) => pal(HC.col ? HC.col[i] : -1),
    under(c, g) { if (HC.col) drawHulls(c, g, DH.X, HC.col, 3); },
    onHover(x, y) {
      HC.hoverLeaf = -1;
      if (x != null) { let bd = 0.05; DH.X.forEach((p, i) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; HC.hoverLeaf = i; } }); }
      dendV.dirty = true;
    },
  });
  const dendV = view($('hcDendro'), () => {
    const { c, w, h } = prep($('hcDendro'));
    const T = HC.tree;
    if (!T || !T.merges.length) { txt(c, t('needPoints'), w / 2, h / 2, '#7385a6', 12, 'center'); HC.dmap = null; return; }
    const n = T.n, order = U.leafOrder(T), pos = {};
    order.forEach((leaf, i) => { pos[leaf] = i; });
    const L = 48, R = 16, Tp = 30, Bm = 18, pw = w - L - R, ph = h - Tp - Bm, hmax = T.merges[T.merges.length - 1].h * 1.04 || 1;
    const X = (p) => L + ((p + 0.5) / n) * pw, Y = (v) => Tp + ph - (v / hmax) * ph;
    HC.dmap = { Y, hmax, Tp, ph };
    for (let i = 0; i <= 4; i++) { const v = (hmax * i) / 4; line(c, L, Y(v), L + pw, Y(v), 'rgba(112,137,184,.1)', 1); txt(c, num(v, 2), L - 6, Y(v) + 3, '#7385a6', 9.5, 'right'); }
    const xpos = {}, hgt = {};
    for (let i = 0; i < n; i++) { xpos[i] = X(pos[i]); hgt[i] = 0; }
    const leafCol = HC.col || [];
    const clOf = {};
    for (let i = 0; i < n; i++) clOf[i] = leafCol[i];
    T.merges.forEach((g, k) => {
      const xa = xpos[g.a], xb = xpos[g.b], below = k < HC.m;
      const col = below && clOf[g.a] === clOf[g.b] && clOf[g.a] >= 0 ? pal(clOf[g.a]) : below ? '#8d9db9' : '#3b4c70';
      c.beginPath(); c.moveTo(xa, Y(hgt[g.a])); c.lineTo(xa, Y(g.h)); c.lineTo(xb, Y(g.h)); c.lineTo(xb, Y(hgt[g.b]));
      stroke(c, col, below ? 1.8 : 1.2);
      xpos[g.id] = (xa + xb) / 2; hgt[g.id] = g.h; clOf[g.id] = clOf[g.a] === clOf[g.b] ? clOf[g.a] : -2;
    });
    if (n <= 120) for (let i = 0; i < n; i++) dot(c, X(pos[i]), Y(0) + 5, 2.6, pal(leafCol[i] != null ? leafCol[i] : -1), null);
    if (HC.hoverLeaf >= 0) { const x = X(pos[HC.hoverLeaf]); line(c, x, Tp, x, Tp + ph + 8, '#fff', 1.2, [3, 3]); dot(c, x, Y(0) + 5, 5, '#fff', null); }
    const cutH = HC.m <= 0 ? T.merges[0].h * 0.5 : HC.m >= T.merges.length ? hmax : (T.merges[HC.m - 1].h + T.merges[HC.m].h) / 2;
    line(c, L, Y(cutH), L + pw, Y(cutH), YEL, 2.4, [8, 5]);
    txt(c, `${t('cutLbl')} · k = ${n - HC.m}`, L + pw - 4, Y(cutH) - 6, YEL, 11, 'right', 800);
  });
  (() => {
    const cv = $('hcDendro');
    let drag = false;
    const setFromY = (e) => {
      if (!HC.dmap || !HC.tree) return;
      const r = cv.getBoundingClientRect(), v = ((HC.dmap.Tp + HC.dmap.ph - (e.clientY - r.top)) / HC.dmap.ph) * HC.dmap.hmax;
      HC.m = U.mergesBelow(HC.tree, v); HC.k = HC.tree.n - HC.m;
      $('hcK').value = Math.min(HC.k, +$('hcK').max); $('hcKOut').textContent = HC.k;
      HC.play = false; hcPlayLabel(); hcShow();
    };
    cv.addEventListener('pointerdown', (e) => { drag = true; try { cv.setPointerCapture(e.pointerId); } catch (err) { /* */ } setFromY(e); });
    cv.addEventListener('pointermove', (e) => { if (drag) setFromY(e); });
    ['pointerup', 'pointercancel'].forEach((ev) => cv.addEventListener(ev, () => { drag = false; }));
  })();
  seg('hcLink', HC.link, (v) => { HC.link = v; later('hc', hcFit); });
  seg('hcMetric', HC.metric, (v) => { HC.metric = v; later('hc', hcFit); });
  slider('hcK', (v) => String(v), (v) => { HC.k = v; if (HC.tree) HC.m = U.mergesForK(HC.tree, v); HC.play = false; hcPlayLabel(); hcShow(); });
  const hcPlayLabel = playLabel($('hcPlay'), () => HC.play);
  $('hcPlay').addEventListener('click', () => { HC.play = !HC.play; if (HC.play) HC.m = 0; hcPlayLabel(); hcShow(); });
  tickers.push((ts) => {
    if (!HC.play || !HC.tree || ts - HC.last < 110) return;
    HC.last = ts;
    const target = U.mergesForK(HC.tree, HC.k);
    if (HC.m >= target) { HC.play = false; hcPlayLabel(); return; }
    HC.m++; hcShow();
  });
  DH.on((k) => { if (k === 'view') { hcB.redraw(); return; } if (k === 'regen') { HC.k = DH.k; $('hcK').value = HC.k; $('hcKOut').textContent = HC.k; } later('hc', hcFit); });
  refreshers.push(hcShow, hcPlayLabel);

  /* ======================================================= 4.1 DBSCAN */
  const DBP = { eps: 0.13, minPts: 5, metric: 'euclid', res: null, shown: Infinity, play: false, last: 0, kd: [], map: null, col: [] };
  function dbFit() {
    DBP.res = U.dbscan(DD.X, DBP.eps, DBP.minPts, DBP.metric);
    DBP.col = DD.y.some((v) => v >= 0) ? alignLabels(DBP.res.labels, DD.y) : DBP.res.labels;
    if (!DBP.play) DBP.shown = Infinity;
    dbShow();
  }
  function dbK() { DBP.kd = DD.X.length > DBP.minPts ? U.kDistance(DD.X, DBP.minPts - 1, DBP.metric) : []; dbKV.dirty = true; }
  function dbShow() {
    const r = DBP.res;
    if (!r) return;
    readouts($('dbRo'), [
      ['clusters', String(r.nClusters)], ['noisePts', `${r.nNoise} (${pct(r.nNoise / Math.max(1, DD.X.length))})`, r.nNoise / Math.max(1, DD.X.length) > 0.3 ? 'warn' : ''],
      ['corePts', String(r.core.filter(Boolean).length)], ['ariLbl', num(ariTruth(r.labels, DD), 3), 'ok'],
    ]);
    dbB.redraw(); dbKV.dirty = true;
  }
  const dbB = board($('dbBoard'), {
    data: DD, insp: $('dbInsp'),
    drawPoint(c, i, x, y) {
      const r = DBP.res;
      if (!r) { dot(c, x, y, 4, '#d6deef'); return; }
      if (DD.truth) { dot(c, x, y, 4, pal(DD.y[i])); return; }
      const rank = r.order.indexOf(i), revealed = DBP.shown === Infinity || (rank >= 0 && rank < DBP.shown);
      if (r.labels[i] < 0) { cross(c, x, y, 3.5, 'rgba(150,165,195,.85)', 1.8); return; }
      if (!revealed) { dot(c, x, y, 3, 'rgba(120,135,165,.45)', null); return; }
      if (r.core[i]) dot(c, x, y, 5, pal(DBP.col[i]));
      else { dot(c, x, y, 3.2, pal(DBP.col[i]), null); ring(c, x, y, 5.2, '#fff', 1.2); }
    },
    over(c, g) {
      if (!DBP.hover) return;
      const [x, y] = DBP.hover;
      metricBall(c, g, x, y, DBP.eps, DBP.metric);
      c.fillStyle = 'rgba(255,203,87,.08)'; c.fill(); stroke(c, YEL, 1.8, 0, [5, 4]);
    },
    onHover(x, y) { DBP.hover = x == null ? null : [x, y]; },
    inspect(x, y) {
      const dist = U.METRICS[DBP.metric], cnt = DD.X.filter((p) => dist(p, [x, y]) <= DBP.eps).length;
      const kind = cnt >= DBP.minPts ? `<b style="color:var(--teal)">${t('wouldCore')}</b>` : t('notCore');
      return `ε-${t('neighbours')}: <b>${cnt}</b> (minPts = ${DBP.minPts}) → ${kind}`;
    },
  });
  const dbKV = view($('dbK'), () => {
    if (!DBP.kd.length) { prep($('dbK')); DBP.map = null; return; }
    DBP.map = plot($('dbK'), {
      xMin: 0, xMax: DBP.kd.length - 1, yMin: 0, yMax: Math.max(DBP.eps * 1.2, DBP.kd[DBP.kd.length - 1] * 1.05), L: 38, T: 26,
      series: [{ data: DBP.kd, color: TEAL, width: 2 }], hlines: [{ v: DBP.eps, color: YEL, label: 'ε' }], xFmt: (v) => String(Math.round(v)),
    });
  });
  $('dbK').addEventListener('click', (e) => { if (!DBP.map) return; const v = clamp(chartY(DBP.map, e, $('dbK')), 0.02, 0.5); DBP.eps = v; dbE.set(v); later('db', dbFit); });
  const dbE = slider('dbE', (v) => num(v, 3), (v) => { DBP.eps = v; later('db', dbFit); });
  slider('dbM', (v) => String(v), (v) => { DBP.minPts = v; later('db', () => { dbFit(); dbK(); }); });
  seg('dbMetric', DBP.metric, (v) => { DBP.metric = v; later('db', () => { dbFit(); dbK(); }); });
  const dbPlayLabel = playLabel($('dbPlay'), () => DBP.play);
  $('dbPlay').addEventListener('click', () => { DBP.play = !DBP.play; if (DBP.play) DBP.shown = 0; else DBP.shown = Infinity; dbPlayLabel(); dbB.redraw(); });
  tickers.push((ts) => {
    if (!DBP.play || ts - DBP.last < 40 || !DBP.res) return;
    DBP.last = ts;
    DBP.shown += Math.max(1, Math.round(DD.X.length / 120));
    if (DBP.shown >= DBP.res.order.length) { DBP.play = false; DBP.shown = Infinity; dbPlayLabel(); }
    dbB.redraw();
  });
  DD.on((k) => { if (k === 'view') { dbB.redraw(); return; } later('db', () => { dbFit(); dbK(); }); });
  refreshers.push(dbShow, dbPlayLabel);

  /* ========================================================== 5.1 GMM */
  const GP = { k: 3, cov: 'full', g: null, run: false, last: 0, seed: 1, next: 'M' };
  function gmInit() {
    GP.g = U.makeGMM(DGm.X, Math.min(GP.k, Math.max(1, DGm.X.length)), { cov: GP.cov, seed: GP.seed++ });
    GP.next = 'M';
    gmShow();
  }
  function gmStep(which) {
    const g = GP.g;
    if (!g || !DGm.X.length) return;
    const w = which || GP.next;
    if (w === 'M') { g.mstep(); GP.next = 'E'; } else { g.estep(); GP.next = 'M'; }
    gmShow();
  }
  const gmMix = (row) => { let r = 0, gg = 0, b = 0; row.forEach((q, j) => { const c = PAL_RGB[j % PAL.length]; r += q * c[0]; gg += q * c[1]; b += q * c[2]; }); return [r, gg, b]; };
  const gmB = board($('gmBoard'), {
    data: DGm, insp: $('gmInsp'), cell: 5, crisp: false,
    field(x, y) {
      const g = GP.g;
      if (!g || !DGm.X.length) return null;
      const { v, lse } = g.logpdf([x, y]), R = v.map((q) => Math.exp(q - lse));
      const dens = Math.exp(lse);
      return [gmMix(R), clamp(0.05 + 0.06 * Math.log1p(dens), 0.04, 0.42)];
    },
    color: (i) => (GP.g && GP.g.R[i] ? rgba(gmMix(GP.g.R[i]), 1) : '#d6deef'),
    over(c, g) {
      const G = GP.g;
      if (!G) return;
      G.mu.forEach((mu, j) => {
        ellipse(c, g, mu, G.S[j], 1, pal(j), 2.2); ellipse(c, g, mu, G.S[j], 2, pal(j), 1.5, [5, 4]);
        cross(c, g.X(mu[0]), g.Y(mu[1]), 6, '#fff', 3); cross(c, g.X(mu[0]), g.Y(mu[1]), 5.5, pal(j), 1.8);
        txt(c, `π=${num(G.w[j], 2)}`, g.X(mu[0]) + 9, g.Y(mu[1]) - 8, '#fff', 11, 'left', 800);
      });
    },
    inspect(x, y) {
      const G = GP.g;
      if (!G) return '';
      const { v, lse } = G.logpdf([x, y]);
      return `${t('respLbl')}: ` + v.map((q, j) => `<b style="color:${pal(j)}">${num(Math.exp(q - lse), 2)}</b>`).join(' · ') + ` · log p(x) = ${num(lse, 2)}`;
    },
  });
  function gmShow() {
    const G = GP.g, n = DGm.X.length;
    gmB.refield();
    if (!G) return;
    const LL = G.ll.length ? G.ll[G.ll.length - 1] * n : NaN;
    const covP = { full: 3 * G.k, diag: 2 * G.k, spherical: G.k, tied: 3 }[GP.cov], p = G.k - 1 + 2 * G.k + covP;
    readouts($('gmRo'), [
      ['iteration', String(G.iter)], ['nextStep', GP.next === 'M' ? 'M-step' : 'E-step'], ['avgLL', num(G.ll[G.ll.length - 1], 3)],
      ['bic', num(-2 * LL + p * Math.log(Math.max(2, n)), 1)], ['ariLbl', num(ariTruth(G.labels(), DGm), 3), 'ok'], ['nParams', String(p)],
    ]);
    gmCurveV.dirty = true;
  }
  const gmCurveV = view($('gmCurve'), () => {
    if (!GP.g || !GP.g.ll.length) { prep($('gmCurve')); return; }
    plot($('gmCurve'), { xMin: 0, xMax: Math.max(4, GP.g.ll.length - 1), L: 40, T: 26, series: [{ data: GP.g.ll, color: YEL, width: 2, dots: GP.g.ll.length < 40 }] });
  });
  const gmK = slider('gmK', (v) => String(v), (v) => { GP.k = v; gmInit(); });
  seg('gmCov', GP.cov, (v) => { GP.cov = v; gmInit(); });
  $('gmInit').addEventListener('click', gmInit);
  $('gmE').addEventListener('click', () => { GP.run = false; gmRunLabel(); gmStep('E'); });
  $('gmM').addEventListener('click', () => { GP.run = false; gmRunLabel(); gmStep('M'); });
  const gmRunLabel = playLabel($('gmRun'), () => GP.run, 'pauseBtn');
  $('gmRun').addEventListener('click', () => { GP.run = !GP.run; gmRunLabel(); });
  tickers.push((ts) => {
    if (!GP.run || ts - GP.last < 160 || !GP.g) return;
    GP.last = ts;
    gmStep();
    const L = GP.g.ll;
    if (GP.next === 'M' && L.length > 3 && Math.abs(L[L.length - 1] - L[L.length - 2]) < 1e-5) { GP.run = false; gmRunLabel(); }
    if (GP.g.iter > 300) { GP.run = false; gmRunLabel(); }
  });
  DGm.on((k) => { if (k === 'view') { gmB.redraw(); return; } if (k === 'regen') { GP.k = DGm.k; gmK.set(GP.k); } later('gm', gmInit); });
  refreshers.push(gmShow, gmRunLabel);

  /* ========================================================= 6.1 PCA */
  const PC = { th: 90, p: 0, res: null, map: null };
  function pcaFit() {
    PC.res = DP.X.length >= 2 ? U.cov2(DP.X) : null;
    if (PC.res) PC.eig = U.eig2(PC.res.S);
    pcaShow();
  }
  const dirOf = (deg) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
  const varAlong = (deg) => { if (!PC.res) return 0; const [a, b, c] = PC.res.S, [u, v] = dirOf(deg); return a * u * u + 2 * b * u * v + c * v * v; };
  const pc1Deg = () => { if (!PC.eig) return 0; let d = (Math.atan2(PC.eig.vecs[0][1], PC.eig.vecs[0][0]) * 180) / Math.PI; while (d < 0) d += 180; while (d >= 180) d -= 180; return d; };
  function pcaShow() {
    pcaB.redraw(); pcaCurveV.dirty = true;
    if (!PC.res) { $('pcaRo').innerHTML = ''; return; }
    const tot = PC.res.S[0] + PC.res.S[2], va = varAlong(PC.th);
    let ang = Math.abs(PC.th - pc1Deg()); ang = Math.min(ang, 180 - ang);
    readouts($('pcaRo'), [
      ['pc1Ev', pct(PC.eig.vals[0] / tot), 'ok'], ['pc2Ev', pct(PC.eig.vals[1] / tot)], ['varTheta', pct(va / tot), ang < 1 ? 'ok' : ''],
      ['reconErr', num(tot - va, 4)], ['angleToPc1', num(ang, 1) + '°'],
    ]);
  }
  const pcaB = board($('pcaBoard'), {
    data: DP, points: false,
    over(c, g) {
      if (!PC.res) return;
      const mu = PC.res.mu, d = dirOf(PC.th), tP = PC.p;
      DP.X.forEach((p) => {
        const s = (p[0] - mu[0]) * d[0] + (p[1] - mu[1]) * d[1], q = [mu[0] + s * d[0], mu[1] + s * d[1]];
        line(c, g.X(p[0]), g.Y(p[1]), g.X(q[0]), g.Y(q[1]), 'rgba(255,93,158,.35)', 1, [2, 3]);
      });
      line(c, g.X(mu[0] - 3 * d[0]), g.Y(mu[1] - 3 * d[1]), g.X(mu[0] + 3 * d[0]), g.Y(mu[1] + 3 * d[1]), YEL, 2.2);
      DP.X.forEach((p) => {
        const s = (p[0] - mu[0]) * d[0] + (p[1] - mu[1]) * d[1], q = [mu[0] + s * d[0], mu[1] + s * d[1]];
        const x = p[0] + (q[0] - p[0]) * tP, y = p[1] + (q[1] - p[1]) * tP;
        dot(c, g.X(x), g.Y(y), 4, mixRGB([214, 222, 239], [255, 203, 87], tP).map(Math.round).reduce((s2, v, i) => s2 + (i ? ',' : '') + v, 'rgb(') + ')');
      });
      [[0, TEAL, 'PC1'], [1, VIO, 'PC2']].forEach(([k, col, lb]) => {
        const v = PC.eig.vecs[k], L = 2 * Math.sqrt(Math.max(PC.eig.vals[k], 0));
        arrow(c, g.X(mu[0]), g.Y(mu[1]), g.X(mu[0] + v[0] * L), g.Y(mu[1] + v[1] * L), col, 3);
        txt(c, lb, g.X(mu[0] + v[0] * L * 1.12), g.Y(mu[1] + v[1] * L * 1.12) + 4, col, 12, 'center', 800);
      });
      cross(c, g.X(mu[0]), g.Y(mu[1]), 6, '#fff', 2.4);
    },
  });
  const pcaCurveV = view($('pcaCurve'), () => {
    if (!PC.res) { prep($('pcaCurve')); return; }
    const xs = Array.from({ length: 181 }, (_, i) => i), tot = PC.res.S[0] + PC.res.S[2];
    PC.map = plot($('pcaCurve'), {
      xMin: 0, xMax: 180, yMin: 0, yMax: 1, L: 38, T: 26, yFmt: (v) => Math.round(v * 100) + '%', xTicks: [0, 45, 90, 135, 180], xFmt: (v) => v + '°', mark: Math.round(PC.th),
      series: [{ data: xs.map((d) => varAlong(d) / tot), xs, color: TEAL, width: 2 }], vlines: [{ v: pc1Deg(), color: TEAL, label: 'PC1' }],
    });
  });
  $('pcaCurve').addEventListener('click', (e) => { if (!PC.map) return; PC.th = clamp(Math.round(chartX(PC.map, e, $('pcaCurve')) * 2) / 2, 0, 180); pcaTh.set(PC.th); pcaShow(); });
  const pcaTh = slider('pcaTh', (v) => v + '°', (v) => { PC.th = v; pcaShow(); });
  slider('pcaP', (v) => Math.round(v * 100) + '%', (v) => { PC.p = v; pcaB.redraw(); });
  $('pcaSnap').addEventListener('click', () => { PC.th = Math.round(pc1Deg() * 2) / 2; pcaTh.set(PC.th); pcaShow(); });
  DP.on((k) => { if (k !== 'view') later('pca', pcaFit); });
  refreshers.push(pcaShow);

  /* ========================================================= 6.2 t-SNE */
  const TS = { ds: 'swiss', perp: 30, run: true, data: null, pca: null, ts: null, yaw: 0.35, pitch: 0.3, drag: null, maxIter: 1000 };
  function tsLoad() {
    TS.data = U.make3D(TS.ds, 400, 3);
    TS.pca = U.pca(TS.data.X, 2);
    tsRestart();
  }
  function tsRestart() {
    TS.ts = U.makeTSNE(TS.data.X, { perplexity: TS.perp, lr: 100, seed: 4 });
    TS.run = true; tsRunLabel();
    tsShow();
  }
  function tsShow() {
    $('tsPcaLbl').textContent = `PCA · ${t('explained')} ${pct(TS.pca.explained[0] + TS.pca.explained[1])}`;
    $('tsLbl').textContent = `t-SNE · ${t('iterLbl')} ${TS.ts.iter}`;
    readouts($('tsRo'), [['iteration', String(TS.ts.iter)], ['klLbl', num(TS.ts.kl, 3)], ['phaseLbl', TS.ts.iter < 100 ? t('earlyEx') : TS.ts.iter >= TS.maxIter ? '✓ ' + t('converged') : t('refining')], ['pcaEv', pct(TS.pca.explained[0] + TS.pca.explained[1])]]);
    tsPcaV.dirty = tsV.dirty = true;
  }
  function scatter(cv, Y, col) {
    const { c, w, h } = prep(cv);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    Y.forEach((p) => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    const pad = 22, s = Math.min((w - 2 * pad) / Math.max(1e-9, x1 - x0), (h - 2 * pad - 14) / Math.max(1e-9, y1 - y0));
    const cx = w / 2 - ((x0 + x1) / 2) * s, cy = h / 2 + 7 + ((y0 + y1) / 2) * s;
    Y.forEach((p, i) => dot(c, cx + p[0] * s, cy - p[1] * s, 3.4, col(i), 'rgba(5,9,18,.6)'));
  }
  const tsCol = (i) => rgba(RAINBOW(TS.data.t[i]), 1);
  const tsPcaV = view($('tsPca'), () => { if (TS.pca) scatter($('tsPca'), TS.pca.Y, tsCol); });
  const tsV = view($('tsTsne'), () => { if (TS.ts) scatter($('tsTsne'), TS.ts.Y, tsCol); });
  const ts3V = view($('ts3d'), () => {
    const { c, w, h } = prep($('ts3d'));
    if (!TS.data) return;
    const S = Math.min(w, h) * 0.33, cx = w / 2, cy = h / 2 + 8, cyw = Math.cos(TS.yaw), syw = Math.sin(TS.yaw), cp = Math.cos(TS.pitch), sp = Math.sin(TS.pitch);
    // the roll axis (x₂) points into the screen, so the spiral itself is visible
    const P = (p) => { const x = p[0], up0 = p[2], z = p[1]; const xr = x * cyw - z * syw, zr = x * syw + z * cyw, depth = zr * cp - up0 * sp, up = zr * sp + up0 * cp, f = 3.2 / (3.2 + depth); return [cx + xr * S * f, cy - up * S * f, depth, f]; };
    const cs = [-1, 1], E = [];
    cs.forEach((a) => cs.forEach((b) => { E.push([[a, b, -1], [a, b, 1]], [[a, -1, b], [a, 1, b]], [[-1, a, b], [1, a, b]]); }));
    E.forEach(([a, b]) => { const p = P(a), q = P(b); line(c, p[0], p[1], q[0], q[1], 'rgba(180,195,225,.12)', 1); });
    TS.data.X.map((p, i) => [P(p), i]).sort((a, b) => b[0][2] - a[0][2]).forEach(([q, i]) => dot(c, q[0], q[1], 3.4 * q[3], tsCol(i), 'rgba(5,9,18,.6)'));
  });
  (() => {
    const cv = $('ts3d');
    cv.addEventListener('pointerdown', (e) => { TS.drag = [e.clientX, e.clientY, TS.yaw, TS.pitch]; try { cv.setPointerCapture(e.pointerId); } catch (err) { /* */ } });
    cv.addEventListener('pointermove', (e) => { if (!TS.drag) return; TS.yaw = TS.drag[2] + (e.clientX - TS.drag[0]) * 0.01; TS.pitch = clamp(TS.drag[3] + (e.clientY - TS.drag[1]) * 0.006, -1.3, 1.3); ts3V.dirty = true; });
    ['pointerup', 'pointercancel'].forEach((ev) => cv.addEventListener(ev, () => { TS.drag = null; }));
  })();
  seg('tsData', TS.ds, (v) => { TS.ds = v; tsLoad(); });
  slider('tsP', (v) => String(v), (v) => { TS.perp = v; later('ts', tsRestart); });
  $('tsRestart').addEventListener('click', tsRestart);
  const tsRunLabel = () => { const b = $('tsRun'); b.innerHTML = TS.run ? labelOf(b) : t('playBtn'); };
  $('tsRun').addEventListener('click', () => { TS.run = !TS.run; if (TS.run && TS.ts.iter >= TS.maxIter) TS.maxIter += 500; tsRunLabel(); });
  let tsTick = 0;
  tickers.push(() => {
    if (ts3V.visible && !TS.drag) { TS.yaw += 0.004; ts3V.dirty = true; }
    if (!TS.run || !TS.ts || !tsV.visible) return;
    if (TS.ts.iter >= TS.maxIter) { TS.run = false; tsRunLabel(); tsShow(); return; }
    TS.ts.step(2);
    tsV.dirty = true;
    if (++tsTick % 5 === 0) tsShow();
  });
  refreshers.push(() => { if (TS.ts) tsShow(); tsRunLabel(); });

  /* ======================================================= 7.1 ARENA */
  const CA = { k: 3, eps: 0.12, bw: 0.15, job: 0, res: {}, lastDs: null };
  const EPS_DEFAULT = { blobs3: 0.12, blobs5: 0.1, varied: 0.1, aniso: 0.08, moons: 0.14, circles: 0.15, density: 0.09, uniform: 0.1 };
  const caFit = {
    kmeans: (X) => { const r = U.kmeans(X, CA.k, { restarts: 5, seed: 3 }); return { labels: r.labels, centers: r.centers }; },
    gmm: (X) => ({ labels: U.makeGMM(X, CA.k, { seed: 3 }).run(150).labels() }),
    ward: (X) => { const T = U.agglomerative(X, 'ward'); return { labels: U.cutMerges(T, U.mergesForK(T, CA.k)) }; },
    single: (X) => { const T = U.agglomerative(X, 'single'); return { labels: U.cutMerges(T, U.mergesForK(T, CA.k)) }; },
    average: (X) => { const T = U.agglomerative(X, 'average'); return { labels: U.cutMerges(T, U.mergesForK(T, CA.k)) }; },
    dbscan: (X) => ({ labels: U.dbscan(X, CA.eps, 5).labels }),
    spectral: (X) => ({ labels: U.spectral(X, CA.k, { gamma: 20, knn: 15, seed: 3 }).labels }),
    meanshift: (X) => { const r = U.meanShift(X, CA.bw); return { labels: r.labels, centers: r.centers }; },
  };
  const caPanels = [...document.querySelectorAll('#caGrid .lad')].map((el, i) => {
    const id = CA_ALGOS[i];
    const B = board(el.querySelector('canvas'), {
      data: DCa, pointR: 3.2,
      color: (j) => { const r = CA.res[id]; return r && r.col ? pal(r.col[j]) : '#d6deef'; },
      over(c, g) { const r = CA.res[id]; if (r && r.centers) r.centers.forEach((cc) => { cross(c, g.X(cc[0]), g.Y(cc[1]), 6, '#fff', 3); }); },
    });
    return { el, id, B, stats: el.querySelector('.lad-stats') };
  });
  function caRun() {
    const job = ++CA.job;
    CA.res = {};
    let i = 0;
    const step = () => {
      if (job !== CA.job) return;
      if (i >= caPanels.length) { caStats(); return; }
      const P = caPanels[i++], X = DCa.X;
      const t0 = now();
      let r = { labels: X.map(() => 0) };
      try { if (X.length >= Math.max(3, CA.k)) r = caFit[P.id](X); } catch (e) { console.error(e); }
      r.ms = now() - t0;
      r.col = DCa.y.some((v) => v >= 0) ? alignLabels(r.labels, DCa.y) : r.labels;
      r.ari = ariTruth(r.labels, DCa);
      r.nc = new Set(r.labels.filter((l) => l >= 0)).size;
      r.sil = X.length <= 400 ? U.silhouette(X, r.labels).mean : NaN;
      CA.res[P.id] = r;
      P.B.redraw();
      caStats();
      setTimeout(step, 0);
    };
    caStats();
    step();
  }
  function caStats() {
    const done = Object.keys(CA.res).length;
    $('caStatus').textContent = done < CA_ALGOS.length ? `${t('running')} ${done}/${CA_ALGOS.length}…` : t('caDone');
    caPanels.forEach((P) => {
      const r = CA.res[P.id];
      P.stats.innerHTML = r ? `ARI <b style="color:var(--teal)">${num(r.ari, 2)}</b> · ${t('silShort')} ${num(r.sil, 2)} · ${t('clShort')} ${r.nc} · ${ms(r.ms)}` : '…';
    });
    const rows = CA_ALGOS.map((id) => ({ id, r: CA.res[id] })).filter((x) => x.r).sort((a, b) => (isFinite(b.r.ari) ? b.r.ari : -2) - (isFinite(a.r.ari) ? a.r.ari : -2) || b.r.sil - a.r.sil);
    $('caLb').innerHTML = rows.map(({ id, r }, k) => `
      <div class="lb-row"><span class="rk">${k + 1}</span><span class="nm">${t('ca_' + id)}</span>
      <span class="bar"><i style="width:${(clamp(isFinite(r.ari) ? r.ari : 0, 0, 1) * 100).toFixed(1)}%"></i></span>
      <span class="vals">ARI <b>${num(r.ari, 3)}</b> · ${t('silShort')} ${num(r.sil, 2)}</span><span class="ms">${ms(r.ms)}</span></div>`).join('');
  }
  const caK = slider('caK', (v) => String(v), (v) => { CA.k = v; caLater(); });
  const caE = slider('caE', (v) => num(v, 3), (v) => { CA.eps = v; caLater(); });
  slider('caB', (v) => num(v, 2), (v) => { CA.bw = v; caLater(); });
  let caTimer = 0;
  const caLater = (d = 250) => { clearTimeout(caTimer); caTimer = setTimeout(caRun, d); };
  DCa.on((k) => {
    if (k === 'view') { caPanels.forEach((P) => P.B.redraw()); return; }
    if (k === 'regen' && CA.lastDs !== DCa.ds) { CA.lastDs = DCa.ds; CA.k = DCa.k; caK.set(CA.k); CA.eps = EPS_DEFAULT[DCa.ds] || 0.12; caE.set(CA.eps); }
    caLater(k === 'edit' ? 400 : 150);
  });
  CA.lastDs = DCa.ds; CA.k = DCa.k; caK.set(CA.k); CA.eps = EPS_DEFAULT[DCa.ds]; caE.set(CA.eps);
  refreshers.push(caStats);

  /* ============================================================ HERO */
  const hero = { pts: null };
  const heroV = view($('heroCanvas'), () => {
    const { c, w, h } = prep($('heroCanvas'));
    const tt = performance.now() / 1000;
    if (!hero.pts) { const r = U.rng(9); hero.pts = Array.from({ length: 110 }, () => [r(), r(), Math.floor(r() * 4), r() * TAU, 0.6 + r() * 0.8]); }
    const C = [[0.22, 0.35], [0.5, 0.7], [0.78, 0.32], [0.62, 0.15]].map(([x, y], k) => [x + 0.04 * Math.sin(tt * 0.3 + k * 2), y + 0.05 * Math.cos(tt * 0.25 + k)]);
    hero.pts.forEach((p) => {
      const cc = C[p[2]], rad = 0.05 + 0.07 * p[4];
      const tx = cc[0] + rad * Math.cos(p[3] + tt * 0.25 * p[4]), ty = cc[1] + rad * 1.6 * Math.sin(p[3] + tt * 0.25 * p[4]);
      p[0] += (tx - p[0]) * 0.02; p[1] += (ty - p[1]) * 0.02;
      line(c, p[0] * w, p[1] * h, cc[0] * w, cc[1] * h, rgba(PAL_RGB[p[2]], 0.05), 1);
      dot(c, p[0] * w, p[1] * h, 2.6, rgba(PAL_RGB[p[2]], 0.6), null);
    });
    C.forEach((cc, k) => { cross(c, cc[0] * w, cc[1] * h, 6, rgba(PAL_RGB[k], 0.55), 2); });
  });
  tickers.push(() => { if (heroV.visible) heroV.dirty = true; });

  /* ---------------------------------------------- page chrome & init */
  const navLinks = [...document.querySelectorAll('#chapNav a')];
  const chapters = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    $('progressBar').style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    let idx = -1;
    chapters.forEach((s, i) => { if (s.getBoundingClientRect().top < 160) idx = i; });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === idx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => rio.observe(el));

  // floating guide (previous / next simulator)
  const STOPS = ['simMetric', 'simVor', 'simMaha', 'simScale', 'simCurse', 'simKm', 'simK', 'simHc', 'simDb', 'simGm', 'simPca', 'simTsne', 'simCa', 'simCheat'];
  const snDots = [...document.querySelectorAll('#snItems a')];
  const stopNum = (id) => { const m = /(\d+\.\d+)/.exec($(id).querySelector('.sim-tag').textContent); return m ? m[1] : '★'; };
  const stopLabel = (id) => `${stopNum(id)} · ${$(id).querySelector('h3').textContent.trim()}`;
  const currentStop = () => { let cur = -1; STOPS.forEach((id, i) => { if ($(id).getBoundingClientRect().top <= 150) cur = i; }); return cur; };
  const stepBack = (cur) => (cur >= 0 && $(STOPS[cur]).getBoundingClientRect().top < 60 ? cur : cur - 1);
  const goStop = (i) => { if (i < 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; } if (STOPS[i]) $(STOPS[i]).scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  function updateGuide() {
    const cur = currentStop(), prev = stepBack(cur), next = cur + 1;
    $('snCur').textContent = cur >= 0 ? stopNum(STOPS[cur]) : '';
    $('snPrev').disabled = cur < 0; $('snNext').disabled = next >= STOPS.length;
    $('snPrev').dataset.tip = prev >= 0 ? `▲ ${stopLabel(STOPS[prev])}` : `▲ ${t('guideTop')}`;
    $('snNext').dataset.tip = next < STOPS.length ? `▼ ${stopLabel(STOPS[next])}` : t('guideEnd');
    navLinks.forEach((a, i) => { snDots[i].dataset.tip = a.textContent.trim(); snDots[i].classList.toggle('active', a.classList.contains('active')); });
  }
  $('snPrev').addEventListener('click', () => goStop(stepBack(currentStop())));
  $('snNext').addEventListener('click', () => goStop(currentStop() + 1));
  let guideRaf = 0;
  window.addEventListener('scroll', () => { if (!guideRaf) guideRaf = requestAnimationFrame(() => { guideRaf = 0; updateGuide(); }); }, { passive: true });
  refreshers.push(updateGuide);

  function frame(ts) {
    for (const f of tickers) { try { f(ts); } catch (e) { console.error(e); } }
    if (jobs.size) { const js = [...jobs.values()]; jobs.clear(); js.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); }
    for (const v of views) if (v.dirty && v.visible) { v.dirty = false; try { v.draw(); } catch (e) { console.error(e); } }
    requestAnimationFrame(frame);
  }

  mtUpdate(); mhStats(); cuCompute();
  kmInit(); kCompute();
  hcFit();
  dbFit(); dbK();
  gmInit();
  pcaFit();
  tsLoad();
  caRun();
  applyLang();
  onScroll(); updateGuide();
  requestAnimationFrame(frame);
  window.__ulReady = true;
})();
