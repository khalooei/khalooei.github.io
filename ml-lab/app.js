/* ML Lab — interactive simulators for classical machine learning.
 * © Mohammad Khalooei (mohammad.khalooei@sharif.edu · khalooei@aut.ac.ir)
 * Plain JavaScript + Canvas 2D. Algorithms live in models.js. No build step. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const M = window.ML;
  const I18N = window.ML_I18N || { fa: {}, dyn: { en: {}, fa: {} } };
  const TAU = Math.PI * 2, clamp = M.clamp, sig = M.sigmoid;
  const NEG = '#ff5d9e', POS = '#45d9f5', YEL = '#ffcb57', VIO = '#a68bff', TEAL = '#46e4b0', BLUE = '#7798ff';
  const NEG_RGB = [255, 93, 158], POS_RGB = [69, 217, 245], BG_RGB = [7, 12, 25];
  const SUB = ['₁', '₂'];

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
  const pct0 = (v) => (v == null || !isFinite(v) ? '—' : Math.round(v * 100) + '%');
  const num = (v, d = 2) => (v == null || !isFinite(v) ? '—' : (+v).toFixed(d));
  const sci = (v) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v >= 0.01 ? v.toFixed(3) : v.toExponential(1));
  const ms = (v) => (v < 10 ? v.toFixed(1) : Math.round(v)) + ' ms';
  function readouts(el, items) {
    el.innerHTML = items.map(([k, v, cls]) => `<div class="ro ${cls || ''}"><small>${t(k)}</small><b>${v}</b></div>`).join('');
  }
  function renderTex(el, tex) {
    if (window.katex) {
      try { window.katex.render(tex, el, { throwOnError: false }); return; } catch (e) { /* fall through */ }
    }
    el.textContent = tex;
  }
  const acc = (m, X, y) => M.accuracy(m, X, y);
  const now = () => performance.now();

  /* ------------------------------------------------------ canvas helpers */
  function prep(cv) {
    const r = cv.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    const W = Math.round(w * d), H = Math.round(h * d);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, w, h);
    return { c, w, h };
  }
  function txt(c, s, x, y, color = '#8d9db9', size = 11, align = 'left', weight = 500) {
    c.fillStyle = color;
    c.font = `${weight} ${size}px ${fontFamily()}`;
    c.textAlign = align;
    c.textBaseline = 'alphabetic';
    c.direction = /[؀-ۿ]/.test(s) ? 'rtl' : 'ltr';
    c.fillText(s, x, y);
  }
  function stroke(c, color, width = 2, glow = 0, dash = null) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    if (dash) c.setLineDash(dash);
    if (glow) { c.shadowColor = color; c.shadowBlur = glow; }
    c.stroke();
    c.shadowBlur = 0;
    c.setLineDash([]);
  }
  function line(c, x1, y1, x2, y2, color, width = 1, dash = null) {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); stroke(c, color, width, 0, dash);
  }
  function grid(c, x, y, w, h, rows = 4, cols = 8, color = 'rgba(112,137,184,.11)') {
    c.strokeStyle = color; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i <= rows; i++) { const yy = Math.round(y + (i * h) / rows) + 0.5; c.moveTo(x, yy); c.lineTo(x + w, yy); }
    for (let i = 0; i <= cols; i++) { const xx = Math.round(x + (i * w) / cols) + 0.5; c.moveTo(xx, y); c.lineTo(xx, y + h); }
    c.stroke();
  }
  function ring(c, x, y, r, color, width = 2, dash = null) {
    c.beginPath(); c.arc(x, y, r, 0, TAU); stroke(c, color, width, 0, dash);
  }
  function arrow(c, x1, y1, x2, y2, color, width = 2.5) {
    line(c, x1, y1, x2, y2, color, width);
    const a = Math.atan2(y2 - y1, x2 - x1), L = 9;
    c.beginPath();
    c.moveTo(x2, y2);
    c.lineTo(x2 - L * Math.cos(a - 0.45), y2 - L * Math.sin(a - 0.45));
    c.lineTo(x2 - L * Math.cos(a + 0.45), y2 - L * Math.sin(a + 0.45));
    c.closePath(); c.fillStyle = color; c.fill();
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  const mixRGB = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  const rgba = (rgb, a) => `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${a})`;
  const classRGB = (p) => (p >= 0.5 ? POS_RGB : NEG_RGB);
  function makeLUT(stops) {
    const lut = [];
    for (let i = 0; i < 256; i++) {
      const u = (i / 255) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(u)), f = u - k;
      lut.push(mixRGB(stops[k], stops[k + 1], f));
    }
    return (v) => lut[clamp(Math.round(v * 255), 0, 255)];
  }
  const VIRIDIS = makeLUT([[22, 14, 52], [59, 40, 130], [33, 104, 160], [28, 160, 140], [110, 205, 90], [245, 230, 70]]);
  const MAGMA = makeLUT([[12, 14, 34], [70, 26, 110], [170, 50, 120], [245, 110, 90], [252, 220, 150]]);

  /* -------------------------------------------- views & animation loop */
  const views = [], tickers = [], jobs = new Map(), refreshers = [];
  const later = (key, fn) => jobs.set(key, fn);
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target._view;
    if (v) v.visible = e.isIntersecting;
  }), { rootMargin: '250px 0px' });
  const rso = new ResizeObserver((es) => es.forEach((e) => { const v = e.target._view; if (v) v.dirty = true; }));
  function view(cv, draw) {
    const v = { cv, draw, dirty: true, visible: false };
    cv._view = v;
    views.push(v);
    vio.observe(cv);
    rso.observe(cv);
    return v;
  }
  const markAll = () => views.forEach((v) => { v.dirty = true; });

  /* -------------------------------------------------------- model glue */
  const P_OF = {
    svm: (s) => sig(2 * s), adaboost: (s) => sig(2 * s), line: (s) => sig(5 * s), lift: (s) => sig(8 * s),
    tree: (s) => s + 0.5, forest: (s) => s + 0.5, knn: (s) => s + 0.5, const: (s) => s + 0.5,
  };
  const pOf = (m, s) => (P_OF[m.type] || sig)(s);
  function constModel(D) {
    const n = D.y.length, pos = D.y.filter((v) => v > 0).length;
    const p = n ? pos / n : 0.5, s = p - 0.5 + (p === 0.5 ? 0 : 0);
    return { type: 'const', score: () => s, prob: () => p };
  }
  const trainable = (D) => D.X.length >= 2 && D.y.some((v) => v > 0) && D.y.some((v) => v < 0);
  const fitSafe = (D, fn) => (trainable(D) ? fn() : constModel(D));

  /* --------------------------------------------------------------- data */
  const DS_LIST = ['linear', 'blobs', 'outliers', 'xor', 'circles', 'moons', 'spiral', 'checker', 'stripes'];
  const DS_EN = { linear: 'Linearly separable', blobs: 'Overlapping blobs', outliers: 'Linear + outliers', xor: 'XOR', circles: 'Circles', moons: 'Moons', spiral: 'Spiral', checker: 'Checkerboard', stripes: 'Wavy stripes' };
  function makeData(cfg) {
    const D = Object.assign({ ds: 'moons', n: 120, noise: 0.2, labelNoise: 0, seed: 1, showTest: false, brush: 1 }, cfg);
    D.subs = []; D.bars = []; D.ver = 0;
    D.on = (f) => D.subs.push(f);
    D.emit = (kind) => { D.ver++; D.subs.forEach((f) => f(kind)); D.bars.forEach((b) => b()); };
    D.load = () => {
      const g = M.makeDataset(D.ds, D.n, D.noise, D.seed, D.labelNoise);
      D.X = g.X; D.y = g.y; D.Xt = g.Xt; D.yt = g.yt;
    };
    D.regen = () => { D.load(); D.emit('regen'); };
    D.load();
    return D;
  }
  function dataBar(key, D) {
    const el = document.querySelector(`[data-bar="${key}"]`);
    if (!el) return;
    el.innerHTML = `
      <div class="db-top">
        <select aria-label="Dataset" data-r="ds">${DS_LIST.map((d) => `<option value="${d}" data-i18n="ds_${d}">${DS_EN[d]}</option>`).join('')}</select>
        <button class="btn small" data-r="new" type="button" data-i18n="dbNew">↻ New sample</button>
        <div class="seg brush" role="group">
          <button type="button" data-b="1"><i style="background:var(--pos)"></i><span data-i18n="dbPos">Class +1</span></button>
          <button type="button" data-b="-1"><i style="background:var(--neg)"></i><span data-i18n="dbNeg">Class −1</span></button>
          <button type="button" data-b="0" data-i18n="dbErase">⌫ Erase</button>
        </div>
        <button class="btn small" data-r="clear" type="button" data-i18n="dbClear">Clear</button>
        <span class="db-spacer"></span>
        <label class="toggle"><input type="checkbox" data-r="test" /> <span data-i18n="dbTest">Show test points</span></label>
      </div>
      <div class="db-sliders">
        <div class="ctrl"><label><span data-i18n="dbN">Training points</span><output data-o="n"></output></label><input type="range" data-r="n" min="10" max="400" step="10" /></div>
        <div class="ctrl"><label><span data-i18n="dbNoise">Noise</span><output data-o="noise"></output></label><input type="range" data-r="noise" min="0" max="1" step="0.05" /></div>
        <div class="ctrl"><label><span data-i18n="dbFlip">Label noise</span><output data-o="flip"></output></label><input type="range" data-r="flip" min="0" max="0.3" step="0.01" /></div>
      </div>`;
    const q = (s) => el.querySelector(s);
    const sync = () => {
      q('[data-r="ds"]').value = D.ds;
      q('[data-r="n"]').value = D.n; q('[data-o="n"]').textContent = D.n;
      q('[data-r="noise"]').value = D.noise; q('[data-o="noise"]').textContent = (+D.noise).toFixed(2);
      q('[data-r="flip"]').value = D.labelNoise; q('[data-o="flip"]').textContent = Math.round(D.labelNoise * 100) + '%';
      q('[data-r="test"]').checked = D.showTest;
      el.querySelectorAll('[data-b]').forEach((b) => b.classList.toggle('on', +b.dataset.b === D.brush));
    };
    D.bars.push(sync);
    q('[data-r="ds"]').addEventListener('change', (e) => { D.ds = e.target.value; D.regen(); });
    q('[data-r="new"]').addEventListener('click', () => { D.seed++; D.regen(); });
    q('[data-r="clear"]').addEventListener('click', () => { D.X.length = 0; D.y.length = 0; D.emit('edit'); });
    q('[data-r="test"]').addEventListener('change', (e) => { D.showTest = e.target.checked; D.emit('view'); });
    q('[data-r="n"]').addEventListener('input', (e) => { D.n = +e.target.value; D.regen(); });
    q('[data-r="noise"]').addEventListener('input', (e) => { D.noise = +e.target.value; D.regen(); });
    q('[data-r="flip"]').addEventListener('input', (e) => { D.labelNoise = +e.target.value; D.regen(); });
    el.querySelectorAll('[data-b]').forEach((b) => b.addEventListener('click', () => { D.brush = +b.dataset.b; D.bars.forEach((s) => s()); }));
    sync();
  }

  /* -------------------------------------------------------------- board */
  function geo(w, h) {
    const s = Math.min(w, h) / 2.16, cx = w / 2, cy = h / 2;
    return {
      w, h, s, cx, cy, X: (x) => cx + x * s, Y: (y) => cy - y * s, ix: (px) => (px - cx) / s, iy: (py) => (cy - py) / s,
      xmin: -cx / s, xmax: cx / s, ymin: -cy / s, ymax: cy / s,
    };
  }
  const clipX = (v, g) => (v === -Infinity ? g.xmin : v === Infinity ? g.xmax : v);
  const clipY = (v, g) => (v === -Infinity ? g.ymin : v === Infinity ? g.ymax : v);

  function computeField(B, m, g, cell) {
    const cols = Math.max(8, Math.round(g.w / cell)), rows = Math.max(8, Math.round(g.h / cell));
    const S = new Float32Array(cols * rows);
    const off = B.off || (B.off = document.createElement('canvas'));
    off.width = cols; off.height = rows;
    const oc = off.getContext('2d'), img = oc.createImageData(cols, rows), d = img.data;
    for (let r = 0; r < rows; r++) {
      const y = g.iy(((r + 0.5) * g.h) / rows);
      for (let q = 0; q < cols; q++) {
        const x = g.ix(((q + 0.5) * g.w) / cols);
        let s = m.score(x, y);
        if (!isFinite(s)) s = 0;
        S[r * cols + q] = s;
        const p = pOf(m, s), u = Math.abs(p - 0.5) * 2;
        const a = 0.1 + 0.6 * Math.pow(u, 0.8);
        const col = classRGB(p), k = (r * cols + q) * 4;
        d[k] = BG_RGB[0] + (col[0] - BG_RGB[0]) * a;
        d[k + 1] = BG_RGB[1] + (col[1] - BG_RGB[1]) * a;
        d[k + 2] = BG_RGB[2] + (col[2] - BG_RGB[2]) * a;
        d[k + 3] = 255;
      }
    }
    oc.putImageData(img, 0, 0);
    return { S, cols, rows };
  }
  /** Marching squares on the score grid. */
  function contour(c, F, g, level, style) {
    const { S, cols, rows } = F, dx = g.w / cols, dy = g.h / rows;
    c.beginPath();
    for (let r = 0; r < rows - 1; r++) {
      for (let q = 0; q < cols - 1; q++) {
        const a = S[r * cols + q] - level, b = S[r * cols + q + 1] - level;
        const d = S[(r + 1) * cols + q] - level, e = S[(r + 1) * cols + q + 1] - level;
        const idx = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (e > 0 ? 2 : 0) | (d > 0 ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x0 = (q + 0.5) * dx, y0 = (r + 0.5) * dy;
        const T = () => [x0 + (dx * a) / (a - b), y0], R = () => [x0 + dx, y0 + (dy * b) / (b - e)];
        const Bo = () => [x0 + (dx * d) / (d - e), y0 + dy], L = () => [x0, y0 + (dy * a) / (a - d)];
        const sgm = (p1, p2) => { c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); };
        switch (idx) {
          case 1: case 14: sgm(L(), Bo()); break;
          case 2: case 13: sgm(Bo(), R()); break;
          case 3: case 12: sgm(L(), R()); break;
          case 4: case 11: sgm(T(), R()); break;
          case 6: case 9: sgm(T(), Bo()); break;
          case 7: case 8: sgm(L(), T()); break;
          case 5: sgm(L(), T()); sgm(Bo(), R()); break;
          case 10: sgm(T(), R()); sgm(L(), Bo()); break;
          default: break;
        }
      }
    }
    stroke(c, style.color || '#fff', style.width || 2, style.glow || 0, style.dash || null);
  }
  function drawAxes(c, g) {
    c.strokeStyle = 'rgba(160,180,220,.10)'; c.lineWidth = 1; c.beginPath();
    for (let v = -1; v <= 1.001; v += 0.5) {
      c.moveTo(g.X(v) + 0.5, 0); c.lineTo(g.X(v) + 0.5, g.h);
      c.moveTo(0, g.Y(v) + 0.5); c.lineTo(g.w, g.Y(v) + 0.5);
    }
    c.stroke();
    txt(c, 'x₁', g.w - 8, g.Y(0) - 6, 'rgba(180,195,225,.55)', 11, 'right', 700);
    txt(c, 'x₂', g.X(0) + 6, 13, 'rgba(180,195,225,.55)', 11, 'left', 700);
  }

  /** A 2-D decision board: field + contours + data points, with painting and hover. */
  function board(cv, o) {
    const B = Object.assign({
      data: null, editable: true, cell: 5, crisp: false, model: null, levels: [{ v: 0, color: '#fff', width: 2.4, glow: 6 }],
      errors: false, pointR: 4.2, radius: null, ids: null, under: null, over: null, insp: null, inspect: null, onHover: null, testPts: true,
    }, o);
    B.cv = cv; B.hover = null; B.field = null; B.fieldKey = '';
    B.view = view(cv, () => drawBoard(B));
    B.set = (m) => { B.model = m; B.field = null; B.view.dirty = true; };
    B.redraw = () => { B.view.dirty = true; };
    if (B.data) B.data.on((k) => { if (k === 'view') B.redraw(); });
    const toData = (e) => {
      const r = cv.getBoundingClientRect(), g = geo(r.width, r.height);
      return [g.ix(e.clientX - r.left), g.iy(e.clientY - r.top), g];
    };
    const apply = (b, x, y, g) => {
      const D = B.data;
      if (b === 0) {
        let best = -1, bd = 14 / g.s;
        D.X.forEach((p, i) => { const dd = Math.hypot(p[0] - x, p[1] - y); if (dd < bd) { bd = dd; best = i; } });
        if (best < 0) return;
        D.X.splice(best, 1); D.y.splice(best, 1);
      } else {
        D.X.push([clamp(x, g.xmin + 0.02, g.xmax - 0.02), clamp(y, g.ymin + 0.02, g.ymax - 0.02)]);
        D.y.push(b);
      }
      D.emit('edit');
    };
    cv.addEventListener('contextmenu', (e) => { if (B.editable) e.preventDefault(); });
    cv.addEventListener('pointerdown', (e) => {
      if (!B.editable || !B.data) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const [x, y, g] = toData(e);
      let b = B.data.brush;
      if (e.button === 2 && b !== 0) b = -b;
      B.paint = { b, x, y };
      apply(b, x, y, g);
    });
    cv.addEventListener('pointermove', (e) => {
      const [x, y, g] = toData(e);
      B.hover = [x, y];
      if (B.paint && Math.hypot(x - B.paint.x, y - B.paint.y) * g.s > (B.paint.b === 0 ? 6 : 16)) {
        B.paint.x = x; B.paint.y = y;
        apply(B.paint.b, x, y, g);
      }
      if (B.onHover) B.onHover(x, y);
      B.writeInsp();
      B.redraw();
    });
    const end = () => { B.paint = null; };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('pointerleave', () => {
      B.hover = null; B.paint = null;
      if (B.onHover) B.onHover(null, null);
      B.writeInsp();
      B.redraw();
    });
    B.writeInsp = () => {
      if (!B.insp) return;
      if (!B.hover || !B.model) { B.insp.innerHTML = t(B.editable ? 'inspHint' : 'inspHintRO'); return; }
      const [x, y] = B.hover;
      if (B.inspect) { B.insp.innerHTML = B.inspect(x, y); return; }
      const s = B.model.score(x, y), p = pOf(B.model, s);
      B.insp.innerHTML = `x = (${num(x)}, ${num(y)}) · f(x) = <b>${num(s, 3)}</b> → ${s > 0 ? '<b style="color:var(--pos)">+1</b>' : '<b style="color:var(--neg)">−1</b>'} · P(+1) ≈ ${num(p, 2)}`;
    };
    refreshers.push(() => B.writeInsp());
    B.writeInsp();
    return B;
  }
  function drawBoard(B) {
    const { c, w, h } = prep(B.cv);
    const g = geo(w, h);
    B.g = g;
    c.fillStyle = '#070c19'; c.fillRect(0, 0, w, h);
    const m = B.model;
    const cell = typeof B.cell === 'function' ? B.cell() : B.cell;
    const key = `${Math.round(w)}x${Math.round(h)}:${cell}`;
    if (m && (!B.field || B.fieldKey !== key)) { B.field = computeField(B, m, g, cell); B.fieldKey = key; }
    if (m && B.field) {
      c.imageSmoothingEnabled = !B.crisp;
      c.drawImage(B.off, 0, 0, w, h);
      c.imageSmoothingEnabled = true;
    }
    drawAxes(c, g);
    if (m && B.field) {
      const lv = typeof B.levels === 'function' ? B.levels() : B.levels;
      (lv || []).forEach((L) => contour(c, B.field, g, L.v, L));
    }
    if (B.under) B.under(c, g);
    drawPoints(B, c, g);
    if (B.over) B.over(c, g);
    if (B.hover) {
      const hx = g.X(B.hover[0]), hy = g.Y(B.hover[1]);
      ring(c, hx, hy, 5, 'rgba(255,255,255,.8)', 1.4);
    }
  }
  function drawPoints(B, c, g) {
    const D = B.data;
    if (!D) return;
    const R = B.pointR;
    if (D.showTest && B.testPts) {
      for (let i = 0; i < D.Xt.length; i++) {
        const x = g.X(D.Xt[i][0]), y = g.Y(D.Xt[i][1]);
        c.beginPath(); c.arc(x, y, R * 0.95, 0, TAU);
        c.fillStyle = 'rgba(6,10,20,.55)'; c.fill();
        stroke(c, D.yt[i] > 0 ? POS : NEG, 1.7);
      }
    }
    const ids = B.ids ? B.ids() : null;
    const n = ids ? ids.length : D.X.length;
    for (let k = 0; k < n; k++) {
      const i = ids ? ids[k] : k;
      const p = D.X[i];
      if (!p) continue;
      const x = g.X(p[0]), y = g.Y(p[1]), r = B.radius ? B.radius(i) : R;
      c.beginPath(); c.arc(x, y, r, 0, TAU);
      c.fillStyle = D.y[i] > 0 ? POS : NEG; c.fill();
      c.lineWidth = 1.3; c.strokeStyle = '#050912'; c.stroke();
    }
    if (B.errors && B.model) {
      for (let k = 0; k < n; k++) {
        const i = ids ? ids[k] : k, p = D.X[i];
        if (p && (B.model.score(p[0], p[1]) > 0 ? 1 : -1) !== D.y[i]) ring(c, g.X(p[0]), g.Y(p[1]), R + 3.5, YEL, 1.8);
      }
    }
  }
  /** Draw a fitted tree's split segments inside their boxes. */
  function drawSplits(c, g, tr, opt = {}) {
    if (!tr || !tr.nodes) return;
    tr.nodes.forEach((nd) => {
      if (nd.leaf) return;
      const b = nd.box;
      const a = opt.color ? 1 : Math.max(0.35, 1 - (nd.depth / (tr.depth + 1)) * 0.65);
      const col = opt.color || `rgba(255,255,255,${a})`, wd = opt.width || Math.max(1.1, 2.6 - nd.depth * 0.3);
      if (nd.f === 0) line(c, g.X(nd.t), g.Y(clipY(b[2], g)), g.X(nd.t), g.Y(clipY(b[3], g)), col, wd);
      else line(c, g.X(clipX(b[0], g)), g.Y(nd.t), g.X(clipX(b[1], g)), g.Y(nd.t), col, wd);
    });
  }
  function boxRect(c, g, b, fill, strokeCol, dash) {
    const x1 = g.X(clipX(b[0], g)), x2 = g.X(clipX(b[1], g)), y1 = g.Y(clipY(b[3], g)), y2 = g.Y(clipY(b[2], g));
    if (fill) { c.fillStyle = fill; c.fillRect(x1, y1, x2 - x1, y2 - y1); }
    if (strokeCol) { c.beginPath(); c.rect(x1 + 1, y1 + 1, x2 - x1 - 2, y2 - y1 - 2); stroke(c, strokeCol, 2, 0, dash); }
  }

  /* --------------------------------------------------------------- plot */
  function plot(cv, sp) {
    const { c, w, h } = prep(cv);
    const L = sp.L != null ? sp.L : 44, R = sp.R != null ? sp.R : 14, T = sp.T != null ? sp.T : 30, Bt = 24;
    const pw = Math.max(10, w - L - R), ph = Math.max(10, h - T - Bt);
    const series = sp.series || [];
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
    const X = (v) => L + ((v - x0) / (x1 - x0 || 1)) * pw;
    const Y = (v) => T + ph - ((v - y0) / (y1 - y0 || 1)) * ph;
    grid(c, L, T, pw, ph, 4, 6);
    const fy = sp.yFmt || ((v) => num(v, Math.abs(y1 - y0) < 0.5 ? 2 : 1)), fx = sp.xFmt || ((v) => String(Math.round(v)));
    for (let i = 0; i <= 4; i++) { const v = y0 + ((y1 - y0) * i) / 4; txt(c, fy(v), L - 6, Y(v) + 3, '#7385a6', 9.5, 'right'); }
    for (let i = 0; i <= 6; i++) { const v = x0 + ((x1 - x0) * i) / 6; txt(c, fx(v), X(v), h - 8, '#7385a6', 9.5, 'center'); }
    if (sp.xLabel) txt(c, sp.xLabel, L + pw - 2, T + ph - 6, '#8d9db9', 10, 'right', 600);
    (sp.hlines || []).forEach((hl) => {
      if (hl.v < y0 || hl.v > y1) return;
      line(c, L, Y(hl.v), L + pw, Y(hl.v), hl.color || '#ffffff66', 1.2, [5, 5]);
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
        const bw = Math.max(1, (pw / Math.max(1, s.data.length)) * 0.7);
        c.fillStyle = s.color;
        s.data.forEach((v, i) => { const xx = X(xs ? xs[i] : x00 + i), yy = Y(Math.max(y0, v)); c.fillRect(xx - bw / 2, yy, bw, Y(Math.max(y0, 0)) - yy); });
        return;
      }
      c.beginPath();
      let started = false;
      s.data.forEach((v, i) => {
        if (!isFinite(v)) return;
        const xx = X(xs ? xs[i] : x00 + i), yy = Y(clamp(v, y0, y1));
        if (started) c.lineTo(xx, yy); else { c.moveTo(xx, yy); started = true; }
      });
      stroke(c, s.color, s.width || 2, s.glow || 0, s.dash || null);
    });
    if (sp.mark != null && sp.mark >= x0 && sp.mark <= x1) {
      line(c, X(sp.mark), T, X(sp.mark), T + ph, YEL, 1.3, [3, 3]);
      series.forEach((s) => {
        if (s.type === 'bar' || s.noDot) return;
        const i = Math.round(sp.mark - (s.x0 || 0));
        const v = s.data[i];
        if (isFinite(v)) { c.beginPath(); c.arc(X(sp.mark), Y(clamp(v, y0, y1)), 4, 0, TAU); c.fillStyle = s.color; c.fill(); }
      });
    }
    // legend: opposite corner to the screen label (top-right in LTR, top-left in RTL)
    c.font = `600 10.5px ${fontFamily()}`;
    const items = series.filter((s) => s.label);
    const total = items.reduce((a, s) => a + c.measureText(s.label).width + 28, 0);
    let lx = lang === 'fa' ? L : L + pw - total;
    items.forEach((s) => {
      line(c, lx, 12, lx + 11, 12, s.color, 2.5, s.dash || null);
      txt(c, s.label, lx + 16, 16, '#b8c5de', 10.5, 'left', 600);
      c.font = `600 10.5px ${fontFamily()}`;
      lx += c.measureText(s.label).width + 28;
    });
    return { X, Y, L, T, pw, ph, x0, x1, y0, y1, w, h };
  }

  /* --------------------------------------------------- segmented control */
  function seg(id, attr, value, onPick) {
    const el = $(id);
    const set = (v) => el.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset[attr] === String(v)));
    el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { set(b.dataset[attr]); onPick(b.dataset[attr]); }));
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
  function playBtn(btn, isOn) {
    const k = btn.dataset.i18n;
    return () => { btn.innerHTML = isOn() ? t('stopBtn') : labelOf(btn, k); btn.classList.toggle('playing', isOn()); };
  }

  /* =========================================================== DATA SETUP */
  const D1 = makeData({ ds: 'linear', n: 60, noise: 0.15, seed: 3 });
  const DS = makeData({ ds: 'circles', n: 120, noise: 0.15, seed: 2 });
  const DG = makeData({ ds: 'moons', n: 140, noise: 0.35, seed: 5 });
  const DT = makeData({ ds: 'moons', n: 120, noise: 0.3, seed: 4 });
  const DR = makeData({ ds: 'moons', n: 160, noise: 0.35, labelNoise: 0.04, seed: 6 });
  const DA = makeData({ ds: 'circles', n: 120, noise: 0.2, seed: 7 });
  const DB = makeData({ ds: 'moons', n: 160, noise: 0.4, labelNoise: 0.04, seed: 8 });
  const DK = makeData({ ds: 'moons', n: 120, noise: 0.35, seed: 9 });
  const DL = makeData({ ds: 'circles', n: 100, noise: 0.15, seed: 10 });
  const DGs = makeData({ ds: 'blobs', n: 120, noise: 0.25, seed: 11 });
  const DN = makeData({ ds: 'spiral', n: 160, noise: 0.1, seed: 12 });
  const DAr = makeData({ ds: 'moons', n: 200, noise: 0.3, seed: 13 });
  [['man', D1], ['svm', DS], ['lad', DS], ['cg', DG], ['dt', DT], ['rf', DR], ['ab', DA], ['gb', DB], ['knn', DK], ['lr', DL], ['gs', DGs], ['nn', DN], ['ar', DAr]]
    .forEach(([k, D]) => dataBar(k, D));

  // dynamic DOM for ladder / thumbnails / arena (built before i18n scan)
  const LADDER = [
    { name: 'Linear', p: { kernel: 'linear' }, cx: 1 },
    { name: 'Sigmoid (tanh)', p: { kernel: 'sigmoid', gamma: 1, coef0: 0 }, cx: 1 },
    { name: 'Poly d = 2', p: { kernel: 'poly', degree: 2, gamma: 1, coef0: 1 }, cx: 2 },
    { name: 'Poly d = 3', p: { kernel: 'poly', degree: 3, gamma: 1, coef0: 1 }, cx: 2 },
    { name: 'Poly d = 6', p: { kernel: 'poly', degree: 6, gamma: 1, coef0: 1 }, cx: 3 },
    { name: 'RBF γ = 0.5', p: { kernel: 'rbf', gamma: 0.5 }, cx: 2 },
    { name: 'RBF γ = 5', p: { kernel: 'rbf', gamma: 5 }, cx: 3 },
    { name: 'RBF γ = 50', p: { kernel: 'rbf', gamma: 50 }, cx: 4 },
  ];
  $('ladder').innerHTML = LADDER.map((L, i) => `
    <button class="lad" type="button" data-i="${i}">
      <div class="lad-cv"><canvas></canvas></div>
      <div class="lad-info"><div class="lad-name"><span>${L.name}</span><small data-cx="${L.cx}"></small></div><div class="lad-stats"></div></div>
    </button>`).join('');
  $('rfThumbs').innerHTML = Array.from({ length: 8 }, () => '<div class="thumb"><div class="th-cv"><canvas></canvas></div><small></small></div>').join('');
  const ARENA = [
    { id: 'logreg', fit: (D) => M.makeLogReg(D.X, D.y, { degree: 1, lr: 0.1 }).step(300) },
    { id: 'logreg3', fit: (D) => M.makeLogReg(D.X, D.y, { degree: 3, lr: 0.1, lambda: 1e-3 }).step(600) },
    { id: 'knn', fit: (D) => M.fitKNN(D.X, D.y, { k: 7 }) },
    { id: 'nb', fit: (D) => M.fitGaussian(D.X, D.y, { mode: 'nb' }) },
    { id: 'qda', fit: (D) => M.fitGaussian(D.X, D.y, { mode: 'qda' }) },
    { id: 'svml', fit: (D) => M.fitSVM(D.X, D.y, { kernel: 'linear', C: 1 }) },
    { id: 'svmr', fit: (D) => M.fitSVM(D.X, D.y, { kernel: 'rbf', C: 3, gamma: 3, maxIter: 50000 }) },
    { id: 'tree', fit: (D) => M.fitTree(D.X, D.y, { maxDepth: 5, minLeaf: 2 }) },
    { id: 'rf', fit: (D) => M.fitForest(D.X, D.y, { nTrees: 100, maxDepth: 10, seed: 3 }) },
    { id: 'ada', fit: (D) => M.fitAdaBoost(D.X, D.y, { rounds: 100, depth: 1 }) },
    { id: 'gb', fit: (D) => M.fitGradBoost(D.X, D.y, { rounds: 100, lr: 0.1, depth: 3 }) },
    { id: 'mlp', fit: (D) => M.makeMLP(D.X, D.y, { hidden: [10, 10], act: 'tanh', lr: 0.03, seed: 2 }).step(700) },
  ];
  $('arenaGrid').innerHTML = ARENA.map((a) => `
    <div class="lad" data-id="${a.id}">
      <div class="lad-cv"><canvas></canvas></div>
      <div class="lad-info"><div class="lad-name"><span data-i18n="ar_${a.id}">${t('ar_' + a.id)}</span></div><div class="lad-stats"></div></div>
    </div>`).join('');

  /* --------------------------------------------- i18n application */
  const originals = new Map();
  document.querySelectorAll('[data-i18n]').forEach((el) => originals.set(el, el.innerHTML));
  function labelOf(el, k) {
    const key = k || el.dataset.i18n;
    return lang === 'fa' && I18N.fa[key] != null ? I18N.fa[key] : originals.get(el) || key;
  }
  function applyLang() {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'fa' ? 'rtl' : 'ltr';
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

  /* ======================================================== 1.1 MANUAL */
  const man = { th: 30, b: 0.2, run: false, w: null, c: 0, upd: 0, ptr: 0, flash: -1, last: 0, status: 'idle' };
  const manModel = () => {
    const a = (man.th * Math.PI) / 180, w = [Math.cos(a), Math.sin(a)], b = man.b;
    return { type: 'line', w, b, score: (x, y) => w[0] * x + w[1] * y - b };
  };
  const manB = board($('manBoard'), {
    data: D1, cell: 6, insp: $('manInsp'), errors: true,
    over(c, g) {
      const m = manB.model;
      if (!m) return;
      const p0 = [m.w[0] * m.b, m.w[1] * m.b];
      arrow(c, g.X(p0[0]), g.Y(p0[1]), g.X(p0[0] + 0.3 * m.w[0]), g.Y(p0[1] + 0.3 * m.w[1]), YEL);
      txt(c, 'w', g.X(p0[0] + 0.37 * m.w[0]), g.Y(p0[1] + 0.37 * m.w[1]) + 4, YEL, 14, 'center', 800);
      if (man.flash >= 0 && D1.X[man.flash]) {
        const p = D1.X[man.flash];
        ring(c, g.X(p[0]), g.Y(p[1]), 11, YEL, 2.5);
        ring(c, g.X(p[0]), g.Y(p[1]), 16, 'rgba(255,203,87,.4)', 1.5);
      }
    },
  });
  const manTh = slider('manTh', (v) => v.toFixed(0) + '°', (v) => { man.th = v; man.w = null; man.run = false; man.status = 'idle'; manUpdate(); });
  const manBs = slider('manB', (v) => num(v), (v) => { man.b = v; man.w = null; man.run = false; man.status = 'idle'; manUpdate(); });
  const manRunLabel = playBtn($('manRun'), () => man.run);
  function manUpdate() {
    manTh.set(man.th); manBs.set(clamp(man.b, -1.3, 1.3));
    manB.set(manModel());
    manStats();
    manRunLabel();
  }
  function manStats() {
    const m = manB.model, n = D1.X.length;
    let err = 0, minM = Infinity;
    for (let i = 0; i < n; i++) { const yf = D1.y[i] * m.score(D1.X[i][0], D1.X[i][1]); if (yf <= 0) err++; minM = Math.min(minM, yf); }
    readouts($('manRo'), [
      ['trainAcc', pct(n ? 1 - err / n : NaN), err ? '' : 'ok'], ['testAcc', pct(acc(m, D1.Xt, D1.yt))],
      ['mistakes', String(err), err ? 'warn' : 'ok'], ['minMargin', err || !n ? '—' : num(minM, 3)],
      ['updates', String(man.upd)], ['wVec', `(${num(m.w[0])}, ${num(m.w[1])})`],
    ]);
    $('manNote').innerHTML = t('man_' + man.status, { k: man.upd });
    $('manNote').className = 'note' + (man.status === 'done' ? ' teal' : man.status === 'stuck' ? ' warn' : '');
  }
  function manStepOnce() {
    if (!man.w) { const a = (man.th * Math.PI) / 180; man.w = [Math.cos(a), Math.sin(a)]; man.c = -man.b; }
    const n = D1.X.length;
    for (let k = 0; k < n; k++) {
      const i = (man.ptr + k) % n, x = D1.X[i], y = D1.y[i];
      if (y * (man.w[0] * x[0] + man.w[1] * x[1] + man.c) <= 0) {
        man.w[0] += y * x[0]; man.w[1] += y * x[1]; man.c += y;
        man.upd++; man.ptr = (i + 1) % n; man.flash = i;
        const nrm = Math.hypot(man.w[0], man.w[1]);
        if (nrm > 1e-9) { man.th = ((Math.atan2(man.w[1], man.w[0]) * 180) / Math.PI + 360) % 360; man.b = -man.c / nrm; }
        return true;
      }
    }
    man.flash = -1;
    return false;
  }
  function manTick() {
    const moved = manStepOnce();
    if (!moved) { man.run = false; man.status = 'done'; }
    else if (man.upd >= 300) { man.run = false; man.status = 'stuck'; }
    else man.status = 'running';
    manUpdate();
  }
  $('manRun').addEventListener('click', () => {
    man.run = !man.run;
    if (man.run) { man.w = null; man.upd = 0; man.ptr = 0; man.status = 'running'; }
    manRunLabel();
  });
  $('manStep').addEventListener('click', () => { man.run = false; if (man.status !== 'running') { man.upd = 0; man.w = null; } manTick(); if (man.status === 'running') man.status = 'stepping'; manStats(); });
  $('manRand').addEventListener('click', () => { man.th = Math.random() * 360; man.b = (Math.random() - 0.5) * 0.8; man.w = null; man.run = false; man.upd = 0; man.flash = -1; man.status = 'idle'; manUpdate(); });
  tickers.push((ts) => { if (man.run && ts - man.last > 110) { man.last = ts; manTick(); } });
  D1.on((k) => { if (k !== 'view') { man.w = null; man.ptr = 0; man.flash = -1; if (!man.run) { man.status = 'idle'; man.upd = 0; } later('man', manUpdate); } });
  refreshers.push(manStats, manRunLabel);

  /* ========================================================= 2.1 SVM */
  const SP = { kernel: 'rbf', C: 1, gamma: 2, degree: 3, coef0: 1, showM: true, showSV: true };
  let svmM = null, svmMs = 0;
  const svmLevels = () => {
    const L = [{ v: 0, color: '#fff', width: 2.6, glow: 7 }];
    if (SP.showM && svmM && svmM.type === 'svm') L.push({ v: 1, color: 'rgba(235,242,255,.75)', width: 1.5, dash: [6, 5] }, { v: -1, color: 'rgba(235,242,255,.75)', width: 1.5, dash: [6, 5] });
    return L;
  };
  function svRings(c, g, m, D, small) {
    if (!m || m.type !== 'svm') return;
    const C = m.params.C;
    m.sv.forEach((i) => {
      const p = D.X[i];
      if (!p) return;
      const bound = m.alpha[i] >= C - 1e-9;
      ring(c, g.X(p[0]), g.Y(p[1]), (small ? 3 : 4.2) + 3.6, bound ? YEL : '#fff', small ? 1.4 : 2, bound ? [3, 3] : null);
    });
  }
  const svmB = board($('svmBoard'), {
    data: DS, cell: 5, insp: $('svmInsp'), levels: svmLevels,
    over(c, g) { if (SP.showSV) svRings(c, g, svmM, DS); },
  });
  function kernelTex() {
    const g = sci(SP.gamma), r = num(SP.coef0, 1), d = SP.degree;
    return {
      linear: 'K(x,z)=x^\\top z',
      poly: `K(x,z)=(${g}\\,x^\\top z ${SP.coef0 < 0 ? '-' : '+'} ${num(Math.abs(SP.coef0), 1)})^{${d}}`,
      rbf: `K(x,z)=e^{-${g}\\,\\|x-z\\|^2}`,
      sigmoid: `K(x,z)=\\tanh(${g}\\,x^\\top z ${SP.coef0 < 0 ? '-' : '+'} ${num(Math.abs(SP.coef0), 1)})`,
    }[SP.kernel] + (SP.kernel === 'rbf' ? '' : '') + (r ? '' : '');
  }
  function svmCtrlState() {
    document.querySelectorAll('#simSvm [data-for]').forEach((el) => el.classList.toggle('disabled', !el.dataset.for.split(' ').includes(SP.kernel)));
    renderTex($('svmKF'), kernelTex());
  }
  function svmFit() {
    const t0 = now();
    svmM = fitSafe(DS, () => M.fitSVM(DS.X, DS.y, { kernel: SP.kernel, C: SP.C, gamma: SP.gamma, degree: SP.degree, coef0: SP.coef0 }));
    svmMs = now() - t0;
    svmB.set(svmM);
    svmStats();
  }
  function svmStats() {
    const m = svmM;
    if (!m) return;
    const isS = m.type === 'svm';
    readouts($('svmRo'), [
      ['trainAcc', pct(acc(m, DS.X, DS.y))], ['testAcc', pct(acc(m, DS.Xt, DS.yt)), 'ok'],
      ['nSV', isS ? `${m.sv.length} / ${DS.X.length}` : '—'], ['nBound', isS ? String(m.nBound) : '—'],
      ['marginW', isS && m.margin ? num(m.margin, 3) : SP.kernel === 'linear' ? '—' : t('implicit')], ['smoIter', isS ? String(m.iter) : '—'],
      ['fitTime', ms(svmMs)], ['bias', isS ? num(m.rho, 3) : '—'],
    ]);
  }
  const setKernel = seg('svmKernel', 'k', SP.kernel, (k) => { SP.kernel = k; svmCtrlState(); later('svm', svmFit); });
  const sC = slider('svmC', (v) => sci(Math.pow(10, v)), (v) => { SP.C = Math.pow(10, v); later('svm', svmFit); later('lad', ladFit); });
  const sG = slider('svmG', (v) => sci(Math.pow(10, v)), (v) => { SP.gamma = Math.pow(10, v); svmCtrlState(); later('svm', svmFit); });
  const sD = slider('svmD', (v) => String(v), (v) => { SP.degree = v; svmCtrlState(); later('svm', svmFit); });
  const sR = slider('svmR', (v) => num(v, 1), (v) => { SP.coef0 = v; svmCtrlState(); later('svm', svmFit); });
  SP.gamma = Math.pow(10, +$('svmG').value);
  $('svmShowM').addEventListener('change', (e) => { SP.showM = e.target.checked; svmB.redraw(); });
  $('svmShowSV').addEventListener('change', (e) => { SP.showSV = e.target.checked; svmB.redraw(); });
  $('svmShowE').addEventListener('change', (e) => { svmB.errors = e.target.checked; svmB.redraw(); });
  DS.on((k) => { if (k !== 'view') { later('svm', svmFit); later('lad', ladFit); } });
  refreshers.push(svmStats);

  /* -------------------------------------------------------- 2.2 ladder */
  const ladPanels = [...document.querySelectorAll('#ladder .lad')].map((el, i) => {
    const L = LADDER[i];
    const B = board(el.querySelector('canvas'), {
      data: DS, editable: false, cell: 5, pointR: 3,
      levels: () => [{ v: 0, color: '#fff', width: 2, glow: 5 }, { v: 1, color: 'rgba(235,242,255,.45)', width: 1, dash: [4, 4] }, { v: -1, color: 'rgba(235,242,255,.45)', width: 1, dash: [4, 4] }],
      over(c, g) { svRings(c, g, B.model, DS, true); },
    });
    el.addEventListener('click', () => {
      Object.assign(SP, L.p);
      if (L.p.gamma) sG.set(Math.log10(L.p.gamma));
      if (L.p.degree) sD.set(L.p.degree);
      if (L.p.coef0 != null) sR.set(L.p.coef0);
      setKernel(SP.kernel);
      svmCtrlState();
      svmFit();
      ladPanels.forEach((p) => p.el.classList.toggle('active', p === ladPanels[i]));
      $('simSvm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return { el, L, B, stats: el.querySelector('.lad-stats') };
  });
  function ladFit() {
    ladPanels.forEach((P) => {
      const m = fitSafe(DS, () => M.fitSVM(DS.X, DS.y, Object.assign({ C: SP.C, gamma: 1, degree: 3, coef0: 1, maxIter: 60000 }, P.L.p)));
      P.B.set(m);
      P.m = m;
    });
    ladStats();
  }
  function ladStats() {
    ladPanels.forEach((P) => {
      const m = P.m;
      if (!m) return;
      const tr = acc(m, DS.X, DS.y), te = acc(m, DS.Xt, DS.yt);
      P.stats.innerHTML = `${t('trainShort')} <b>${pct0(tr)}</b> · ${t('testShort')} <b style="color:var(--teal)">${pct0(te)}</b> · SV ${m.sv ? m.sv.length : '—'}` +
        `<div class="bar2"><i style="width:${(tr * 50).toFixed(1)}%;background:var(--blue)"></i><i style="width:${(te * 50).toFixed(1)}%;background:var(--teal)"></i></div>`;
      P.el.querySelector('[data-cx]').textContent = t('cx' + P.L.cx);
    });
  }
  refreshers.push(ladStats);

  /* ------------------------------------------------------ 2.3 C × γ */
  const logspace = (a, b, n) => Array.from({ length: n }, (_, i) => Math.pow(10, a + ((b - a) * i) / (n - 1)));
  const CG = { Cs: logspace(-2, 3, 9), Gs: logspace(-1, 2, 9), res: [], metric: 'test', sel: -1, hover: -1, job: 0, best: -1, done: 0 };
  const cgB = board($('cgBoard'), {
    data: DG, cell: 5,
    levels: () => [{ v: 0, color: '#fff', width: 2.4, glow: 6 }, { v: 1, color: 'rgba(235,242,255,.6)', width: 1.2, dash: [5, 5] }, { v: -1, color: 'rgba(235,242,255,.6)', width: 1.2, dash: [5, 5] }],
    over(c, g) { const r = CG.res[CG.hover >= 0 ? CG.hover : CG.sel]; if (r) svRings(c, g, r.m, DG, true); },
  });
  const cgMetricVal = (r) => (!r ? NaN : CG.metric === 'test' ? r.te : CG.metric === 'train' ? r.tr : CG.metric === 'gap' ? r.tr - r.te : r.sv);
  const cgV = view($('cgHeat'), () => {
    const { c, w, h } = prep($('cgHeat'));
    const L = 52, R = 10, T = 30, Bt = 34, pw = w - L - R, ph = h - T - Bt, cw = pw / 9, ch = ph / 9;
    CG.geo = { L, T, cw, ch };
    for (let k = 0; k < 81; k++) {
      const i = k % 9, j = Math.floor(k / 9), r = CG.res[k];
      const x = L + i * cw, y = T + ph - (j + 1) * ch;
      let col = [24, 32, 52];
      const v = cgMetricVal(r);
      if (r) col = CG.metric === 'gap' ? MAGMA(clamp(v / 0.3, 0, 1)) : CG.metric === 'sv' ? MAGMA(v) : VIRIDIS(clamp((v - 0.5) / 0.5, 0, 1));
      c.fillStyle = rgba(col, 1);
      c.fillRect(x + 1, y + 1, cw - 2, ch - 2);
      if (r && cw > 30 && ch > 20) {
        const light = (col[0] * 0.3 + col[1] * 0.59 + col[2] * 0.11) > 140;
        txt(c, Math.round(v * 100) + '', x + cw / 2, y + ch / 2 + 4, light ? '#0b1020' : '#e9f0ff', 10.5, 'center', 700);
      }
    }
    const mark = (k, col, wd) => { if (k < 0) return; const i = k % 9, j = Math.floor(k / 9); c.beginPath(); c.rect(L + i * cw + 1.5, T + ph - (j + 1) * ch + 1.5, cw - 3, ch - 3); stroke(c, col, wd); };
    mark(CG.best, YEL, 2.5);
    mark(CG.sel, '#fff', 2);
    if (CG.hover >= 0) mark(CG.hover, 'rgba(255,255,255,.6)', 1.5);
    if (CG.best >= 0) { const i = CG.best % 9, j = Math.floor(CG.best / 9); txt(c, '★', L + i * cw + cw - 9, T + ph - (j + 1) * ch + 12, YEL, 11, 'center', 800); }
    CG.Cs.forEach((v, i) => { if (i % 2 === 0) txt(c, sci(v), L + (i + 0.5) * cw, T + ph + 14, '#8496b8', 9.5, 'center'); });
    CG.Gs.forEach((v, j) => { if (j % 2 === 0) txt(c, sci(v), L - 6, T + ph - (j + 0.5) * ch + 3, '#8496b8', 9.5, 'right'); });
    txt(c, 'C →', L + pw, T + ph + 28, '#b8c5de', 10.5, 'right', 700);
    txt(c, 'γ ↑', 8, T - 8, '#b8c5de', 10.5, 'left', 700);
    if (CG.done < 81) txt(c, `${t('training')} ${CG.done}/81`, L + pw, T - 10, '#9fb0d0', 10.5, 'right', 600);
    $('cgLabel').textContent = '';
  });
  function cgRun() {
    const job = ++CG.job;
    CG.res = []; CG.done = 0; CG.best = -1;
    let k = 0;
    const step = () => {
      if (job !== CG.job) return;
      const t0 = now();
      while (k < 81 && now() - t0 < 25) {
        const i = k % 9, j = Math.floor(k / 9);
        const m = fitSafe(DG, () => M.fitSVM(DG.X, DG.y, { kernel: 'rbf', C: CG.Cs[i], gamma: CG.Gs[j], maxIter: 30000 }));
        CG.res[k] = { m, C: CG.Cs[i], g: CG.Gs[j], tr: acc(m, DG.X, DG.y), te: acc(m, DG.Xt, DG.yt), sv: m.sv ? m.sv.length / Math.max(1, DG.X.length) : 0 };
        k++;
      }
      CG.done = k;
      cgV.dirty = true;
      if (k < 81) { setTimeout(step, 0); return; }
      let b = 0;
      CG.res.forEach((r, q) => { if (r.te > CG.res[b].te + 1e-9 || (Math.abs(r.te - CG.res[b].te) < 1e-9 && r.sv < CG.res[b].sv)) b = q; });
      CG.best = b;
      if (CG.sel < 0) CG.sel = b;
      cgShow();
    };
    step();
  }
  function cgShow() {
    const k = CG.hover >= 0 ? CG.hover : CG.sel, r = CG.res[k];
    cgV.dirty = true;
    if (!r) return;
    cgB.set(r.m);
    const b = CG.res[CG.best];
    $('cgPrevLabel').textContent = `C = ${sci(r.C)} · γ = ${sci(r.g)}`;
    readouts($('cgRo'), [
      ['trainAcc', pct(r.tr)], ['testAcc', pct(r.te), 'ok'], ['gap', pct(r.tr - r.te), r.tr - r.te > 0.08 ? 'warn' : ''],
      ['nSV', `${r.m.sv ? r.m.sv.length : 0}`], ['bestCell', b ? `C ${sci(b.C)}, γ ${sci(b.g)}` : '—'], ['bestTest', b ? pct(b.te) : '—', 'ok'],
    ]);
  }
  const cellAt = (e) => {
    const G = CG.geo, r = $('cgHeat').getBoundingClientRect();
    if (!G) return -1;
    const i = Math.floor((e.clientX - r.left - G.L) / G.cw), j = 8 - Math.floor((e.clientY - r.top - G.T) / G.ch);
    return i >= 0 && i < 9 && j >= 0 && j < 9 ? j * 9 + i : -1;
  };
  $('cgHeat').addEventListener('pointermove', (e) => { const k = cellAt(e); if (k !== CG.hover) { CG.hover = k; cgShow(); } });
  $('cgHeat').addEventListener('pointerleave', () => { CG.hover = -1; cgShow(); });
  $('cgHeat').addEventListener('click', (e) => { const k = cellAt(e); if (k >= 0) { CG.sel = k; cgShow(); } });
  seg('cgMetric', 'm', CG.metric, (m) => { CG.metric = m; cgV.dirty = true; });
  DG.on((k) => { if (k !== 'view') later('cg', cgRun); });
  refreshers.push(cgShow);

  /* ------------------------------------------------ 2.4 kernel trick 3D */
  const LIFT = {
    r2: { f: (x, y) => x * x + y * y, lo: 0, hi: 1.6 },
    xy: { f: (x, y) => x * y, lo: -0.9, hi: 0.9 },
    rbf: { f: (x, y) => Math.exp(-2 * (x * x + y * y)), lo: 0, hi: 1 },
  };
  const K3 = { ds: 'circles', map: 'r2', h: 0.5, sgn: 1, yaw: 0.6, pitch: 0.42, spin: true, mesh: true, drag: null };
  let D3 = makeData({ ds: 'circles', n: 180, noise: 0.08, seed: 21 });
  const zN = (v) => (v - LIFT[K3.map].lo) / (LIFT[K3.map].hi - LIFT[K3.map].lo);
  const zH = () => LIFT[K3.map].lo + K3.h * (LIFT[K3.map].hi - LIFT[K3.map].lo);
  function k3Acc(h, s) {
    const f = LIFT[K3.map].f, zh = LIFT[K3.map].lo + h * (LIFT[K3.map].hi - LIFT[K3.map].lo);
    let ok = 0;
    D3.X.forEach((p, i) => { if ((s * (f(p[0], p[1]) - zh) > 0 ? 1 : -1) === D3.y[i]) ok++; });
    return ok / Math.max(1, D3.X.length);
  }
  function k3Orient() { K3.sgn = k3Acc(K3.h, 1) >= k3Acc(K3.h, -1) ? 1 : -1; }
  const k3B = board($('k3Board'), { data: D3, editable: false, cell: 4, levels: [{ v: 0, color: YEL, width: 2.6, glow: 8 }] });
  function k3Model() {
    k3Orient();
    const f = LIFT[K3.map].f, zh = zH(), s = K3.sgn, span = LIFT[K3.map].hi - LIFT[K3.map].lo;
    k3B.data = D3;
    k3B.set({ type: 'lift', score: (x, y) => (s * (f(x, y) - zh)) / span });
    const a = k3Acc(K3.h, K3.sgn);
    let eq = '';
    if (K3.map === 'r2') eq = `x₁² + x₂² = ${num(zh, 3)}  →  ${t('circleR')} ${num(Math.sqrt(Math.max(0, zh)), 3)}`;
    else if (K3.map === 'xy') eq = `x₁ · x₂ = ${num(zh, 3)}  →  ${t('hyperbola')}`;
    else eq = `e^(−2‖x‖²) = ${num(zh, 3)}  →  ${t('circleR')} ${zh > 0 && zh < 1 ? num(Math.sqrt(-Math.log(zh) / 2), 3) : '—'}`;
    readouts($('k3Ro'), [['planeAcc', pct(a), a > 0.97 ? 'ok' : a < 0.75 ? 'warn' : ''], ['planeH', num(zh, 3)], ['boundary2d', eq]]);
    $('k3HOut').textContent = num(zh, 3);
    k3V.dirty = true;
  }
  const k3V = view($('k3Canvas'), () => {
    const { c, w, h } = prep($('k3Canvas'));
    const S = Math.min(w, h) * 0.36, cx = w / 2, cy = h / 2 + 10;
    const cyw = Math.cos(K3.yaw), syw = Math.sin(K3.yaw), cp = Math.cos(K3.pitch), spp = Math.sin(K3.pitch);
    const P = (x, y, zn) => {
      const Z = (zn - 0.5) * 1.3;
      const xr = x * cyw - y * syw, yr = x * syw + y * cyw;
      const depth = yr * cp - Z * spp, up = yr * spp + Z * cp;
      const f = 3.2 / (3.2 + depth);
      return [cx + xr * S * f, cy - up * S * f, depth, f];
    };
    const L3 = LIFT[K3.map], hz = K3.h;
    // floor grid
    c.strokeStyle = 'rgba(120,145,200,.16)'; c.lineWidth = 1; c.beginPath();
    for (let v = -1; v <= 1.001; v += 0.25) {
      let a = P(v, -1, 0), b = P(v, 1, 0); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]);
      a = P(-1, v, 0); b = P(1, v, 0); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]);
    }
    c.stroke();
    // vertical axis
    const o0 = P(-1, -1, 0), o1 = P(-1, -1, 1);
    line(c, o0[0], o0[1], o1[0], o1[1], 'rgba(180,195,225,.4)', 1.2);
    txt(c, 'z = φ(x)', o1[0] + 4, o1[1] - 4, 'rgba(200,210,235,.8)', 11, 'left', 700);
    const ax = P(1.12, -1, 0), ay = P(-1, 1.12, 0);
    txt(c, 'x₁', ax[0], ax[1], 'rgba(200,210,235,.7)', 11, 'center', 700);
    txt(c, 'x₂', ay[0], ay[1], 'rgba(200,210,235,.7)', 11, 'center', 700);
    // surface mesh
    if (K3.mesh) {
      c.strokeStyle = 'rgba(166,139,255,.16)'; c.lineWidth = 1; c.beginPath();
      const N = 18;
      for (let a = 0; a <= N; a++) {
        for (let dir = 0; dir < 2; dir++) {
          for (let b = 0; b <= N; b++) {
            const u = -1 + (2 * a) / N, v = -1 + (2 * b) / N;
            const x = dir ? u : v, y = dir ? v : u;
            const q = P(x, y, clamp(zN(L3.f(x, y)), -0.2, 1.2));
            if (b) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]);
          }
        }
      }
      c.stroke();
    }
    const pts = D3.X.map((p, i) => { const zn = zN(L3.f(p[0], p[1])); return { i, zn, q: P(p[0], p[1], zn), b: P(p[0], p[1], 0) }; });
    const drawPts = (arr) => arr.sort((a, b) => b.q[2] - a.q[2]).forEach((o) => {
      line(c, o.b[0], o.b[1], o.q[0], o.q[1], 'rgba(150,170,210,.10)', 1);
      c.beginPath(); c.arc(o.q[0], o.q[1], 3.6 * o.q[3], 0, TAU);
      c.fillStyle = D3.y[o.i] > 0 ? POS : NEG; c.fill();
      c.lineWidth = 1; c.strokeStyle = '#050912'; c.stroke();
    });
    drawPts(pts.filter((o) => o.zn < hz));
    // plane
    const cs = [P(-1, -1, hz), P(1, -1, hz), P(1, 1, hz), P(-1, 1, hz)];
    c.beginPath(); cs.forEach((q, k) => (k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath();
    c.fillStyle = 'rgba(255,203,87,.13)'; c.fill(); stroke(c, 'rgba(255,203,87,.7)', 1.4);
    // intersection curve on the plane and its shadow on the floor
    const N2 = 60, zh = zH();
    for (const lvl of [hz, 0]) {
      c.beginPath();
      for (let a = 0; a < N2; a++) {
        for (let b = 0; b < N2; b++) {
          const x0 = -1 + (2 * a) / N2, y0 = -1 + (2 * b) / N2, dd = 2 / N2;
          const v00 = L3.f(x0, y0) - zh, v10 = L3.f(x0 + dd, y0) - zh, v01 = L3.f(x0, y0 + dd) - zh;
          if (v00 * v10 < 0) { const xx = x0 + (dd * v00) / (v00 - v10); const q = P(xx, y0, lvl); c.moveTo(q[0] - 0.8, q[1]); c.lineTo(q[0] + 0.8, q[1]); }
          if (v00 * v01 < 0) { const yy = y0 + (dd * v00) / (v00 - v01); const q = P(x0, yy, lvl); c.moveTo(q[0] - 0.8, q[1]); c.lineTo(q[0] + 0.8, q[1]); }
        }
      }
      stroke(c, lvl ? YEL : 'rgba(255,203,87,.5)', lvl ? 2.6 : 1.6);
    }
    drawPts(pts.filter((o) => o.zn >= hz));
    txt(c, t('k3PlaneLbl'), cs[1][0] + 6, cs[1][1], YEL, 11, 'left', 700);
  });
  $('k3Canvas').addEventListener('pointerdown', (e) => { K3.drag = [e.clientX, e.clientY, K3.yaw, K3.pitch]; try { e.target.setPointerCapture(e.pointerId); } catch (err) { /* */ } });
  $('k3Canvas').addEventListener('pointermove', (e) => {
    if (!K3.drag) return;
    K3.yaw = K3.drag[2] + (e.clientX - K3.drag[0]) * 0.01;
    K3.pitch = clamp(K3.drag[3] + (e.clientY - K3.drag[1]) * 0.006, -0.1, 1.35);
    k3V.dirty = true;
  });
  ['pointerup', 'pointercancel'].forEach((ev) => $('k3Canvas').addEventListener(ev, () => { K3.drag = null; }));
  tickers.push(() => { if (K3.spin && !K3.drag && k3V.visible) { K3.yaw += 0.0045; k3V.dirty = true; } });
  const k3Best = () => {
    let best = 0, bh = 0.5;
    for (let i = 0; i <= 400; i++) { const hh = i / 400, a = Math.max(k3Acc(hh, 1), k3Acc(hh, -1)); if (a > best + 1e-9) { best = a; bh = hh; } }
    K3.h = bh; $('k3H').value = bh; k3Model();
  };
  const k3Load = () => {
    D3 = makeData({ ds: K3.ds, n: 180, noise: K3.ds === 'blobs' ? 0.35 : 0.08, seed: 21 });
    k3B.data = D3;
    k3Best();
  };
  seg('k3Data', 'd', K3.ds, (d) => {
    K3.ds = d;
    if (d === 'xor' && K3.map !== 'xy') { K3.map = 'xy'; setMap('xy'); }
    if (d === 'circles' && K3.map === 'xy') { K3.map = 'r2'; setMap('r2'); }
    k3Load();
  });
  const setMap = seg('k3Map', 'm', K3.map, (m) => { K3.map = m; k3Best(); });
  $('k3H').addEventListener('input', (e) => { K3.h = +e.target.value; k3Model(); });
  $('k3Best').addEventListener('click', k3Best);
  $('k3Spin').addEventListener('change', (e) => { K3.spin = e.target.checked; });
  $('k3Mesh').addEventListener('change', (e) => { K3.mesh = e.target.checked; k3V.dirty = true; });
  refreshers.push(k3Model);

  /* ======================================================== 3.1 TREE */
  const TP = { crit: 'gini', depth: 3, minLeaf: 1, lines: true, sel: 0, hoverNode: -1, path: null, cand: null, grow: false, shown: null, last: 0, rects: [] };
  let dtM = null;
  const dtB = board($('dtBoard'), {
    data: DT, cell: 3, crisp: true, levels: [], insp: $('dtInsp'),
    over(c, g) {
      const tr = dtM;
      if (!tr || !tr.nodes) return;
      const hn = tr.nodes[TP.hoverNode];
      if (hn) boxRect(c, g, hn.box, 'rgba(255,203,87,.12)', YEL);
      const sn = tr.nodes[TP.sel];
      if (sn && TP.sel !== 0) boxRect(c, g, sn.box, null, 'rgba(255,255,255,.85)', [6, 4]);
      if (TP.lines) drawSplits(c, g, tr);
      if (TP.cand && sn) {
        const b = sn.box;
        if (TP.cand.f === 0) line(c, g.X(TP.cand.t), g.Y(clipY(b[2], g)), g.X(TP.cand.t), g.Y(clipY(b[3], g)), YEL, 2.4, [6, 4]);
        else line(c, g.X(clipX(b[0], g)), g.Y(TP.cand.t), g.X(clipX(b[1], g)), g.Y(TP.cand.t), YEL, 2.4, [6, 4]);
      }
    },
    onHover(x, y) {
      TP.path = x == null || !dtM || !dtM.path ? null : dtM.path(x, y);
      treeV.dirty = true;
    },
    inspect(x, y) {
      if (!dtM || !dtM.nodes) return '';
      const ids = dtM.path(x, y), parts = [];
      for (let k = 0; k < ids.length - 1; k++) {
        const nd = dtM.nodes[ids[k]], yes = (nd.f === 0 ? x : y) <= nd.t;
        parts.push(`x${SUB[nd.f]} ≤ ${num(nd.t)} ${yes ? '<b style="color:var(--teal)">✓</b>' : '<b style="color:var(--neg)">✗</b>'}`);
      }
      const leaf = dtM.nodes[ids[ids.length - 1]];
      parts.push(`${t('leaf')}: P(+1) = <b>${num(leaf.p)}</b> (n = ${leaf.n})`);
      return parts.join(' → ');
    },
  });
  function dtFit() {
    const d = TP.grow && TP.shown != null ? TP.shown : TP.depth;
    dtM = fitSafe(DT, () => M.fitTree(DT.X, DT.y, { maxDepth: d, minLeaf: TP.minLeaf, criterion: TP.crit }));
    if (!dtM.nodes || !dtM.nodes[TP.sel]) TP.sel = 0;
    TP.hoverNode = -1;
    dtB.set(dtM);
    treeV.dirty = true;
    dtStats();
    spUpdate();
  }
  function dtStats() {
    const m = dtM;
    if (!m) return;
    readouts($('dtRo'), [
      ['trainAcc', pct(acc(m, DT.X, DT.y))], ['testAcc', pct(acc(m, DT.Xt, DT.yt)), 'ok'],
      ['depth', m.nodes ? String(m.depth) : '0'], ['leaves', m.nodes ? String(m.leaves) : '1'],
    ]);
  }
  function layoutTree(root) {
    let k = 0;
    const pos = {};
    (function walk(nd) {
      if (nd.leaf) { pos[nd.id] = k++; return; }
      walk(nd.left); walk(nd.right);
      pos[nd.id] = (pos[nd.left.id] + pos[nd.right.id]) / 2;
    })(root);
    return { pos, nLeaves: k };
  }
  const treeV = view($('dtTree'), () => {
    const { c, w, h } = prep($('dtTree'));
    const tr = dtM;
    TP.rects = [];
    if (!tr || !tr.nodes) { txt(c, t('noTree'), w / 2, h / 2, '#7385a6', 12, 'center'); return; }
    const { pos, nLeaves } = layoutTree(tr.root);
    const L = 14, R = 14, T = 34, Bm = 12, pw = w - L - R, ph = h - T - Bm;
    const slot = pw / nLeaves, D = tr.depth;
    const full = slot >= 70 && (D === 0 || (ph - 40) / D >= 34);
    const bw = full ? Math.min(128, slot - 8) : 0, bh = full ? 40 : 0;
    const rr = full ? 0 : clamp(slot * 0.32, 2.5, 9);
    const levelH = D ? (ph - (full ? bh : rr * 2)) / D : 0;
    const P = (nd) => [L + (pos[nd.id] + 0.5) * slot, T + (full ? bh / 2 : rr) + nd.depth * levelH];
    const pathSet = new Set(TP.path || []);
    const crit = { gini: 'gini', entropy: 'H', misclass: 'err' }[TP.crit];
    tr.nodes.forEach((nd) => {
      if (nd.leaf) return;
      [nd.left, nd.right].forEach((ch, k) => {
        const [x1, y1] = P(nd), [x2, y2] = P(ch);
        const on = pathSet.has(nd.id) && pathSet.has(ch.id);
        const yA = y1 + (full ? bh / 2 : rr), yB = y2 - (full ? bh / 2 : rr);
        c.beginPath(); c.moveTo(x1, yA); c.bezierCurveTo(x1, (yA + yB) / 2, x2, (yA + yB) / 2, x2, yB);
        stroke(c, on ? TEAL : '#34466a', on ? 2.6 : 1.3, on ? 6 : 0);
        if (full) txt(c, k ? t('no') : t('yes'), (x1 + x2) / 2 + (k ? 6 : -6), (yA + yB) / 2, on ? TEAL : '#6f82a6', 9.5, k ? 'left' : 'right', 700);
      });
    });
    tr.nodes.forEach((nd) => {
      const [x, y] = P(nd), col = classRGB(nd.p), purity = Math.abs(nd.p - 0.5) * 2;
      const hl = nd.id === TP.sel ? '#ffffff' : nd.id === TP.hoverNode ? YEL : pathSet.has(nd.id) ? TEAL : null;
      if (full) {
        roundRect(c, x - bw / 2, y - bh / 2, bw, bh, 8);
        c.fillStyle = '#0c1530'; c.fill();
        c.fillStyle = rgba(col, 0.1 + 0.25 * purity); c.fill();
        stroke(c, hl || rgba(col, 0.55), hl ? 2.4 : 1.2);
        const head = nd.leaf ? `${nd.p >= 0.5 ? '→ +1' : '→ −1'}  ${pct0(Math.max(nd.p, 1 - nd.p))}` : `x${SUB[nd.f]} ≤ ${num(nd.t)}`;
        txt(c, head, x, y - 5, nd.leaf ? rgba(col, 1) : '#eef3ff', 11.5, 'center', 800);
        txt(c, `n=${nd.n} · ${crit} ${num(nd.imp)}`, x, y + 9, '#93a4c4', 9.5, 'center', 600);
        const bx = x - bw / 2 + 8, bwi = bw - 16;
        c.fillStyle = NEG; c.fillRect(bx, y + bh / 2 - 7, bwi * (1 - nd.p), 3);
        c.fillStyle = POS; c.fillRect(bx + bwi * (1 - nd.p), y + bh / 2 - 7, bwi * nd.p, 3);
        TP.rects.push({ id: nd.id, x: x - bw / 2, y: y - bh / 2, w: bw, h: bh });
      } else {
        c.beginPath(); c.arc(x, y, rr, 0, TAU);
        c.fillStyle = rgba(mixRGB([40, 52, 80], col, 0.3 + 0.7 * purity), 1); c.fill();
        if (hl) stroke(c, hl, 2);
        TP.rects.push({ id: nd.id, x: x - rr - 2, y: y - rr - 2, w: 2 * rr + 4, h: 2 * rr + 4 });
      }
    });
    if (!full) txt(c, t('compactTree'), w - 12, h - 8, '#6f82a6', 10, 'right');
  });
  const nodeAt = (e) => {
    const r = $('dtTree').getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = TP.rects.find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
    return hit ? hit.id : -1;
  };
  $('dtTree').addEventListener('pointermove', (e) => { const id = nodeAt(e); if (id !== TP.hoverNode) { TP.hoverNode = id; treeV.dirty = true; dtB.redraw(); } $('dtTree').style.cursor = id >= 0 ? 'pointer' : 'default'; });
  $('dtTree').addEventListener('pointerleave', () => { TP.hoverNode = -1; treeV.dirty = true; dtB.redraw(); });
  $('dtTree').addEventListener('click', (e) => { const id = nodeAt(e); if (id >= 0) { TP.sel = id; treeV.dirty = true; dtB.redraw(); spUpdate(); } });
  seg('dtCrit', 'c', TP.crit, (v) => { TP.crit = v; later('dt', dtFit); });
  const dtDs = slider('dtD', (v) => String(v), (v) => { TP.depth = v; TP.grow = false; dtGrowLabel(); later('dt', dtFit); });
  slider('dtL', (v) => String(v), (v) => { TP.minLeaf = v; later('dt', dtFit); });
  $('dtLines').addEventListener('change', (e) => { TP.lines = e.target.checked; dtB.redraw(); });
  const dtGrowLabel = playBtn($('dtGrow'), () => TP.grow);
  $('dtGrow').addEventListener('click', () => {
    TP.grow = !TP.grow;
    if (TP.grow) { TP.shown = 0; TP.last = now(); TP.sel = 0; dtFit(); }
    else dtFit();
    dtGrowLabel();
  });
  tickers.push((ts) => {
    if (!TP.grow || ts - TP.last < 750) return;
    TP.last = ts;
    if (TP.shown >= TP.depth) { TP.grow = false; dtGrowLabel(); return; }
    TP.shown++;
    dtFit();
  });
  DT.on((k) => { if (k !== 'view') later('dt', dtFit); });
  refreshers.push(dtStats, dtGrowLabel);
  void dtDs;

  /* ------------------------------------------------- 3.2 split scanner */
  const SPS = { scan: null, node: null, maps: [null, null] };
  function spUpdate() {
    const nd = dtM && dtM.nodes ? dtM.nodes[TP.sel] || dtM.root : null;
    SPS.node = nd;
    SPS.scan = nd ? M.scanSplits(DT.X, DT.y, nd.ids, TP.crit) : null;
    TP.cand = null;
    spV[0].dirty = spV[1].dirty = spImpV.dirty = true;
    spStats();
  }
  function spBest() {
    if (!SPS.scan) return null;
    let best = null;
    SPS.scan.feats.forEach((pts, f) => pts.forEach(([thr, v]) => { if (!best || v < best.v - 1e-12) best = { f, t: thr, v }; }));
    return best;
  }
  function spStats() {
    const nd = SPS.node;
    if (!nd) { $('spRo').innerHTML = ''; $('spBadge').textContent = '—'; return; }
    $('spBadge').textContent = `${t('node')} #${nd.id} · ${t('depthShort')} ${nd.depth}`;
    const b = spBest(), par = SPS.scan.parent;
    const items = [
      ['nodeN', String(nd.n)], ['nodeP', num(nd.p)], ['impurity', num(par, 3)],
      ['bestSplit', b ? `x${SUB[b.f]} ≤ ${num(b.t)}` : '—'], ['gainLbl', b ? num(par - b.v, 3) : '—', 'ok'],
    ];
    if (TP.cand) items.push(['candidate', `x${SUB[TP.cand.f]} ≤ ${num(TP.cand.t)} · Δ ${num(par - TP.cand.v, 3)}`, 'warn']);
    readouts($('spRo'), items);
  }
  const spV = [0, 1].map((f) => view($(f ? 'spX2' : 'spX1'), () => {
    const cv = $(f ? 'spX2' : 'spX1');
    const sc = SPS.scan, nd = SPS.node;
    if (!sc || !nd) { const { c, w, h } = prep(cv); txt(c, t('noTree'), w / 2, h / 2, '#7385a6', 12, 'center'); return; }
    const pts = sc.feats[f];
    const vals = nd.ids.map((i) => DT.X[i][f]);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const ymax = Math.max(sc.parent, ...pts.map((p) => p[1]), 0.05) * 1.12;
    const map = plot(cv, {
      xMin: lo - 0.02, xMax: hi + 0.02, yMin: 0, yMax: ymax, xFmt: (v) => num(v, 1), yFmt: (v) => num(v, 2),
      series: [{ data: pts.map((p) => p[1]), xs: pts.map((p) => p[0]), color: f ? VIO : TEAL, width: 2.2, label: t('childImp'), noDot: true }],
      hlines: [{ v: sc.parent, color: '#ffffff88', label: t('parentImp') }],
    });
    SPS.maps[f] = map;
    const c = cv.getContext('2d');
    // rug
    nd.ids.forEach((i) => { const x = map.X(DT.X[i][f]); line(c, x, map.T + map.ph - 7, x, map.T + map.ph, DT.y[i] > 0 ? POS : NEG, 1.4); });
    if (pts.length) {
      let bi = 0;
      pts.forEach((p, i) => { if (p[1] < pts[bi][1]) bi = i; });
      const b = pts[bi], gb = spBest();
      c.beginPath(); c.arc(map.X(b[0]), map.Y(b[1]), 5, 0, TAU); c.fillStyle = YEL; c.fill();
      const star = gb && gb.f === f ? ' ★' : '';
      txt(c, `${t('best')} ${num(b[0])}${star}`, clamp(map.X(b[0]), map.L + 30, map.L + map.pw - 30), map.Y(b[1]) + 16, YEL, 10.5, 'center', 800);
    } else txt(c, t('noSplit'), map.L + map.pw / 2, map.T + map.ph / 2, '#8d9db9', 11, 'center');
    if (TP.cand && TP.cand.f === f) {
      line(c, map.X(TP.cand.t), map.T, map.X(TP.cand.t), map.T + map.ph, YEL, 1.4, [4, 3]);
      c.beginPath(); c.arc(map.X(TP.cand.t), map.Y(TP.cand.v), 4, 0, TAU); c.fillStyle = '#fff'; c.fill();
    }
  }));
  [0, 1].forEach((f) => {
    const cv = $(f ? 'spX2' : 'spX1');
    cv.addEventListener('pointermove', (e) => {
      const map = SPS.maps[f], sc = SPS.scan;
      if (!map || !sc || !sc.feats[f].length) return;
      const r = cv.getBoundingClientRect(), xv = map.x0 + ((e.clientX - r.left - map.L) / map.pw) * (map.x1 - map.x0);
      let best = sc.feats[f][0];
      sc.feats[f].forEach((p) => { if (Math.abs(p[0] - xv) < Math.abs(best[0] - xv)) best = p; });
      TP.cand = { f, t: best[0], v: best[1] };
      spV[f].dirty = true; dtB.redraw(); spStats();
    });
    cv.addEventListener('pointerleave', () => { TP.cand = null; spV[f].dirty = true; dtB.redraw(); spStats(); });
  });
  const spImpV = view($('spImp'), () => {
    const N = 100, xs = Array.from({ length: N + 1 }, (_, i) => i / N);
    const cur = TP.crit, p = SPS.node ? SPS.node.p : 0.5;
    const mk = (k, col, lbl) => ({ data: xs.map((u) => M.IMPURITY[k](u)), xs, color: col, label: lbl, width: k === cur ? 3 : 1.4, dash: k === cur ? null : [4, 3] });
    const map = plot($('spImp'), {
      xMin: 0, xMax: 1, yMin: 0, yMax: 1.05, xFmt: (v) => num(v, 1), xLabel: 'p',
      series: [mk('gini', TEAL, 'Gini'), mk('entropy', VIO, t('entropyS')), mk('misclass', NEG, t('misclassS'))],
      vlines: [{ v: p, color: YEL, label: 'p = ' + num(p) }],
    });
    const c = $('spImp').getContext('2d');
    ['gini', 'entropy', 'misclass'].forEach((k, i) => { c.beginPath(); c.arc(map.X(p), map.Y(M.IMPURITY[k](p)), 3.5, 0, TAU); c.fillStyle = [TEAL, VIO, NEG][i]; c.fill(); });
  });
  refreshers.push(spStats);

  /* ===================================================== 4.1 FOREST */
  const RP = { mode: 'rf', T: 60, depth: 10, minLeaf: 1, frac: 1, seed: 1 };
  let rfM = null, rfMs = 0, rfCurveTe = null, rfCurveTr = null, rfSingle = NaN;
  const rfB = board($('rfBoard'), { data: DR, cell: () => (RP.T > 150 ? 7 : RP.T > 60 ? 6 : 5), insp: $('rfInsp') });
  const thumbs = [...document.querySelectorAll('#rfThumbs .thumb')].map((el, k) => {
    const B = board(el.querySelector('canvas'), {
      data: DR, editable: false, cell: 3, crisp: true, levels: [], pointR: 2.2, testPts: false,
      ids: () => (rfM && rfM.inBag && rfM.inBag[k] ? [...new Set(rfM.inBag[k].ids)] : []),
      over(c, g) { if (rfM && rfM.trees && rfM.trees[k]) drawSplits(c, g, rfM.trees[k], { color: 'rgba(255,255,255,.35)', width: 1 }); },
    });
    return { el, B, cap: el.querySelector('small') };
  });
  function rfFit() {
    const t0 = now();
    rfM = fitSafe(DR, () => M.fitForest(DR.X, DR.y, {
      nTrees: RP.T, maxDepth: RP.depth, minLeaf: RP.minLeaf, maxFeatures: RP.mode === 'bag' ? 2 : 1,
      bootstrap: RP.mode !== 'extra', extra: RP.mode === 'extra', sampleFrac: RP.frac, seed: RP.seed,
    }));
    rfMs = now() - t0;
    rfB.set(rfM);
    if (rfM.trees) {
      rfCurveTe = rfM.curve(DR.Xt, DR.yt);
      rfCurveTr = rfM.curve(DR.X, DR.y);
      rfSingle = rfM.trees.reduce((s, tr) => s + acc(tr, DR.Xt, DR.yt), 0) / rfM.trees.length;
    } else { rfCurveTe = rfCurveTr = null; rfSingle = NaN; }
    thumbs.forEach((th, k) => {
      const tr = rfM.trees && rfM.trees[k];
      th.el.style.display = tr ? '' : 'none';
      if (tr) th.B.set(tr);
    });
    rfStats();
    rfCurveV.dirty = true;
  }
  function rfStats() {
    if (!rfM) return;
    const te = acc(rfM, DR.Xt, DR.yt);
    readouts($('rfRo'), [
      ['trainAcc', pct(acc(rfM, DR.X, DR.y))], ['testAcc', pct(te), 'ok'],
      ['oobAcc', RP.mode === 'extra' ? t('noOob') : pct(rfM.oob)], ['avgTree', pct(rfSingle), te > rfSingle + 0.005 ? '' : 'warn'],
      ['nTreesShort', String(RP.T)], ['fitTime', ms(rfMs)],
    ]);
    thumbs.forEach((th, k) => {
      const tr = rfM.trees && rfM.trees[k];
      if (tr) th.cap.textContent = `${t('treeN')} ${k + 1} · ${t('testShort')} ${pct0(acc(tr, DR.Xt, DR.yt))}`;
    });
  }
  const rfCurveV = view($('rfCurve'), () => {
    if (!rfCurveTe) { prep($('rfCurve')); return; }
    plot($('rfCurve'), {
      xMin: 1, xMax: Math.max(2, RP.T), yFmt: (v) => pct0(v), yMax: 1,
      yMin: Math.max(0, Math.min(rfSingle, ...rfCurveTe, ...rfCurveTr) - 0.03),
      series: [
        { data: Array.from(rfCurveTr), x0: 1, color: BLUE, label: t('trainShort'), width: 1.6 },
        { data: Array.from(rfCurveTe), x0: 1, color: TEAL, label: t('testShort'), width: 2.4 },
      ],
      hlines: [{ v: rfSingle, color: YEL, label: t('avgTreeLbl') }],
      xLabel: t('nTreesShort'),
    });
  });
  seg('rfMode', 'm', RP.mode, (m) => { RP.mode = m; later('rf', rfFit); });
  slider('rfT', (v) => String(v), (v) => { RP.T = v; later('rf', rfFit); });
  slider('rfD', (v) => String(v), (v) => { RP.depth = v; later('rf', rfFit); });
  slider('rfL', (v) => String(v), (v) => { RP.minLeaf = v; later('rf', rfFit); });
  slider('rfS', (v) => Math.round(v * 100) + '%', (v) => { RP.frac = v; later('rf', rfFit); });
  $('rfSeed').addEventListener('click', () => { RP.seed++; later('rf', rfFit); });
  DR.on((k) => { if (k !== 'view') later('rf', rfFit); });
  refreshers.push(rfStats);

  /* =================================================== 5.1 ADABOOST */
  const AP = { depth: 1, T: 100, k: 100, play: false, last: 0, weights: true };
  let abM = null, abTr = [], abTe = [], abBound = [];
  const abB = board($('abBoard'), {
    data: DA, cell: 4, insp: $('abInsp'),
    radius(i) {
      if (!AP.weights || !abM || !abM.weights) return 4.2;
      const w = abM.weights[Math.max(0, AP.k - 1)];
      return w ? clamp(1.6 + Math.sqrt(w[i] * DA.X.length) * 3.3, 1.6, 16) : 4.2;
    },
    over(c, g) {
      if (!abM || !abM.learners) return;
      const tr = abM.learners[AP.k - 1];
      if (tr) drawSplits(c, g, tr, { color: YEL, width: 3.2 });
    },
  });
  function abFit() {
    abM = fitSafe(DA, () => M.fitAdaBoost(DA.X, DA.y, { rounds: AP.T, depth: AP.depth }));
    abTr = []; abTe = []; abBound = [];
    if (abM.learners) {
      const K = abM.learners.length;
      const Ftr = new Float64Array(DA.X.length), Fte = new Float64Array(DA.Xt.length);
      let bound = 1;
      for (let t2 = 0; t2 < K; t2++) {
        const h = abM.learners[t2], a = abM.alphas[t2];
        let e1 = 0, e2 = 0;
        DA.X.forEach((p, i) => { Ftr[i] += a * (h.prob(p[0], p[1]) > 0.5 ? 1 : -1); if ((Ftr[i] > 0 ? 1 : -1) !== DA.y[i]) e1++; });
        DA.Xt.forEach((p, i) => { Fte[i] += a * (h.prob(p[0], p[1]) > 0.5 ? 1 : -1); if ((Fte[i] > 0 ? 1 : -1) !== DA.yt[i]) e2++; });
        abTr.push(e1 / Math.max(1, DA.X.length)); abTe.push(e2 / Math.max(1, DA.Xt.length));
        const e = abM.eps[t2];
        bound *= 2 * Math.sqrt(Math.max(0, e * (1 - e)));
        abBound.push(bound);
      }
      $('abK').max = K;
      if (!AP.play) AP.k = K;
      AP.k = clamp(AP.k, 1, K);
    } else { $('abK').max = 1; AP.k = 1; }
    abShow();
  }
  function abShow() {
    $('abK').value = AP.k;
    $('abKOut').textContent = abM && abM.learners ? `${AP.k} / ${abM.learners.length}` : '—';
    if (!abM) return;
    abB.set(abM.at ? Object.assign({ type: 'adaboost' }, abM.at(AP.k)) : abM);
    const k = AP.k - 1, has = abM.learners && abM.learners.length;
    readouts($('abRo'), [
      ['epsT', has ? num(abM.eps[k], 3) : '—', has && abM.eps[k] > 0.45 ? 'warn' : ''], ['alphaT', has ? num(abM.alphas[k], 3) : '—'],
      ['trainErr', has ? pct(abTr[k]) : '—'], ['testErr', has ? pct(abTe[k]) : '—', 'ok'],
      ['expBound', has ? num(abBound[k], 3) : '—'], ['stopped', has && abM.learners.length < AP.T ? t('earlyStop', { k: abM.learners.length }) : '—'],
    ]);
    abCurveV.dirty = abEpsV.dirty = true;
  }
  const abCurveV = view($('abCurve'), () => {
    if (!abTr.length) { prep($('abCurve')); return; }
    plot($('abCurve'), {
      xMin: 1, xMax: Math.max(2, abTr.length), yMin: 0, yMax: Math.max(0.3, ...abTe.slice(0, 3), ...abTr.slice(0, 3)) * 1.05, yFmt: (v) => pct0(v), mark: AP.k,
      series: [
        { data: abBound, x0: 1, color: YEL, dash: [5, 4], label: t('boundLbl'), width: 1.5 },
        { data: abTr, x0: 1, color: BLUE, label: t('trainShort') },
        { data: abTe, x0: 1, color: TEAL, label: t('testShort'), width: 2.4 },
      ],
      xLabel: t('roundLbl'),
    });
  });
  const abEpsV = view($('abEps'), () => {
    if (!abM || !abM.learners) { prep($('abEps')); return; }
    const amax = Math.max(...abM.alphas, 0.1);
    const map = plot($('abEps'), {
      xMin: 1, xMax: Math.max(2, abM.eps.length), yMin: 0, yMax: 0.6, yFmt: (v) => num(v, 1), mark: AP.k, R: 34,
      series: [
        { type: 'bar', data: abM.alphas.map((a) => (a / amax) * 0.6), x0: 1, color: 'rgba(166,139,255,.45)', label: 'α (' + t('rightAxis') + ')' },
        { data: abM.eps, x0: 1, color: NEG, label: 'ε', width: 2 },
      ],
      hlines: [{ v: 0.5, color: '#ffffff88', label: t('coinFlip') }],
      xLabel: t('roundLbl'),
    });
    const c = $('abEps').getContext('2d');
    for (let i = 0; i <= 2; i++) txt(c, num((amax * i) / 2, 1), map.L + map.pw + 4, map.Y((0.6 * i) / 2) + 3, '#a68bff', 9.5, 'left');
  });
  seg('abDepth', 'd', AP.depth, (d) => { AP.depth = +d; later('ab', abFit); });
  slider('abT', (v) => String(v), (v) => { AP.T = v; later('ab', abFit); });
  $('abK').addEventListener('input', (e) => { AP.k = +e.target.value; AP.play = false; abPlayLabel(); abShow(); });
  $('abPrev').addEventListener('click', () => { AP.k = Math.max(1, AP.k - 1); abShow(); });
  $('abNext').addEventListener('click', () => { AP.k = Math.min(+$('abK').max, AP.k + 1); abShow(); });
  $('abW').addEventListener('change', (e) => { AP.weights = e.target.checked; abB.redraw(); });
  const abPlayLabel = playBtn($('abPlay'), () => AP.play);
  $('abPlay').addEventListener('click', () => { AP.play = !AP.play; if (AP.play && AP.k >= +$('abK').max) AP.k = 1; abPlayLabel(); abShow(); });
  tickers.push((ts) => {
    if (!AP.play || ts - AP.last < 140) return;
    AP.last = ts;
    if (AP.k >= +$('abK').max) { AP.play = false; abPlayLabel(); return; }
    AP.k++; abShow();
  });
  DA.on((k) => { if (k !== 'view') later('ab', abFit); });
  refreshers.push(abShow, abPlayLabel);

  /* ============================================ 5.2 GRADIENT BOOSTING */
  const GP = { eta: Math.pow(10, -0.7), T: 200, depth: 2, lambda: 1, sub: 1, k: 200, play: false, last: 0, resid: true, best: 0 };
  let gbM = null, gbMs = 0;
  const gbB = board($('gbBoard'), {
    data: DB, cell: 5, insp: $('gbInsp'),
    over(c, g) {
      if (!GP.resid || !gbM || !gbM.resid) return;
      const cur = gbM.at ? gbM.at(GP.k) : gbM;
      DB.X.forEach((p, i) => {
        const r = (DB.y[i] > 0 ? 1 : 0) - cur.prob(p[0], p[1]);
        const a = Math.abs(r);
        if (a < 0.08) return;
        ring(c, g.X(p[0]), g.Y(p[1]), 5 + a * 11, `rgba(255,203,87,${0.25 + 0.6 * a})`, 1.6);
      });
    },
  });
  function gbFit() {
    const t0 = now();
    gbM = fitSafe(DB, () => M.fitGradBoost(DB.X, DB.y, { rounds: GP.T, lr: GP.eta, depth: GP.depth, lambda: GP.lambda, subsample: GP.sub, Xt: DB.Xt, yt: DB.yt, seed: 3 }));
    gbMs = now() - t0;
    if (gbM.hist) {
      const tl = gbM.hist.testLoss;
      GP.best = tl.reduce((b, v, i) => (v < tl[b] ? i : b), 0);
    }
    $('gbK').max = GP.T;
    if (!GP.play) GP.k = GP.T;
    GP.k = clamp(GP.k, 0, GP.T);
    gbShow();
  }
  function gbShow() {
    $('gbK').value = GP.k;
    $('gbKOut').textContent = `${GP.k} / ${GP.T}`;
    if (!gbM) return;
    gbB.set(gbM.at ? Object.assign({ type: 'gboost' }, gbM.at(GP.k)) : gbM);
    const H = gbM.hist, k = GP.k;
    readouts($('gbRo'), [
      ['trainLoss', H ? num(H.trainLoss[k], 3) : '—'], ['testLoss', H ? num(H.testLoss[k], 3) : '—', H && k > GP.best * 1.5 + 10 ? 'warn' : ''],
      ['trainAcc', H ? pct(1 - H.trainErr[k]) : '—'], ['testAcc', H ? pct(1 - H.testErr[k]) : '—', 'ok'],
      ['bestRound', H ? String(GP.best) : '—', 'ok'], ['fitTime', ms(gbMs)],
    ]);
    gbCurveV.dirty = true;
  }
  const gbCurveV = view($('gbCurve'), () => {
    if (!gbM || !gbM.hist) { prep($('gbCurve')); return; }
    const H = gbM.hist;
    plot($('gbCurve'), {
      xMin: 0, xMax: Math.max(1, GP.T), yMin: 0, yMax: Math.max(0.75, ...H.testLoss.slice(0, 1)) * 1.05, mark: GP.k,
      series: [
        { data: H.trainLoss, color: BLUE, label: t('trainShort') },
        { data: H.testLoss, color: TEAL, label: t('testShort'), width: 2.4 },
      ],
      vlines: [{ v: GP.best, color: YEL, label: t('bestRoundLbl') }],
      xLabel: t('roundLbl'),
    });
  });
  slider('gbEta', (v) => sci(Math.pow(10, v)), (v) => { GP.eta = Math.pow(10, v); later('gb', gbFit); });
  slider('gbT', (v) => String(v), (v) => { GP.T = v; later('gb', gbFit); });
  slider('gbD', (v) => String(v), (v) => { GP.depth = v; later('gb', gbFit); });
  slider('gbL', (v) => num(v, 1), (v) => { GP.lambda = v; later('gb', gbFit); });
  slider('gbS', (v) => Math.round(v * 100) + '%', (v) => { GP.sub = v; later('gb', gbFit); });
  $('gbK').addEventListener('input', (e) => { GP.k = +e.target.value; GP.play = false; gbPlayLabel(); gbShow(); });
  $('gbBest').addEventListener('click', () => { GP.k = GP.best; GP.play = false; gbPlayLabel(); gbShow(); });
  $('gbR').addEventListener('change', (e) => { GP.resid = e.target.checked; gbB.redraw(); });
  const gbPlayLabel = playBtn($('gbPlay'), () => GP.play);
  $('gbPlay').addEventListener('click', () => { GP.play = !GP.play; if (GP.play && GP.k >= GP.T) GP.k = 0; gbPlayLabel(); gbShow(); });
  tickers.push((ts) => {
    if (!GP.play || ts - GP.last < 60) return;
    GP.last = ts;
    if (GP.k >= GP.T) { GP.play = false; gbPlayLabel(); return; }
    GP.k = Math.min(GP.T, GP.k + Math.max(1, Math.round(GP.T / 120))); gbShow();
  });
  DB.on((k) => { if (k !== 'view') later('gb', gbFit); });
  refreshers.push(gbShow, gbPlayLabel);

  /* ============================================================ TABS */
  document.querySelectorAll('#moreTabs button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('#moreTabs button').forEach((x) => x.classList.toggle('on', x === b));
    document.querySelectorAll('#more .tab-pane').forEach((p) => { p.hidden = p.id !== b.dataset.tab; });
    markAll();
  }));
  // deep links such as ml-lab/#simNn open the matching tab
  const openTab = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const b = id && document.querySelector(`#moreTabs button[data-tab="${id}"]`);
    if (!b) return;
    b.click();
    requestAnimationFrame(() => $(id).scrollIntoView({ block: 'start' }));
  };
  window.addEventListener('hashchange', openTab);
  setTimeout(openTab, 0);

  /* ========================================================= 6.1 kNN */
  const KP = { k: 5, metric: 'euclid', weighted: false, curve: null };
  let knnM = null;
  const knnB = board($('knnBoard'), {
    data: DK, cell: 5, insp: $('knnInsp'),
    over(c, g) {
      if (!knnB.hover || !knnM || !knnM.nearest || !DK.X.length) return;
      const [hx, hy] = knnB.hover, { bd, bi } = knnM.nearest(hx, hy);
      const kk = bi.filter((i) => i >= 0).length;
      const rad = bd[kk - 1] * g.s, X0 = g.X(hx), Y0 = g.Y(hy);
      c.beginPath();
      if (KP.metric === 'euclid') c.arc(X0, Y0, rad, 0, TAU);
      else if (KP.metric === 'manhattan') { c.moveTo(X0 + rad, Y0); c.lineTo(X0, Y0 + rad); c.lineTo(X0 - rad, Y0); c.lineTo(X0, Y0 - rad); c.closePath(); }
      else c.rect(X0 - rad, Y0 - rad, 2 * rad, 2 * rad);
      c.fillStyle = 'rgba(255,203,87,.06)'; c.fill();
      stroke(c, YEL, 1.6, 0, [5, 4]);
      for (let j = 0; j < kk; j++) {
        const p = DK.X[bi[j]];
        line(c, X0, Y0, g.X(p[0]), g.Y(p[1]), 'rgba(255,203,87,.55)', 1.2);
        ring(c, g.X(p[0]), g.Y(p[1]), 7, YEL, 1.8);
      }
    },
    inspect(x, y) {
      if (!knnM || !knnM.nearest || !DK.X.length) return '';
      const { bi } = knnM.nearest(x, y);
      let pos = 0, neg = 0;
      bi.forEach((i) => { if (i >= 0) (DK.y[i] > 0 ? pos++ : neg++); });
      const p = knnM.prob(x, y);
      return `k = ${KP.k}: <b style="color:var(--pos)">${pos} × (+1)</b> · <b style="color:var(--neg)">${neg} × (−1)</b> → ${p > 0.5 ? '<b style="color:var(--pos)">+1</b>' : p < 0.5 ? '<b style="color:var(--neg)">−1</b>' : t('tie')}${KP.weighted ? ` · ${t('weightedP')} ${num(p)}` : ''}`;
    },
  });
  function knnFit() {
    knnM = fitSafe(DK, () => M.fitKNN(DK.X, DK.y, KP));
    knnB.set(knnM);
    knnStats();
  }
  function knnCurve() {
    const n = DK.X.length, K = Math.min(51, n);
    if (!trainable(DK)) { KP.curve = null; knnCurveV.dirty = true; return; }
    const dist = M.METRICS[KP.metric];
    const evalSet = (X, y) => {
      const ok = new Float64Array(K);
      X.forEach((p, idx) => {
        const ds = DK.X.map((q, i) => [dist(p[0], p[1], q[0], q[1]), i]).sort((a, b) => a[0] - b[0]);
        let s = 0, sw = 0;
        for (let k = 0; k < K; k++) {
          const [d, i] = ds[k], wt = KP.weighted ? 1 / (d + 1e-3) : 1;
          sw += wt; if (DK.y[i] > 0) s += wt;
          if ((s / sw > 0.5 ? 1 : -1) === y[idx]) ok[k]++;
        }
      });
      return Array.from(ok, (v) => v / Math.max(1, X.length));
    };
    KP.curve = { tr: evalSet(DK.X, DK.y), te: evalSet(DK.Xt, DK.yt) };
    knnCurveV.dirty = true;
  }
  function knnStats() {
    if (!knnM) return;
    let bestK = '—';
    if (KP.curve) { const te = KP.curve.te; bestK = String(te.reduce((b, v, i) => (v > te[b] + 1e-9 ? i : b), 0) + 1); }
    readouts($('knnRo'), [['trainAcc', pct(acc(knnM, DK.X, DK.y))], ['testAcc', pct(acc(knnM, DK.Xt, DK.yt)), 'ok'], ['bestK', bestK, 'ok'], ['kOverN', `${KP.k} / ${DK.X.length}`]]);
    knnCurveV.dirty = true;
  }
  let knnMap = null;
  const knnCurveV = view($('knnCurve'), () => {
    if (!KP.curve) { prep($('knnCurve')); return; }
    knnMap = plot($('knnCurve'), {
      xMin: 1, xMax: KP.curve.te.length, yFmt: (v) => pct0(v), mark: KP.k, L: 36, T: 26, yMax: 1,
      yMin: Math.max(0, Math.min(...KP.curve.te, ...KP.curve.tr) - 0.03),
      series: [{ data: KP.curve.tr, x0: 1, color: BLUE, label: t('trainShort'), width: 1.6 }, { data: KP.curve.te, x0: 1, color: TEAL, label: t('testShort'), width: 2.2 }],
    });
  });
  const knnK = slider('knnK', (v) => String(v), (v) => { KP.k = v; later('knn', () => { knnFit(); }); });
  $('knnCurve').addEventListener('click', (e) => {
    if (!knnMap) return;
    const r = $('knnCurve').getBoundingClientRect();
    const k = Math.round(knnMap.x0 + ((e.clientX - r.left - knnMap.L) / knnMap.pw) * (knnMap.x1 - knnMap.x0));
    if (k >= 1 && k <= 51) { KP.k = k; knnK.set(k); knnFit(); }
  });
  seg('knnMetric', 'm', KP.metric, (m) => { KP.metric = m; later('knn', () => { knnFit(); knnCurve(); knnStats(); }); });
  $('knnW').addEventListener('change', (e) => { KP.weighted = e.target.checked; later('knn', () => { knnFit(); knnCurve(); knnStats(); }); });
  DK.on((k) => { if (k !== 'view') later('knn', () => { knnFit(); knnCurve(); knnStats(); }); });
  refreshers.push(knnStats);

  /* ================================================= 6.2 LOGISTIC */
  const LP = { degree: 1, lambda: 0, eta: 0.1, play: true, maxEpoch: 3000, tick: 0 };
  let lrM = null;
  const lrB = board($('lrBoard'), { data: DL, cell: 5, insp: $('lrInsp') });
  const lrWrap = () => ({ type: 'logreg', score: lrM.score, prob: lrM.prob });
  function lrReset() {
    lrM = M.makeLogReg(DL.X, DL.y, { degree: LP.degree, lambda: LP.lambda, lr: LP.eta });
    if (!LP.play) lrM.step(1);
    lrB.set(lrWrap());
    lrStats();
  }
  const mono = (a, b) => (a ? `x_1${a > 1 ? '^' + a : ''}` : '') + (b ? `x_2${b > 1 ? '^' + b : ''}` : '');
  function lrStats() {
    if (!lrM) return;
    const D = lrM.terms.length, w = lrM.w;
    let nrm = 0;
    for (let k = 0; k < D; k++) nrm += w[k] * w[k];
    const L = lrM.loss.length ? lrM.loss[lrM.loss.length - 1] : NaN;
    readouts($('lrRo'), [
      ['epoch', String(lrM.epoch)], ['loss', num(L, 4)], ['trainAcc', pct(acc(lrM, DL.X, DL.y))], ['testAcc', pct(acc(lrM, DL.Xt, DL.yt)), 'ok'],
      ['nFeat', String(D)], ['wNorm', num(Math.sqrt(nrm), 2)],
    ]);
    if (D <= 9) {
      const terms = lrM.terms.map((tm, k) => `${k && w[k] >= 0 ? '+' : w[k] < 0 ? '-' : ''}${num(Math.abs(w[k]), 2)}\\,${mono(tm[0], tm[1])}`).join(' ');
      renderTex($('lrEq'), `z=${terms}${w[D] >= 0 ? '+' : '-'}${num(Math.abs(w[D]), 2)}`);
    } else renderTex($('lrEq'), `z=w^\\top\\phi(x)+b,\\ \\ \\phi(x)\\in\\mathbb R^{${D}}`);
  }
  const lrCurveV = view($('lrCurve'), () => {
    if (!lrM || !lrM.loss.length) { prep($('lrCurve')); return; }
    plot($('lrCurve'), { xMin: 0, xMax: Math.max(10, lrM.loss.length), yMin: 0, L: 38, T: 26, series: [{ data: lrM.loss, color: YEL, label: t('loss'), width: 2 }] });
  });
  slider('lrD', (v) => String(v), (v) => { LP.degree = v; later('lr', lrReset); });
  slider('lrL', (v) => (v <= -4.95 ? t('off') : sci(Math.pow(10, v))), (v) => { LP.lambda = v <= -4.95 ? 0 : Math.pow(10, v); later('lr', lrReset); });
  slider('lrEta', (v) => sci(Math.pow(10, v)), (v) => { LP.eta = Math.pow(10, v); if (lrM) lrM.opt.lr = LP.eta; });
  const lrPlayLabel = () => { const b = $('lrPlay'); b.innerHTML = LP.play ? labelOf(b, 'pause') : t('playBtn'); };
  $('lrPlay').addEventListener('click', () => { LP.play = !LP.play; if (LP.play && lrM.epoch >= LP.maxEpoch) LP.maxEpoch = lrM.epoch + 3000; lrPlayLabel(); });
  $('lrReset').addEventListener('click', () => { LP.maxEpoch = 3000; lrReset(); });
  tickers.push(() => {
    if (!LP.play || !lrM || !lrB.view.visible || lrM.epoch >= LP.maxEpoch) return;
    lrM.step(lrM.epoch < 200 ? 2 : 6);
    lrB.set(lrWrap());
    lrCurveV.dirty = true;
    if (++LP.tick % 6 === 0) lrStats();
  });
  DL.on((k) => { if (k !== 'view') { LP.maxEpoch = 3000; later('lr', lrReset); } });
  refreshers.push(lrStats, lrPlayLabel);

  /* ================================================= 6.3 GAUSSIAN */
  const GSP = { mode: 'qda', ell: true };
  let gsM = null;
  function ellipse(c, g, mu, S, k, col, dash) {
    const a = S[0], b = S[1], d = S[2];
    const tr = (a + d) / 2, df = Math.sqrt(((a - d) / 2) ** 2 + b * b);
    const l1 = tr + df, l2 = Math.max(1e-9, tr - df), th = 0.5 * Math.atan2(2 * b, a - d);
    c.beginPath();
    c.ellipse(g.X(mu[0]), g.Y(mu[1]), Math.sqrt(l1) * k * g.s, Math.sqrt(l2) * k * g.s, -th, 0, TAU);
    stroke(c, col, 1.8, 0, dash);
  }
  const gsB = board($('gsBoard'), {
    data: DGs, cell: 5, insp: $('gsInsp'),
    over(c, g) {
      if (!GSP.ell || !gsM || !gsM.parts) return;
      gsM.parts.forEach((pt, k) => {
        const col = k ? POS : NEG;
        ellipse(c, g, pt.mu, pt.S, 1, col, null);
        ellipse(c, g, pt.mu, pt.S, 2, col, [5, 4]);
        const x = g.X(pt.mu[0]), y = g.Y(pt.mu[1]);
        line(c, x - 7, y, x + 7, y, '#fff', 2.4); line(c, x, y - 7, x, y + 7, '#fff', 2.4);
        line(c, x - 6, y, x + 6, y, col, 1.4); line(c, x, y - 6, x, y + 6, col, 1.4);
      });
    },
  });
  function gsFit() {
    gsM = fitSafe(DGs, () => M.fitGaussian(DGs.X, DGs.y, { mode: GSP.mode }));
    gsB.set(gsM);
    gsStats();
  }
  function gsStats() {
    if (!gsM) return;
    const pos = DGs.y.filter((v) => v > 0).length;
    readouts($('gsRo'), [
      ['trainAcc', pct(acc(gsM, DGs.X, DGs.y))], ['testAcc', pct(acc(gsM, DGs.Xt, DGs.yt)), 'ok'],
      ['prior', num(pos / Math.max(1, DGs.X.length))], ['boundaryType', t(GSP.mode === 'lda' ? 'linearB' : 'quadB')],
      ['nParams', GSP.mode === 'nb' ? '2 × (2 + 2)' : GSP.mode === 'lda' ? '2 × 2 + 3' : '2 × (2 + 3)'],
    ]);
    $('gsNote').innerHTML = t('gsNote_' + GSP.mode);
  }
  seg('gsMode', 'm', GSP.mode, (m) => { GSP.mode = m; later('gs', gsFit); });
  $('gsEll').addEventListener('change', (e) => { GSP.ell = e.target.checked; gsB.redraw(); });
  DGs.on((k) => { if (k !== 'view') later('gs', gsFit); });
  refreshers.push(gsStats);

  /* =============================================== 6.4 NEURAL NET */
  const NP = { layers: 2, units: 8, act: 'tanh', eta: Math.pow(10, -1.5), lambda: 0, play: true, maxEpoch: 6000, tick: 0, hover: null };
  let nnM = null;
  const nnWrap = () => ({ type: 'mlp', score: nnM.score, prob: nnM.prob });
  const nnB = board($('nnBoard'), {
    data: DN, cell: 6, insp: $('nnInsp'),
    onHover(x, y) { NP.hover = x == null ? null : [x, y]; nnNetV.dirty = true; },
  });
  function nnReset() {
    nnM = M.makeMLP(DN.X, DN.y, { hidden: Array(NP.layers).fill(NP.units), act: NP.act, lr: NP.eta, lambda: NP.lambda, seed: Math.floor(Math.random() * 1e6) });
    nnB.set(nnWrap());
    nnStats();
    nnNetV.dirty = true;
  }
  function nnStats() {
    if (!nnM) return;
    const params = nnM.Wt.reduce((s, w) => s + w.length, 0) + nnM.B.reduce((s, b) => s + b.length, 0);
    const L = nnM.loss.length ? nnM.loss[nnM.loss.length - 1] : NaN;
    readouts($('nnRo'), [
      ['epoch', String(nnM.epoch)], ['loss', num(L, 4)], ['trainAcc', pct(acc(nnM, DN.X, DN.y))], ['testAcc', pct(acc(nnM, DN.Xt, DN.yt)), 'ok'],
      ['nParamsNN', String(params)], ['arch', nnM.sizes.join('-')],
    ]);
  }
  const nnNetV = view($('nnNet'), () => {
    const { c, w, h } = prep($('nnNet'));
    if (!nnM) return;
    const sz = nnM.sizes, L = sz.length, acts = NP.hover ? nnM.activations(NP.hover[0], NP.hover[1]) : null;
    const maxN = Math.max(...sz), gap = Math.min(26, (h - 60) / Math.max(1, maxN - 1));
    const xs = sz.map((_, l) => 46 + (l * (w - 150)) / (L - 1));
    const ys = sz.map((n) => Array.from({ length: n }, (_, j) => h / 2 + 6 + (j - (n - 1) / 2) * gap));
    let mx = 1e-6;
    nnM.Wt.forEach((W) => W.forEach((v) => { mx = Math.max(mx, Math.abs(v)); }));
    for (let l = 0; l < L - 1; l++) {
      const fi = sz[l], fo = sz[l + 1];
      for (let j = 0; j < fo; j++) for (let i = 0; i < fi; i++) {
        const v = nnM.Wt[l][j * fi + i], a = Math.abs(v) / mx;
        line(c, xs[l], ys[l][i], xs[l + 1], ys[l + 1][j], v > 0 ? `rgba(69,217,245,${0.08 + 0.7 * a})` : `rgba(255,93,158,${0.08 + 0.7 * a})`, 0.4 + 2.6 * a);
      }
    }
    for (let l = 0; l < L; l++) {
      for (let j = 0; j < sz[l]; j++) {
        let v = acts ? acts[l][j] : null;
        if (v != null && l === L - 1) v = sig(v) * 2 - 1;
        if (v != null && NP.act === 'sigmoid' && l > 0 && l < L - 1) v = v * 2 - 1;
        c.beginPath(); c.arc(xs[l], ys[l][j], 7.5, 0, TAU);
        c.fillStyle = v == null ? '#16223b' : rgba(v >= 0 ? POS_RGB : NEG_RGB, 0.25 + 0.75 * Math.min(1, Math.abs(v)));
        c.fill(); stroke(c, '#5a6c92', 1.2);
      }
      const lbl = l === 0 ? t('inputL') : l === L - 1 ? t('outputL') : `${t('hiddenL')} ${l}`;
      txt(c, lbl, xs[l], h - 10, '#8a9bbd', 10, 'center', 700);
    }
    txt(c, 'x₁', xs[0] - 14, ys[0][0] + 4, '#cdd8ef', 11, 'right', 700);
    txt(c, 'x₂', xs[0] - 14, ys[0][1] + 4, '#cdd8ef', 11, 'right', 700);
    const outP = acts ? sig(acts[L - 1][0]) : null;
    txt(c, outP == null ? 'P(+1)' : `P(+1) = ${num(outP)}`, xs[L - 1] + 12, ys[L - 1][0] + 4, '#cdd8ef', 11, 'left', 700);
    if (!acts) txt(c, t('hoverNet'), w / 2, 40, '#6f82a6', 10.5, 'center');
  });
  const nnCurveV = view($('nnCurve'), () => {
    if (!nnM || !nnM.loss.length) { prep($('nnCurve')); return; }
    plot($('nnCurve'), { xMin: 0, xMax: Math.max(10, nnM.loss.length), yMin: 0, series: [{ data: nnM.loss, color: YEL, label: t('loss'), width: 2 }], xLabel: t('epoch') });
  });
  slider('nnL', (v) => String(v), (v) => { NP.layers = v; later('nn', nnReset); });
  slider('nnU', (v) => String(v), (v) => { NP.units = v; later('nn', nnReset); });
  seg('nnAct', 'a', NP.act, (a) => { NP.act = a; later('nn', nnReset); });
  slider('nnEta', (v) => sci(Math.pow(10, v)), (v) => { NP.eta = Math.pow(10, v); if (nnM) nnM.opt.lr = NP.eta; });
  slider('nnLam', (v) => (v <= -5.95 ? t('off') : sci(Math.pow(10, v))), (v) => { NP.lambda = v <= -5.95 ? 0 : Math.pow(10, v); if (nnM) nnM.opt.lambda = NP.lambda; });
  const nnPlayLabel = () => { const b = $('nnPlay'); b.innerHTML = NP.play ? labelOf(b, 'pause') : t('playBtn'); };
  $('nnPlay').addEventListener('click', () => { NP.play = !NP.play; if (NP.play && nnM.epoch >= NP.maxEpoch) NP.maxEpoch = nnM.epoch + 4000; nnPlayLabel(); });
  $('nnReset').addEventListener('click', () => { NP.maxEpoch = 6000; nnReset(); });
  tickers.push(() => {
    if (!NP.play || !nnM || !nnB.view.visible || nnM.epoch >= NP.maxEpoch) return;
    nnM.step(DN.X.length > 250 ? 1 : 2);
    nnB.set(nnWrap());
    if (++NP.tick % 3 === 0) { nnCurveV.dirty = true; nnNetV.dirty = true; }
    if (NP.tick % 8 === 0) nnStats();
  });
  DN.on((k) => {
    if (k === 'view') return;
    if (k === 'regen') later('nn', nnReset);
    else if (nnM) { if (nnM.epoch >= NP.maxEpoch) NP.maxEpoch = nnM.epoch + 3000; nnB.set(nnWrap()); nnStats(); }
  });
  refreshers.push(nnStats, nnPlayLabel);

  /* ============================================================ 7 ARENA */
  const AR = { job: 0, res: {}, total: 0 };
  const arPanels = [...document.querySelectorAll('#arenaGrid .lad')].map((el, i) => ({
    el, spec: ARENA[i], B: board(el.querySelector('canvas'), { data: DAr, cell: 5, pointR: 3, levels: [{ v: 0, color: '#fff', width: 2, glow: 5 }] }), stats: el.querySelector('.lad-stats'),
  }));
  function arRun() {
    const job = ++AR.job;
    AR.res = {}; AR.total = 0;
    let i = 0;
    const step = () => {
      if (job !== AR.job) return;
      if (i >= arPanels.length) { arStats(); return; }
      const P = arPanels[i++];
      const t0 = now();
      const m = fitSafe(DAr, () => P.spec.fit(DAr));
      const dt = now() - t0;
      AR.total += dt;
      const wrapped = m.type === 'logreg' || m.type === 'mlp' ? { type: m.type, score: m.score, prob: m.prob } : m;
      AR.res[P.spec.id] = { m: wrapped, tr: acc(m, DAr.X, DAr.y), te: acc(m, DAr.Xt, DAr.yt), ms: dt };
      P.B.set(wrapped);
      arStats();
      setTimeout(step, 0);
    };
    arStats();
    step();
  }
  function arStats() {
    const done = Object.keys(AR.res).length;
    $('arStatus').textContent = done < ARENA.length ? `${t('training')} ${done}/${ARENA.length}…` : t('arDone', { ms: Math.round(AR.total) });
    arPanels.forEach((P) => {
      const r = AR.res[P.spec.id];
      P.stats.innerHTML = r ? `${t('trainShort')} <b>${pct0(r.tr)}</b> · ${t('testShort')} <b style="color:var(--teal)">${pct0(r.te)}</b> · ${ms(r.ms)}` : '…';
    });
    const rows = ARENA.map((a) => ({ a, r: AR.res[a.id] })).filter((x) => x.r).sort((p, q) => q.r.te - p.r.te || p.r.ms - q.r.ms);
    const lo = 0.4;
    $('arLb').innerHTML = rows.map(({ a, r }, k) => `
      <div class="lb-row"><span class="rk">${k + 1}</span><span class="nm">${t('ar_' + a.id)}</span>
      <span class="bar"><i style="width:${(clamp((r.te - lo) / (1 - lo), 0, 1) * 100).toFixed(1)}%"></i><s style="inset-inline-start:${(clamp((r.tr - lo) / (1 - lo), 0, 1) * 100).toFixed(1)}%"></s></span>
      <span class="vals">${t('testShort')} <b>${pct(r.te)}</b> · ${t('trainShort')} ${pct(r.tr)}</span><span class="ms">${ms(r.ms)}</span></div>`).join('');
  }
  let arTimer = 0;
  DAr.on((k) => { if (k !== 'view') { clearTimeout(arTimer); arTimer = setTimeout(arRun, k === 'edit' ? 350 : 120); } });
  refreshers.push(arStats);

  /* ============================================================ HERO */
  const hero = { t: 0, pts: null };
  const heroV = view($('heroCanvas'), () => {
    const { c, w, h } = prep($('heroCanvas'));
    const tt = hero.t;
    if (!hero.pts) {
      const r = M.rng(5);
      hero.pts = Array.from({ length: 70 }, () => [r(), r(), r()]);
    }
    const cs = [[0.3, 0.4, 1], [0.7, 0.55, -1], [0.5, 0.2, -0.8], [0.15, 0.75, -0.6], [0.85, 0.25, 0.9]];
    const F = (x, y) => {
      let s = 0;
      cs.forEach(([a, b, wgt], k) => {
        const ax = a + 0.07 * Math.sin(tt * 0.5 + k * 1.7), by = b + 0.07 * Math.cos(tt * 0.4 + k);
        s += wgt * Math.exp(-((x - ax) ** 2 * 9 + (y - by) ** 2 * 16));
      });
      return s;
    };
    const cols = 64, rows = 30, S = new Float32Array(cols * rows);
    for (let r2 = 0; r2 < rows; r2++) for (let q = 0; q < cols; q++) S[r2 * cols + q] = F((q + 0.5) / cols, (r2 + 0.5) / rows);
    const g = { w, h };
    [-0.4, -0.2, 0, 0.2, 0.4].forEach((lv, k) => contour(c, { S, cols, rows }, g, lv, { color: lv === 0 ? 'rgba(255,255,255,.35)' : rgba(lv > 0 ? POS_RGB : NEG_RGB, 0.22 - Math.abs(lv) * 0.2), width: lv === 0 ? 2 : 1.2 }));
    hero.pts.forEach(([x, y]) => {
      const s = F(x, y);
      c.beginPath(); c.arc(x * w, y * h, 2.6, 0, TAU);
      c.fillStyle = s > 0 ? 'rgba(69,217,245,.55)' : 'rgba(255,93,158,.55)'; c.fill();
    });
  });
  tickers.push((ts) => { if (heroV.visible) { hero.t = ts / 1000; heroV.dirty = true; } });

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

  function frame(ts) {
    for (const f of tickers) { try { f(ts); } catch (e) { console.error(e); } }
    if (jobs.size) {
      const js = [...jobs.values()];
      jobs.clear();
      js.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    }
    for (const v of views) {
      if (v.dirty && v.visible) {
        v.dirty = false;
        try { v.draw(); } catch (e) { console.error(e); }
      }
    }
    requestAnimationFrame(frame);
  }

  manUpdate();
  svmCtrlState(); svmFit(); ladFit();
  cgRun();
  k3Best();
  dtFit();
  rfFit();
  abFit();
  gbFit();
  knnFit(); knnCurve(); knnStats();
  lrReset();
  gsFit();
  nnReset();
  arRun();
  applyLang();
  onScroll();
  requestAnimationFrame(frame);
  window.__mlLabReady = true;
})();
