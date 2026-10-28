/* Signal Lab — interactive simulators for signal processing.
 * © Mohammad Khalooei (mohammad.khalooei@sharif.edu · khalooei@aut.ac.ir)
 * Plain JavaScript + Canvas 2D + Web Audio. No build step. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const TAU = Math.PI * 2;
  const COLORS = ['#ff5d9e', '#ffcb57', '#45d9f5', '#a68bff'];
  const I18N = window.SL_I18N || { fa: {}, dyn: { en: {}, fa: {} } };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (u) => u * u * (3 - 2 * u);

  /* ---------------------------------------------------------------- i18n */
  let lang = 'en';
  try { lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('signalLabLang') || ''; } catch (e) { lang = ''; }
  if (lang !== 'en' && lang !== 'fa') lang = /^fa/i.test(navigator.language || '') ? 'fa' : 'en';
  const t = (k) => {
    const d = I18N.dyn;
    if (d[lang] && d[lang][k] != null) return d[lang][k];
    return d.en[k] != null ? d.en[k] : k;
  };
  const originals = new Map();
  document.querySelectorAll('[data-i18n]').forEach((el) => originals.set(el, el.innerHTML));
  const labelOf = (el) => {
    const k = el.dataset.i18n;
    return lang === 'fa' && I18N.fa[k] != null ? I18N.fa[k] : originals.get(el);
  };
  const refreshers = [];
  function applyLang() {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'fa' ? 'rtl' : 'ltr';
    originals.forEach((_, el) => { el.innerHTML = labelOf(el); });
    document.querySelectorAll('button').forEach((b) => { if (b._on) b.innerHTML = t('stop'); });
    $('langBtn').textContent = lang === 'fa' ? 'English' : 'فارسی';
    document.title = t('docTitle');
    refreshers.forEach((f) => f());
    markAll();
  }
  $('langBtn').addEventListener('click', () => {
    lang = lang === 'fa' ? 'en' : 'fa';
    try { localStorage.setItem('signalLabLang', lang); } catch (e) { /* storage unavailable */ }
    applyLang();
  });
  const fontFamily = () => (lang === 'fa' ? 'Vazirmatn, Inter, sans-serif' : 'Inter, system-ui, sans-serif');

  /* --------------------------------------------------------- formatting */
  const fmtHz = (f) => {
    const a = Math.abs(f);
    if (a >= 1000) return (f / 1000).toFixed(a >= 10000 ? 1 : 2) + ' kHz';
    return f.toFixed(a < 10 ? 2 : a < 100 ? 1 : 0) + ' Hz';
  };
  const fmtS = (s) => (s >= 1 ? s.toFixed(3) + ' s' : s >= 1e-3 ? (s * 1000).toFixed(s >= 0.01 ? 1 : 2) + ' ms' : (s * 1e6).toFixed(1) + ' µs');
  const fmtNum = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
  function readouts(el, items) {
    el.innerHTML = items.map(([k, v, cls]) => `<div class="ro ${cls || ''}"><small>${t(k)}</small><b>${v}</b></div>`).join('');
  }
  function renderTex(el, tex) {
    if (window.katex) {
      try { window.katex.render(tex, el, { throwOnError: false }); return; } catch (e) { /* fall through */ }
    }
    el.textContent = tex;
  }
  document.querySelectorAll('[data-tex]').forEach((el) => renderTex(el, el.dataset.tex));

  /* ------------------------------------------------------------- random */
  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let q = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q;
      return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
    };
  }
  const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(TAU * r());

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
    c.direction = /[\u0600-\u06FF]/.test(s) ? 'rtl' : 'ltr';
    c.fillText(s, x, y);
  }
  function stroke(c, color, width = 2, glow = 0) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    if (glow) { c.shadowColor = color; c.shadowBlur = glow; }
    c.stroke();
    c.shadowBlur = 0;
  }
  function seg(c, x1, y1, x2, y2, color, width = 1, dash = null) {
    c.beginPath();
    if (dash) c.setLineDash(dash);
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    stroke(c, color, width);
    c.setLineDash([]);
  }
  function plotFn(c, x0, x1, n, fx) {
    c.beginPath();
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const y = fx(x, i / n);
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
  }
  function grid(c, x, y, w, h, rows = 4, cols = 8, color = 'rgba(112,137,184,.11)') {
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.beginPath();
    for (let i = 0; i <= rows; i++) { const yy = Math.round(y + (i * h) / rows) + 0.5; c.moveTo(x, yy); c.lineTo(x + w, yy); }
    for (let i = 0; i <= cols; i++) { const xx = Math.round(x + (i * w) / cols) + 0.5; c.moveTo(xx, y); c.lineTo(xx, y + h); }
    c.stroke();
  }
  function dot(c, x, y, col, r = 3.5, glow = 12) {
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fillStyle = col;
    c.shadowColor = col;
    c.shadowBlur = glow;
    c.fill();
    c.shadowBlur = 0;
  }
  function makeLUT(stops) {
    const lut = new Uint8Array(256 * 3);
    for (let i = 0; i < 256; i++) {
      const u = i / 255;
      let j = 0;
      while (j < stops.length - 2 && u > stops[j + 1][0]) j++;
      const [u0, c0] = stops[j], [u1, c1] = stops[j + 1];
      const f = clamp((u - u0) / (u1 - u0), 0, 1);
      for (let k = 0; k < 3; k++) lut[i * 3 + k] = Math.round(c0[k] + (c1[k] - c0[k]) * f);
    }
    return lut;
  }
  const LUT_MAGMA = makeLUT([[0, [4, 6, 20]], [0.18, [38, 17, 86]], [0.38, [114, 31, 129]], [0.55, [183, 55, 121]], [0.72, [241, 96, 93]], [0.86, [254, 166, 108]], [1, [252, 253, 191]]]);
  const LUT_DIV = makeLUT([[0, [96, 165, 250]], [0.25, [37, 76, 170]], [0.5, [10, 15, 30]], [0.75, [190, 70, 40]], [1, [255, 190, 90]]]);
  const lutCss = (lut, u) => { const i = (clamp(u, 0, 1) * 255) | 0; return `rgb(${lut[i * 3]},${lut[i * 3 + 1]},${lut[i * 3 + 2]})`; };

  /* -------------------------------------------- animation & visibility */
  const sims = [];
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const s = e.target._sim;
    s.visible = e.isIntersecting;
    if (s.visible) s.dirty = true;
  }), { rootMargin: '120px' });
  function addSim(el, draw, anim = true) {
    const s = { el, draw, anim, visible: false, dirty: true };
    el._sim = s;
    io.observe(el);
    sims.push(s);
    return s;
  }
  function markAll() { sims.forEach((s) => { s.dirty = true; }); }
  let lastMs = 0;
  function frame(ms) {
    const dt = Math.min((ms - lastMs) / 1000 || 0, 0.05);
    lastMs = ms;
    for (const s of sims) {
      const a = typeof s.anim === 'function' ? s.anim() : s.anim;
      if (s.visible && (a || s.dirty)) { s.dirty = false; s.draw(dt); }
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', markAll);

  /* -------------------------------------------------------------- audio */
  let AC = null, master = null;
  function ac() {
    if (!AC) {
      const C = window.AudioContext || window.webkitAudioContext;
      AC = new C();
      const comp = AC.createDynamicsCompressor();
      comp.threshold.value = -12; comp.knee.value = 6; comp.ratio.value = 10;
      comp.attack.value = 0.003; comp.release.value = 0.2;
      master = AC.createGain();
      master.gain.value = 0.9;
      master.connect(comp);
      comp.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  function gainOut(a, level) {
    const g = a.createGain();
    g.gain.setValueAtTime(0, a.currentTime);
    g.gain.setTargetAtTime(level, a.currentTime, 0.015);
    g.connect(master);
    return g;
  }
  function setPlayBtn(btns, on) {
    btns.forEach((b) => { b._on = on; b.classList.toggle('playing', on); b.innerHTML = on ? t('stop') : labelOf(b); });
  }
  let currentPlayer = null;
  class Player {
    constructor(btns, startFn, after) {
      this.btns = Array.isArray(btns) ? btns : [btns];
      this.startFn = startFn;
      this.after = after;
      this.nodes = null;
      this.btns.forEach((b) => b.addEventListener('click', () => (this.nodes ? this.stop() : this.start())));
    }
    get on() { return !!this.nodes; }
    start() {
      const a = ac();
      if (currentPlayer && currentPlayer !== this) currentPlayer.stop();
      currentPlayer = this;
      this.nodes = this.startFn(a);
      setPlayBtn(this.btns, true);
      if (this.after) this.after();
    }
    stop() {
      const n = this.nodes;
      if (!n) return;
      this.nodes = null;
      try { n.out.gain.setTargetAtTime(0, AC.currentTime, 0.015); } catch (e) { /* ignore */ }
      setTimeout(() => {
        (n.sources || []).forEach((s) => { try { s.stop(); } catch (e) { /* already stopped */ } });
        try { n.out.disconnect(); } catch (e) { /* ignore */ }
      }, 120);
      if (currentPlayer === this) currentPlayer = null;
      setPlayBtn(this.btns, false);
      markAll();
    }
    restart() { if (this.nodes) { this.stop(); this.start(); } }
  }
  function oscPlayer(btn, getFreq, level = 0.3, type = 'sine') {
    return new Player(btn, (a) => {
      const out = gainOut(a, level);
      const o = a.createOscillator();
      o.type = type;
      o.frequency.value = getFreq();
      o.connect(out);
      o.start();
      return { out, sources: [o], osc: o };
    });
  }
  const setFreq = (p, f) => { if (p.nodes) p.nodes.osc.frequency.setTargetAtTime(f, AC.currentTime, 0.02); };

  /* ================================================================ HERO */
  const heroCv = $('heroCanvas');
  let heroT = 0;
  addSim(heroCv, (dt) => {
    heroT += dt;
    const { c, w, h } = prep(heroCv);
    const cy = h * 0.8, fr = [1.1, 2.6, 4.3], am = [26, 16, 10];
    for (let i = 0; i < 3; i++) {
      plotFn(c, 0, w, Math.ceil(w / 5), (x, u) => cy + Math.sin(TAU * fr[i] * u * 2 + heroT * (0.5 + 0.3 * i)) * am[i] * (0.4 + 0.6 * Math.sin(u * Math.PI)));
      stroke(c, COLORS[i] + '66', 1.4);
    }
    plotFn(c, 0, w, Math.ceil(w / 4), (x, u) => {
      let s = 0;
      for (let i = 0; i < 3; i++) s += Math.sin(TAU * fr[i] * u * 2 + heroT * (0.5 + 0.3 * i)) * am[i];
      return cy + s * (0.4 + 0.6 * Math.sin(u * Math.PI));
    });
    stroke(c, 'rgba(230,240,255,.45)', 2, 10);
  });

  /* =========================================== 1. RAW SIGNAL EXPLORER */
  const RAW_N = 800;
  const RAW_INFO = {
    draw: { dur: 1, unit: 's', y: 'axAmp', fixed: [-1, 1] },
    ecg: { dur: 4, unit: 's', y: 'axVolt' },
    speech: { dur: 1.2, unit: 's', y: 'axPressure' },
    temp: { dur: 48, unit: 'h', y: 'axTemp' },
    noise: { dur: 1, unit: 's', y: 'axAmp' },
    mic: { dur: 0, unit: 'ms', y: 'axAmp' },
  };
  const raw = { mode: 'ecg', data: null, drawn: new Float32Array(RAW_N), analyser: null, stream: null, micBuf: null, micPeak: 0.1, statT: 0 };
  for (let n = 0; n < RAW_N; n++) raw.drawn[n] = 0.7 * Math.sin((TAU * n) / RAW_N) + 0.25 * Math.sin((3 * TAU * n) / RAW_N);
  function genRaw(mode) {
    const N = RAW_N, d = new Float32Array(N), r = rng(7), dur = RAW_INFO[mode].dur;
    const g = (u, m, s) => Math.exp(-0.5 * ((u - m) / s) ** 2);
    let drift = 0;
    for (let n = 0; n < N; n++) {
      const tt = (n / (N - 1)) * dur;
      if (mode === 'ecg') {
        const P = 60 / 72, u = (tt % P) / P;
        d[n] = 0.12 * g(u, 0.16, 0.03) - 0.13 * g(u, 0.245, 0.009) + 1.15 * g(u, 0.26, 0.011) - 0.28 * g(u, 0.278, 0.011) + 0.32 * g(u, 0.48, 0.045) + 0.05 * Math.sin(TAU * 0.25 * tt) + 0.012 * gauss(r);
      } else if (mode === 'speech') {
        let env = 0;
        for (const [m, s, a] of [[0.12, 0.06, 0.9], [0.33, 0.05, 0.7], [0.53, 0.08, 1], [0.8, 0.05, 0.6], [1.0, 0.07, 0.8]]) env += a * g(tt, m, s);
        d[n] = env * (0.5 * Math.sin(TAU * 131 * tt) * Math.sin(TAU * 23 * tt) + 0.3 * gauss(r)) + 0.01 * gauss(r);
      } else if (mode === 'temp') {
        drift += gauss(r) * 0.04;
        d[n] = 17 + 6.5 * Math.sin((TAU * (tt - 9)) / 24) + drift + 0.3 * gauss(r);
      } else {
        d[n] = 0.3 * gauss(r);
      }
    }
    return d;
  }
  const rawCv = $('rawCanvas');
  const RM = { l: 58, r: 14, t: 30, b: 38 };
  const rawSeries = () => (raw.mode === 'draw' ? raw.drawn : raw.mode === 'mic' ? raw.micBuf : raw.data);
  function rawStats(d) {
    const info = RAW_INFO[raw.mode];
    if (!d) { readouts($('rawStats'), [['roSamples', '—']]); return; }
    let mn = Infinity, mx = -Infinity, sum = 0, sq = 0;
    for (const v of d) { mn = Math.min(mn, v); mx = Math.max(mx, v); sum += v; sq += v * v; }
    const mean = sum / d.length, unit = raw.mode === 'temp' ? ' °C' : raw.mode === 'ecg' ? ' mV' : '';
    const f3 = (v) => v.toFixed(raw.mode === 'temp' ? 1 : 3) + unit;
    const dur = raw.mode === 'mic' ? fmtS(d.length / AC.sampleRate) : info.dur + ' ' + (info.unit === 'h' ? t('hours') : 's');
    readouts($('rawStats'), [
      ['roSamples', d.length], ['roDuration', dur], ['roMin', f3(mn)], ['roMax', f3(mx)], ['roMean', f3(mean)],
      ['roRms', Math.sqrt(sq / d.length).toFixed(3) + (raw.mode === 'temp' ? '' : unit)],
      raw.mode === 'mic' ? ['roFs', (AC.sampleRate / 1000).toFixed(1) + ' kHz'] : ['roP2p', f3(mx - mn)],
    ]);
  }
  const rawSim = addSim($('simRaw'), (dt) => {
    const { c, w, h } = prep(rawCv);
    const pw = w - RM.l - RM.r, ph = h - RM.t - RM.b, info = RAW_INFO[raw.mode];
    let d = rawSeries(), lo, hi, dur = info.dur;
    if (raw.mode === 'mic') {
      if (raw.analyser) {
        raw.analyser.getFloatTimeDomainData(raw.micBuf);
        let pk = 0;
        for (const v of raw.micBuf) pk = Math.max(pk, Math.abs(v));
        raw.micPeak = Math.max(pk * 1.25, raw.micPeak * 0.97, 0.02);
        dur = (raw.micBuf.length / AC.sampleRate) * 1000;
      }
      lo = -raw.micPeak; hi = raw.micPeak;
    } else if (info.fixed) {
      [lo, hi] = info.fixed;
    } else {
      lo = Infinity; hi = -Infinity;
      for (const v of d) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const pad = (hi - lo) * 0.12 || 1;
      lo -= pad; hi += pad;
    }
    grid(c, RM.l, RM.t, pw, ph, 4, 8);
    const Y = (v) => RM.t + ph * (1 - (v - lo) / (hi - lo));
    if (lo < 0 && hi > 0) seg(c, RM.l, Y(0), RM.l + pw, Y(0), '#5c6d8c88', 1);
    for (let i = 0; i <= 4; i++) {
      const v = lo + ((hi - lo) * i) / 4;
      txt(c, Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(2), RM.l - 8, Y(v) + 4, '#7385a6', 10, 'right');
    }
    for (let i = 0; i <= 8; i++) {
      const v = (dur * i) / 8;
      txt(c, dur ? (v >= 10 || Number.isInteger(v) ? v.toFixed(0) : v.toFixed(v < 1 ? 2 : 1)) : '', RM.l + (pw * i) / 8, RM.t + ph + 16, '#7385a6', 10, 'center');
    }
    txt(c, `${t('axTime')} (${t('unit_' + info.unit)}) →`, RM.l + pw, h - 4, '#8b9dbd', 10.5, 'right', 650);
    c.save();
    c.translate(13, RM.t + ph / 2);
    c.rotate(-Math.PI / 2);
    txt(c, t(info.y), 0, 0, '#8b9dbd', 10.5, 'center', 650);
    c.restore();
    if (d) {
      const n = d.length;
      plotFn(c, RM.l, RM.l + pw, n - 1, (x, u) => Y(d[Math.round(u * (n - 1))]));
      const col = raw.mode === 'mic' ? '#46e4b0' : raw.mode === 'draw' ? '#ffcb57' : '#7fa0ff';
      stroke(c, col, raw.mode === 'speech' || raw.mode === 'noise' ? 1.2 : 2, 8);
    } else {
      txt(c, t('micWaiting'), RM.l + pw / 2, RM.t + ph / 2, '#8b9dbd', 13, 'center');
    }
    if (raw.mode === 'draw') txt(c, t('drawHint'), RM.l + pw - 6, RM.t + 16, '#ffcb57aa', 11.5, 'right', 650);
    raw.statT += dt;
    if (raw.mode !== 'mic' || raw.statT > 0.2) { raw.statT = 0; rawStats(d); }
  }, () => raw.mode === 'mic');

  let drawing = false, lastIdx = -1, lastVal = 0;
  function paint(e) {
    const r = rawCv.getBoundingClientRect();
    const pw = r.width - RM.l - RM.r, ph = r.height - RM.t - RM.b;
    const i = clamp(Math.round(((e.clientX - r.left - RM.l) / pw) * (RAW_N - 1)), 0, RAW_N - 1);
    const v = clamp(1 - (2 * (e.clientY - r.top - RM.t)) / ph, -1, 1);
    if (lastIdx < 0 || lastIdx === i) raw.drawn[i] = v;
    else {
      const a = Math.min(lastIdx, i), b = Math.max(lastIdx, i);
      for (let j = a; j <= b; j++) raw.drawn[j] = lastVal + ((v - lastVal) * (j - lastIdx)) / (i - lastIdx);
    }
    lastIdx = i; lastVal = v;
    rawSim.dirty = true;
  }
  rawCv.addEventListener('pointerdown', (e) => {
    if (raw.mode !== 'draw') return;
    drawing = true; lastIdx = -1;
    rawCv.setPointerCapture(e.pointerId);
    paint(e);
  });
  rawCv.addEventListener('pointermove', (e) => { if (drawing) paint(e); });
  const endDraw = () => { if (drawing) { drawing = false; rawPlayer.restart(); } };
  rawCv.addEventListener('pointerup', endDraw);
  rawCv.addEventListener('pointercancel', endDraw);

  const RAW_BASE = 220;
  function shapeBuffer(a) {
    const d = rawSeries(), P = Math.round(a.sampleRate / RAW_BASE);
    const b = a.createBuffer(1, P, a.sampleRate), ch = b.getChannelData(0);
    let mean = 0, pk = 1e-6;
    for (const v of d) mean += v / d.length;
    for (const v of d) pk = Math.max(pk, Math.abs(v - mean));
    for (let i = 0; i < P; i++) {
      const pos = (i / P) * (d.length - 1), i0 = Math.floor(pos), fr = pos - i0;
      const v = d[i0] * (1 - fr) + d[Math.min(i0 + 1, d.length - 1)] * fr;
      ch[i] = ((v - mean) / pk) * 0.9;
    }
    return b;
  }
  const rawPlayer = new Player($('rawPlay'), (a) => {
    const out = gainOut(a, 0.3);
    const src = a.createBufferSource();
    src.buffer = shapeBuffer(a);
    src.loop = true;
    src.playbackRate.value = +$('rawPitch').value / RAW_BASE;
    src.connect(out);
    src.start();
    return { out, sources: [src], src };
  });
  const rawPitchOut = () => { $('rawPitchOut').textContent = $('rawPitch').value + ' Hz'; };
  $('rawPitch').addEventListener('input', () => {
    rawPitchOut();
    if (rawPlayer.nodes) rawPlayer.nodes.src.playbackRate.setTargetAtTime(+$('rawPitch').value / RAW_BASE, AC.currentTime, 0.02);
  });
  rawPitchOut();
  async function startMic() {
    try {
      const a = ac();
      raw.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      if (raw.mode !== 'mic') { stopMic(); return; }
      const src = a.createMediaStreamSource(raw.stream);
      raw.analyser = a.createAnalyser();
      raw.analyser.fftSize = 2048;
      raw.micBuf = new Float32Array(2048);
      src.connect(raw.analyser);
    } catch (err) {
      $('rawNote').innerHTML = t('micErr');
    }
  }
  function stopMic() {
    if (raw.stream) raw.stream.getTracks().forEach((tr) => tr.stop());
    raw.stream = null; raw.analyser = null; raw.micBuf = null;
  }
  function rawText() {
    $('rawNote').innerHTML = t('note_' + raw.mode);
    $('rawLabel').textContent = t('rawLbl_' + raw.mode);
  }
  function setRawMode(m) {
    if (raw.mode === 'mic' && m !== 'mic') stopMic();
    raw.mode = m;
    document.querySelectorAll('#rawModes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
    if (m !== 'draw' && m !== 'mic') raw.data = genRaw(m);
    $('rawClear').style.display = m === 'draw' ? '' : 'none';
    $('rawPlay').style.display = $('rawPitch').parentElement.style.display = m === 'mic' ? 'none' : '';
    if (m === 'mic') { rawPlayer.stop(); startMic(); } else rawPlayer.restart();
    rawText();
    rawSim.dirty = true;
  }
  document.querySelectorAll('#rawModes button').forEach((b) => b.addEventListener('click', () => setRawMode(b.dataset.mode)));
  $('rawClear').addEventListener('click', () => { raw.drawn.fill(0); rawSim.dirty = true; rawPlayer.restart(); });
  refreshers.push(rawText);

  /* ========================================== 2.1 HERTZ IN SLOW MOTION */
  const hz = { f: 1, A: 0.9, p: 0, phase: 0, time: 0, cycles: 0, flash: 0, statT: 0 };
  function blip() {
    if (!AC) return;
    const a = AC, o = a.createOscillator(), g = a.createGain(), now = a.currentTime;
    o.frequency.value = 1500;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.35, now + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    o.connect(g); g.connect(master);
    o.start(now); o.stop(now + 0.06);
  }
  function hzStats() {
    readouts($('hzStats'), [
      ['roFreq', hz.f.toFixed(2) + ' Hz'], ['roPeriod', (1 / hz.f).toFixed(3) + ' s'], ['roOmega', (TAU * hz.f).toFixed(2) + ' rad/s'],
      ['roCycles', hz.cycles, 'ok'], ['roElapsed', hz.time.toFixed(1) + ' s'], ['roRatio', hz.time > 0.5 ? (hz.cycles / hz.time).toFixed(2) + ' Hz' : '—'],
    ]);
  }
  addSim($('simHz'), (dt) => {
    hz.time += dt;
    const before = Math.floor(hz.phase / TAU);
    hz.phase += TAU * hz.f * dt;
    const after = Math.floor(hz.phase / TAU);
    if (after > before) { hz.cycles += after - before; hz.flash = 1; if ($('hzTick').checked) blip(); }
    hz.flash = Math.max(0, hz.flash - dt * 3);
    const { c, w, h } = prep($('hzCanvas'));
    const R = Math.min(h * 0.3, 80), cx = R + 30, cy = h * 0.44, x0 = cx + R + 34;
    const span = 2.5, pps = (w - x0 - 16) / span, th = hz.phase + hz.p, r = R * hz.A;
    // time grid
    for (let s = 0; s <= span * 4; s++) seg(c, x0 + (s / 4) * pps, cy - R - 8, x0 + (s / 4) * pps, cy + R + 8, s % 4 ? 'rgba(112,137,184,.08)' : 'rgba(112,137,184,.22)', 1);
    seg(c, x0, cy, w - 16, cy, '#3a4b6799', 1);
    // phasor circle
    c.beginPath(); c.arc(cx, cy, R, 0, TAU); stroke(c, '#2c3d60', 1.3);
    if (hz.flash > 0) { c.beginPath(); c.arc(cx, cy, R + 4, 0, TAU); stroke(c, `rgba(70,228,176,${hz.flash})`, 3, 18); }
    seg(c, cx - R - 8, cy, cx + R + 8, cy, '#2c3d60', 1);
    seg(c, cx, cy - R - 8, cx, cy + R + 8, '#2c3d60', 1);
    const ang = ((th % TAU) + TAU) % TAU;
    c.beginPath(); c.arc(cx, cy, R * 0.28, 0, -ang, true); stroke(c, '#ffcb57aa', 2);
    const px = cx + r * Math.cos(th), py = cy - r * Math.sin(th);
    seg(c, cx, cy, px, py, '#46e4b0', 2.4);
    seg(c, px, py, px, cy, '#46e4b066', 1, [3, 3]);
    seg(c, px, py, x0, py, '#46e4b088', 1, [4, 4]);
    dot(c, px, py, '#46e4b0', 5);
    txt(c, 'θ = 2πft + φ', cx, cy + R + 22, '#ffcb57', 11, 'center', 650);
    // wave
    plotFn(c, x0, w - 16, Math.ceil((w - x0) / 2), (x) => cy - r * Math.sin(th - TAU * hz.f * ((x - x0) / pps)));
    stroke(c, '#46e4b0', 2.4, 10);
    dot(c, x0, py, '#ffffff', 4);
    // one-second ruler with numbered cycles
    const ry = cy + R + 38;
    seg(c, x0, ry, x0 + pps, ry, '#ffcb57', 2);
    seg(c, x0, ry - 6, x0, ry + 6, '#ffcb57', 2);
    seg(c, x0 + pps, ry - 6, x0 + pps, ry + 6, '#ffcb57', 2);
    c.fillStyle = 'rgba(255,203,87,.05)';
    c.fillRect(x0, cy - R - 8, pps, 2 * R + 16);
    let count = 0;
    for (let k = Math.floor(th / TAU); count < 200; k--) {
      const tau = (th - TAU * k) / (TAU * hz.f);
      if (tau > 1) break;
      count++;
      const xx = x0 + tau * pps;
      dot(c, xx, cy, '#ffcb57', 3.5, 8);
      if (pps / Math.max(hz.f, 1) > 14) txt(c, String(count), xx, ry - 10, '#ffcb57', 10.5, 'center', 700);
    }
    txt(c, `${t('oneSecond')} = ${fmtNum(hz.f)} ${t(hz.f === 1 ? 'cycleWord' : 'cyclesWord')}`, x0 + pps / 2, ry + 20, '#ffcb57', 12, 'center', 700);
    txt(c, t('now'), x0, cy - R - 14, '#c8d6f2', 10.5, 'center', 700);
    txt(c, t('older'), w - 18, cy - R - 14, '#7385a6', 10.5, 'right', 650);
    hz.statT += dt;
    if (hz.statT > 0.12) { hz.statT = 0; hzStats(); }
  });
  function hzInputs() {
    hz.f = +$('hzF').value; hz.A = +$('hzA').value; hz.p = +$('hzP').value;
    $('hzFOut').textContent = hz.f.toFixed(2) + ' Hz';
    $('hzAOut').textContent = hz.A.toFixed(2);
    $('hzPOut').textContent = hz.p.toFixed(2) + ' rad';
  }
  ['hzF', 'hzA', 'hzP'].forEach((id) => $(id).addEventListener('input', hzInputs));
  $('hzTick').addEventListener('change', () => { if ($('hzTick').checked) ac(); });
  $('hzReset').addEventListener('click', () => { hz.cycles = 0; hz.time = 0; hzStats(); });
  hzInputs();
  refreshers.push(hzStats);

  /* ============================================== 2.2 CLICKS TO PITCH */
  const clkRateOf = (v) => Math.pow(10, (3 * v) / 1000);
  let clkRate = 1;
  const clkPlayer = new Player($('clkPlay'), (a) => {
    const sr = a.sampleRate, b = a.createBuffer(1, Math.ceil(sr * 1.05), sr), ch = b.getChannelData(0);
    const L = Math.round(sr * 0.003);
    for (let i = 0; i < L; i++) ch[i] = Math.exp(-i / (sr * 0.0005)) * (i < sr * 0.00025 ? 0.95 : -0.55);
    const src = a.createBufferSource();
    src.buffer = b; src.loop = true; src.loopStart = 0; src.loopEnd = 1 / clkRate;
    const out = gainOut(a, 0.5);
    src.connect(out); src.start();
    return { out, sources: [src], src, t0: a.currentTime };
  });
  const clkZone = (r) => (r < 15 ? 'zClicks' : r < 30 ? 'zFlutter' : 'zPitch');
  function clkUpdate() {
    clkRate = clkRateOf(+$('clkRate').value);
    $('clkOut').textContent = clkRate.toFixed(clkRate < 10 ? 2 : clkRate < 100 ? 1 : 0) + ' Hz';
    $('clkPerc').innerHTML = `${t('youHear')}: <b>${t(clkZone(clkRate))}</b>` + (clkRate >= 30 ? ` · ${t('roNote')} ≈ ${noteName(clkRate)}` : '');
    if (clkPlayer.nodes) clkPlayer.nodes.src.loopEnd = 1 / clkRate;
    readouts($('clkStats'), [
      ['roRate', clkRate.toFixed(clkRate < 10 ? 2 : 1) + ' Hz'], ['roInterval', fmtS(1 / clkRate)], ['roPerMin', Math.round(clkRate * 60)],
      ['roPerc', t(clkZone(clkRate)), clkRate >= 30 ? 'ok' : ''],
    ]);
  }
  $('clkRate').addEventListener('input', clkUpdate);
  addSim($('simClicks'), () => {
    const { c, w, h } = prep($('clkCanvas'));
    const x0 = 22, x1 = w - 22, pw = x1 - x0, ty = h * 0.3;
    txt(c, t('oneSecondTimeline'), x0, 22, '#8b9dbd', 10.5, 'left', 700);
    seg(c, x0, ty, x1, ty, '#3a4b67', 1);
    let head = -1;
    if (clkPlayer.nodes) head = ((AC.currentTime - clkPlayer.nodes.t0) % 1 + 1) % 1;
    if (clkRate <= 300) {
      for (let k = 0; k < clkRate; k++) {
        const u = k / clkRate, x = x0 + u * pw, lit = head >= 0 && u <= head;
        seg(c, x, ty - 16, x, ty + 16, lit ? '#ffcb57' : '#ffcb5766', clkRate > 100 ? 1 : 2);
      }
    } else {
      const g = c.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#ffcb5755'); g.addColorStop(1, '#ffcb5733');
      c.fillStyle = g; c.fillRect(x0, ty - 16, pw, 32);
      txt(c, t('tooDense'), x0 + pw / 2, ty + 4, '#ffe3a1', 11, 'center', 650);
    }
    if (head >= 0) { const hx = x0 + head * pw; seg(c, hx, ty - 24, hx, ty + 24, '#ffffff', 1.5); }
    ['0', '0.5 s', '1 s'].forEach((s, i) => txt(c, s, x0 + (pw * i) / 2, ty + 34, '#7385a6', 10, 'center'));
    // perception scale (log)
    const by = h * 0.72, bh = 16, X = (r) => x0 + (Math.log10(r) / 3) * pw;
    [[1, 15, '#ff5d9e', 'zClicks'], [15, 30, '#ffcb57', 'zFlutter'], [30, 1000, '#46e4b0', 'zPitch']].forEach(([a, b, col, k]) => {
      c.fillStyle = col + '33'; c.fillRect(X(a), by, X(b) - X(a), bh);
      c.fillStyle = col; c.fillRect(X(a), by + bh - 3, X(b) - X(a), 3);
      if (X(b) - X(a) > 50) txt(c, t(k), (X(a) + X(b)) / 2, by - 6, col, 10.5, 'center', 700);
    });
    [1, 10, 100, 1000].forEach((r) => txt(c, r + ' Hz', X(r), by + bh + 15, '#7385a6', 10, 'center'));
    const mx = X(clkRate);
    c.beginPath(); c.moveTo(mx, by - 2); c.lineTo(mx - 6, by - 12); c.lineTo(mx + 6, by - 12); c.closePath();
    c.fillStyle = '#ffffff'; c.fill();
    seg(c, mx, by, mx, by + bh, '#ffffff', 2);
  }, () => clkPlayer.on);
  clkUpdate();
  refreshers.push(clkUpdate);

  /* ================================================ 2.3 TONE GENERATOR */
  const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  function noteName(f) {
    const n = 12 * Math.log2(f / 440) + 69, r = Math.round(n), cents = Math.round((n - r) * 100);
    return NOTE_NAMES[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1) + (cents ? ` ${cents > 0 ? '+' : ''}${cents}¢` : '');
  }
  const toneFOf = (v) => 20 * Math.pow(1000, v / 1000);
  const toneVOf = (f) => (1000 * Math.log(f / 20)) / Math.log(1000);
  const TYPE_GAIN = { sine: 1, triangle: 0.9, square: 0.42, sawtooth: 0.5 };
  const tone = { f: 440, type: 'sine', vol: 0.25, ph: 0 };
  $('toneF').value = toneVOf(440);
  const tonePlayer = new Player($('tonePlay'), (a) => {
    const out = gainOut(a, tone.vol * TYPE_GAIN[tone.type] * 0.6);
    const o = a.createOscillator();
    o.type = tone.type; o.frequency.value = tone.f;
    o.connect(out); o.start();
    return { out, sources: [o], osc: o };
  });
  const WAVE_FN = {
    sine: (p) => Math.sin(p),
    square: (p) => (Math.sin(p) >= 0 ? 1 : -1),
    sawtooth: (p) => { const u = (((p / TAU) % 1) + 1) % 1; return 2 * u - 1; },
    triangle: (p) => { const u = (((p / TAU + 0.25) % 1) + 1) % 1; return u < 0.5 ? 4 * u - 1 : 3 - 4 * u; },
  };
  const BANDS = [[20, 60, 'bSub', '#a68bff'], [60, 250, 'bBass', '#7798ff'], [250, 2000, 'bMid', '#45d9f5'], [2000, 6000, 'bUpper', '#46e4b0'], [6000, 20000, 'bHigh', '#ffcb57']];
  function toneUpdate() {
    tone.f = toneFOf(+$('toneF').value);
    tone.type = $('toneType').value;
    tone.vol = +$('toneV').value;
    $('toneFOut').textContent = fmtHz(tone.f);
    $('toneVOut').textContent = Math.round(tone.vol * 100) + '%';
    const n = tonePlayer.nodes;
    if (n) {
      n.osc.frequency.setTargetAtTime(tone.f, AC.currentTime, 0.02);
      if (n.osc.type !== tone.type) n.osc.type = tone.type;
      n.out.gain.setTargetAtTime(tone.vol * TYPE_GAIN[tone.type] * 0.6, AC.currentTime, 0.03);
    }
    readouts($('toneStats'), [
      ['roFreq', fmtHz(tone.f)], ['roPeriod', fmtS(1 / tone.f)], ['roLambda', (343 / tone.f >= 1 ? (343 / tone.f).toFixed(2) + ' m' : ((343 / tone.f) * 100).toFixed(1) + ' cm')],
      ['roNote', noteName(tone.f)], ['roIn10ms', (tone.f * 0.01).toFixed(1)], ['roOmega', (TAU * tone.f).toFixed(0) + ' rad/s'],
    ]);
    toneSim.dirty = true;
  }
  const toneSim = addSim($('simTone'), (dt) => {
    if (tonePlayer.on) tone.ph += dt * 3;
    const { c, w, h } = prep($('toneCanvas'));
    const x0 = 14, x1 = w - 14, pw = x1 - x0, top = 26, sh = h * 0.56, cy = top + sh / 2, fn = WAVE_FN[tone.type];
    grid(c, x0, top, pw, sh, 4, 10);
    const cyc = tone.f * 0.01, n = Math.min(12000, Math.max(pw * 2, Math.ceil(cyc * 24)));
    plotFn(c, x0, x1, n, (x, u) => cy - sh * 0.42 * fn(TAU * cyc * u + tone.ph));
    stroke(c, '#45d9f5', cyc > 200 ? 0.6 : 2, 8);
    txt(c, '0', x0, top + sh + 14, '#7385a6', 10, 'left');
    txt(c, '5 ms', x0 + pw / 2, top + sh + 14, '#7385a6', 10, 'center');
    txt(c, '10 ms', x1, top + sh + 14, '#7385a6', 10, 'right');
    const by = h - 32, X = (f) => x0 + (Math.log10(f / 20) / 3) * pw;
    BANDS.forEach(([a, b, k, col]) => {
      c.fillStyle = col + '30'; c.fillRect(X(a), by, X(b) - X(a), 12);
      if (X(b) - X(a) > 44) txt(c, t(k), (X(a) + X(b)) / 2, by - 4, col, 10, 'center', 650);
    });
    [[20, '20 Hz'], [100, '100'], [1000, '1k'], [10000, '10k'], [20000, '20 kHz']].forEach(([f, s], i) => txt(c, s, X(f), by + 25, '#7385a6', 9.5, i === 0 ? 'left' : i === 4 ? 'right' : 'center'));
    const mx = X(tone.f);
    seg(c, mx, by - 2, mx, by + 14, '#ffffff', 2.5);
    dot(c, mx, by + 6, '#ffffff', 3.5);
  }, () => tonePlayer.on);
  ['toneF', 'toneType', 'toneV'].forEach((id) => $(id).addEventListener('input', toneUpdate));
  [['A2', 110], ['C4', 261.63], ['A4', 440], ['A5', 880], ['1 kHz', 1000], ['4 kHz', 4000], ['10 kHz', 10000], ['16 kHz', 16000]].forEach(([lbl, f]) => {
    const b = document.createElement('button');
    b.textContent = lbl;
    b.addEventListener('click', () => { $('toneF').value = toneVOf(f); toneUpdate(); });
    $('toneNotes').append(b);
  });
  toneUpdate();
  refreshers.push(toneUpdate);

  /* ===================================================== 3. SAMPLING */
  const samp = { f: 3, fs: 24, b: 4, phi: 0.35 };
  const sampAlias = () => samp.f - samp.fs * Math.round(samp.f / samp.fs);
  const quant = (x, b) => { const L = 2 ** b; return (Math.round(((x + 1) / 2) * (L - 1)) / (L - 1)) * 2 - 1; };
  const sampO = oscPlayer($('sampPlayO'), () => samp.f * 60, 0.3);
  const sampA = oscPlayer($('sampPlayA'), () => Math.abs(sampAlias()) * 60, 0.3);
  function sampUpdate() {
    samp.f = +$('sampF').value; samp.fs = +$('sampFs').value; samp.b = +$('sampB').value;
    $('sampFOut').textContent = samp.f.toFixed(1) + ' Hz';
    $('sampFsOut').textContent = samp.fs + ' Hz';
    $('sampBOut').textContent = samp.b + ' bit';
    const fa = Math.abs(sampAlias()), nyq = samp.fs / 2;
    const st = samp.f < nyq ? ['stOk', 'ok'] : samp.f === nyq ? ['stCritical', 'warn'] : ['stAlias', 'warn'];
    readouts($('sampStats'), [
      ['roNyquist', nyq.toFixed(1) + ' Hz'], ['roStatus', t(st[0]), st[1]], ['roApparent', fa.toFixed(2) + ' Hz', st[1]],
      ['roSpc', (samp.fs / samp.f).toFixed(2)], ['roLevels', 2 ** samp.b], ['roSqnr', (6.02 * samp.b + 1.76).toFixed(1) + ' dB'], ['roBitrate', samp.fs * samp.b + ' bit/s'],
    ]);
    setFreq(sampO, samp.f * 60);
    setFreq(sampA, fa * 60);
    sampSim.dirty = true;
  }
  const sampSim = addSim($('simSamp'), () => {
    const { c, w, h } = prep($('sampCanvas'));
    const L = 46, R = 14, T = 30, B = 34, pw = w - L - R, ph = h - T - B;
    const X = (tt) => L + tt * pw, Y = (v) => T + ph / 2 - v * ph * 0.42;
    grid(c, L, T, pw, ph, 4, 10);
    const levels = 2 ** samp.b;
    if (levels <= 32) for (let i = 0; i < levels; i++) seg(c, L, Y(-1 + (2 * i) / (levels - 1)), L + pw, Y(-1 + (2 * i) / (levels - 1)), 'rgba(166,139,255,.14)', 1);
    seg(c, L, Y(0), L + pw, Y(0), '#5c6d8c88', 1);
    [-1, 0, 1].forEach((v) => txt(c, v.toFixed(0), L - 8, Y(v) + 4, '#7385a6', 10, 'right'));
    for (let i = 0; i <= 4; i++) txt(c, (i / 4).toFixed(2) + ' s', X(i / 4), T + ph + 18, '#7385a6', 10, 'center');
    const x = (tt) => Math.sin(TAU * samp.f * tt + samp.phi);
    plotFn(c, L, L + pw, Math.ceil(pw * 1.5), (_, u) => Y(x(u)));
    stroke(c, '#45d9f580', 2);
    const fa = sampAlias(), aliased = samp.f > samp.fs / 2;
    if (aliased && $('sampAlias').checked) {
      c.setLineDash([7, 5]);
      plotFn(c, L, L + pw, Math.ceil(pw), (_, u) => Y(Math.sin(TAU * fa * u + samp.phi)));
      stroke(c, '#ff6b6b', 2.2, 8);
      c.setLineDash([]);
    }
    const n = Math.floor(samp.fs + 1e-9), qs = [];
    for (let k = 0; k <= n; k++) qs.push(quant(x(k / samp.fs), samp.b));
    if ($('sampHold').checked) {
      c.beginPath();
      qs.forEach((q, k) => {
        const xa = X(k / samp.fs), xb = X(Math.min(1, (k + 1) / samp.fs));
        if (k) c.lineTo(xa, Y(q)); else c.moveTo(xa, Y(q));
        c.lineTo(xb, Y(q));
      });
      stroke(c, '#a68bffcc', 1.6);
    }
    qs.forEach((q, k) => {
      const xx = X(k / samp.fs);
      seg(c, xx, Y(0), xx, Y(q), '#46e4b0aa', 1.4);
      dot(c, xx, Y(q), '#46e4b0', samp.fs > 50 ? 2.6 : 4, 8);
    });
    let lx = L + pw - 6;
    const leg = [['#ff6b6b', aliased && $('sampAlias').checked ? t('lgAlias') : null], ['#a68bff', $('sampHold').checked ? t('lgHold') : null], ['#46e4b0', t('lgSamples')], ['#45d9f5', t('lgSignal')]];
    c.font = `650 11px ${fontFamily()}`;
    leg.forEach(([col, s]) => {
      if (!s) return;
      const tw = c.measureText(s).width;
      txt(c, s, lx, 18, col, 11, 'right', 650);
      dot(c, lx - tw - 9, 14, col, 3.5, 0);
      lx -= tw + 30;
    });
  }, false);
  ['sampF', 'sampFs', 'sampB'].forEach((id) => $(id).addEventListener('input', sampUpdate));
  ['sampHold', 'sampAlias'].forEach((id) => $(id).addEventListener('change', () => { sampSim.dirty = true; }));
  sampUpdate();
  refreshers.push(sampUpdate);

  /* ===================================================== 4. WAVE MIXER */
  const PRESETS = {
    default: [[1, 1, 0.1, 1], [3, 0.8, 0.8, 1], [6, 0.6, 1.6, 1], [10, 0.45, 2.4, 1]],
    square: [[1, 1, 0, 1], [3, 0.33, 0, 1], [5, 0.2, 0, 1], [7, 0.14, 0, 1]],
    saw: [[1, 1, 0, 1], [2, 0.5, 3.14, 1], [3, 0.33, 0, 1], [4, 0.25, 3.14, 1]],
    beats: [[8, 0.8, 0, 1], [9, 0.8, 0, 1], [3, 0, 0, 0], [6, 0, 0, 0]],
    chord: [[4, 0.7, 0, 1], [5, 0.7, 0, 1], [6, 0.7, 0, 1], [12, 0, 0, 0]],
    single: [[2, 1, 0, 1], [3, 0, 0, 0], [6, 0, 0, 0], [10, 0, 0, 0]],
  };
  let comps = [];
  let mixT = 0, mixVersion = 0;
  const mixSig = (tt) => { let s = 0; for (const cp of comps) if (cp.on) s += cp.a * Math.sin(TAU * cp.f * tt + cp.p); return s; };
  const mixAmp = () => comps.reduce((s, cp) => s + (cp.on ? cp.a : 0), 0);
  function loadPreset(name) {
    comps = PRESETS[name].map(([f, a, p, on]) => ({ f, a, p, on: !!on }));
    document.querySelectorAll('#mixPresets button').forEach((b) => b.classList.toggle('on', b.dataset.preset === name));
    buildComps();
    onMixChange();
  }
  function buildComps() {
    const list = $('compList');
    list.innerHTML = '';
    comps.forEach((cp, i) => {
      const el = document.createElement('div');
      el.className = 'comp' + (cp.on ? '' : ' off');
      el.style.setProperty('--tone', COLORS[i]);
      const ctrl = (k, label, min, max, step) => `<div class="ctrl"><label><span>${label}</span><output data-o="${k}"></output></label><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${cp[k]}" /></div>`;
      el.innerHTML = `<div class="comp-top"><span>x<sub>${i + 1}</sub>(t)</span><label class="toggle"><input type="checkbox" data-k="on" ${cp.on ? 'checked' : ''} /> <span>${t('on')}</span></label></div>`
        + ctrl('f', t('cFreq'), 0.5, 16, 0.5) + ctrl('a', t('cAmp'), 0, 1.5, 0.01) + ctrl('p', t('cPhase'), 0, 6.28, 0.01);
      const outs = () => {
        el.querySelector('[data-o="f"]').textContent = fmtNum(cp.f) + ' Hz';
        el.querySelector('[data-o="a"]').textContent = cp.a.toFixed(2);
        el.querySelector('[data-o="p"]').textContent = cp.p.toFixed(2) + ' rad';
        el.classList.toggle('off', !cp.on);
      };
      el.querySelectorAll('input').forEach((inp) => inp.addEventListener('input', () => {
        const k = inp.dataset.k;
        cp[k] = k === 'on' ? inp.checked : +inp.value;
        outs();
        onMixChange();
      }));
      outs();
      list.append(el);
    });
  }
  function updateMixFormula() {
    const parts = comps.map((cp, i) => {
      if (!cp.on || cp.a === 0) return null;
      const ph = cp.p ? `+${cp.p.toFixed(2)}` : '';
      return `\\textcolor{${COLORS[i]}}{${cp.a.toFixed(2)}\\sin(2\\pi\\cdot ${fmtNum(cp.f)}\\,t${ph})}`;
    }).filter(Boolean);
    renderTex($('mixFormula'), 'x(t)=' + (parts.join('+') || '0'));
  }
  const mixPlayer = new Player($('mixPlay'), (a) => {
    const out = gainOut(a, 1);
    const oscs = comps.map(() => {
      const o = a.createOscillator(), g = a.createGain();
      g.gain.value = 0;
      o.connect(g); g.connect(out); o.start();
      return { o, g };
    });
    return { out, sources: oscs.map((x) => x.o), oscs };
  }, () => updateMixAudio());
  function updateMixAudio() {
    const n = mixPlayer.nodes;
    if (!n) return;
    const base = +$('mixBase').value, tot = Math.max(1, mixAmp()), now = AC.currentTime;
    n.oscs.forEach((x, i) => {
      const cp = comps[i];
      x.o.frequency.setTargetAtTime(cp.f * base, now, 0.015);
      x.g.gain.setTargetAtTime(cp.on ? (cp.a / tot) * 0.42 : 0, now, 0.02);
    });
  }
  function onMixChange() {
    mixVersion++;
    updateMixFormula();
    updateMixAudio();
    if (windSim) windSim.dirty = true;
    if (dftSim) { dftSim.dirty = true; dftStats(); }
  }
  $('mixBase').addEventListener('input', () => { $('mixBaseOut').textContent = $('mixBase').value + ' Hz'; updateMixAudio(); });
  $('mixBaseOut').textContent = $('mixBase').value + ' Hz';
  document.querySelectorAll('#mixPresets button').forEach((b) => b.addEventListener('click', () => loadPreset(b.dataset.preset)));

  addSim($('simMix'), (dt) => {
    mixT += dt * +$('mixSpeed').value;
    const tot = Math.max(mixAmp(), 0.01);
    // component lanes
    {
      const { c, w, h } = prep($('mixWaves'));
      const top = 26, lane = (h - top - 8) / 4, x0 = 58, x1 = w - 10;
      comps.forEach((cp, i) => {
        const cy = top + lane * (i + 0.5), col = cp.on ? COLORS[i] : '#4a5670';
        grid(c, x0, cy - lane * 0.38, x1 - x0, lane * 0.76, 2, 6);
        plotFn(c, x0, x1, 240, (x, u) => cy - lane * 0.36 * (cp.on ? (cp.a / 1.5) * Math.sin(TAU * cp.f * (u + mixT) + cp.p) : 0));
        stroke(c, col, 2, cp.on ? 7 : 0);
        txt(c, fmtNum(cp.f) + ' Hz', 8, cy - 2, col, 11, 'left', 700);
        txt(c, 'A=' + cp.a.toFixed(2), 8, cy + 13, '#7385a6', 9.5, 'left');
      });
    }
    // phasor chain
    {
      const { c, w, h } = prep($('mixEpi'));
      const cy = h / 2 + 8, sc = Math.min((h - 50) * 0.44, w * 0.2) / tot, cx = 22 + tot * sc, x0 = cx + tot * sc + 26;
      let px = cx, py = cy;
      comps.forEach((cp, i) => {
        if (!cp.on || cp.a === 0) return;
        const th = TAU * cp.f * mixT + cp.p, r = cp.a * sc;
        c.beginPath(); c.arc(px, py, r, 0, TAU); stroke(c, COLORS[i] + '40', 1);
        const nx = px + r * Math.cos(th), ny = py - r * Math.sin(th);
        seg(c, px, py, nx, ny, COLORS[i], 2);
        dot(c, nx, ny, COLORS[i], 2.4, 6);
        px = nx; py = ny;
      });
      seg(c, px, py, x0, py, '#ffffff55', 1, [4, 4]);
      const pps = w - x0 - 10;
      seg(c, x0, cy, w - 10, cy, '#3a4b6799', 1);
      plotFn(c, x0, w - 10, 300, (x, u) => cy - sc * mixSig(mixT - u));
      stroke(c, '#e6f1ff', 2.2, 10);
      dot(c, x0, py, '#ffffff', 4);
      if (pps > 60) txt(c, t('older'), w - 12, h - 10, '#7385a6', 10, 'right');
    }
    // sum
    {
      const { c, w, h } = prep($('mixSum'));
      const x0 = 14, x1 = w - 14, top = 28, ph = h - top - 26, cy = top + ph / 2, pw = x1 - x0;
      grid(c, x0, top, pw, ph, 4, 8);
      seg(c, x0, cy, x1, cy, '#5c6d8c66', 1);
      plotFn(c, x0, x1, Math.ceil(pw), (x, u) => cy - (ph * 0.46 * mixSig(u * 2)) / (tot * 1.05));
      stroke(c, '#e6f1ff', 2.4, 12);
      const u = ((mixT % 2) + 2) % 2 / 2, cx = x0 + u * pw;
      seg(c, cx, top, cx, top + ph, '#aabce344', 1);
      dot(c, cx, cy - (ph * 0.46 * mixSig(u * 2)) / (tot * 1.05), '#ffffff', 4.5);
      ['0', '0.5', '1.0', '1.5', '2.0 s'].forEach((s, i) => txt(c, s, x0 + (pw * i) / 4, h - 8, '#7385a6', 10, i === 0 ? 'left' : i === 4 ? 'right' : 'center'));
    }
    // spectrum preview
    {
      const { c, w, h } = prep($('mixSpec'));
      const x0 = 22, x1 = w - 14, top = 34, base = h - 28, pw = x1 - x0, X = (f) => x0 + (f / 16) * pw;
      grid(c, x0, top, pw, base - top, 3, 8);
      seg(c, x0, base, x1, base, '#657797', 1.2);
      for (let f = 0; f <= 16; f += 4) txt(c, String(f), X(f), base + 14, '#7385a6', 9.5, 'center');
      txt(c, 'Hz', x1, base + 24, '#7385a6', 9.5, 'right');
      comps.forEach((cp, i) => {
        if (!cp.on || cp.a === 0) return;
        const xx = X(cp.f), yy = base - (cp.a / 1.5) * (base - top - 14);
        seg(c, xx, base, xx, yy, COLORS[i], 5);
        dot(c, xx, yy, COLORS[i], 4);
        txt(c, cp.a.toFixed(2), xx, yy - 9, COLORS[i], 10, 'center', 700);
      });
    }
  });
  refreshers.push(buildComps);

  /* ================================================ 5.1 WINDING MACHINE */
  const WD = 2, WN = 1200;
  const wind = { f: 2.2, sweeping: false, time: 0, v: -1, x: null, curve: null, cmax: 1 };
  function windData() {
    if (wind.v === mixVersion) return;
    wind.v = mixVersion;
    wind.x = new Float32Array(WN);
    for (let n = 0; n < WN; n++) wind.x[n] = mixSig((n / WN) * WD);
    wind.curve = new Float32Array(401);
    wind.cmax = 0.05;
    for (let j = 0; j <= 400; j++) {
      const f = (j / 400) * 16;
      let re = 0, im = 0;
      for (let n = 0; n < WN; n++) { const a = (TAU * f * n * WD) / WN; re += wind.x[n] * Math.cos(a); im -= wind.x[n] * Math.sin(a); }
      wind.curve[j] = (2 * Math.hypot(re, im)) / WN;
      wind.cmax = Math.max(wind.cmax, wind.curve[j]);
    }
  }
  const windBtn = $('windSweep');
  windBtn.addEventListener('click', () => {
    wind.sweeping = !wind.sweeping;
    if (wind.sweeping && wind.f >= 15.9) wind.f = 0;
    setPlayBtn([windBtn], wind.sweeping);
  });
  $('windF').addEventListener('input', () => { wind.f = +$('windF').value; });
  let windStatPrev = '';
  const windSim = addSim($('simWind'), (dt) => {
    windData();
    wind.time += dt;
    if (wind.sweeping) {
      wind.f += dt * 1.6;
      if (wind.f >= 16) { wind.f = 16; wind.sweeping = false; setPlayBtn([windBtn], false); }
      $('windF').value = wind.f;
    }
    $('windFOut').textContent = wind.f.toFixed(2) + ' Hz';
    const tot = Math.max(mixAmp(), 0.01);
    let cre = 0, cim = 0;
    {
      const { c, w, h } = prep($('windCircle'));
      const cx = w / 2, cy = h / 2 + 10, R = Math.min(w, h - 40) * 0.42, sc = R / tot;
      c.beginPath(); c.arc(cx, cy, R, 0, TAU); stroke(c, '#26365288', 1);
      c.beginPath(); c.arc(cx, cy, R / 2, 0, TAU); stroke(c, '#26365266', 1);
      seg(c, cx - R - 10, cy, cx + R + 10, cy, '#33456a', 1);
      seg(c, cx, cy - R - 10, cx, cy + R + 10, '#33456a', 1);
      txt(c, 'Re', cx + R + 4, cy - 6, '#7385a6', 10, 'left');
      txt(c, 'Im', cx + 6, cy - R - 2, '#7385a6', 10, 'left');
      c.beginPath();
      for (let n = 0; n < WN; n++) {
        const a = -(TAU * wind.f * n * WD) / WN, v = wind.x[n];
        const zx = v * Math.cos(a), zy = v * Math.sin(a);
        cre += zx; cim += zy;
        const X = cx + zx * sc, Y = cy - zy * sc;
        if (n) c.lineTo(X, Y); else c.moveTo(X, Y);
      }
      stroke(c, '#45d9f5bb', 1.3, 6);
      cre /= WN; cim /= WN;
      const pn = Math.floor((((wind.time * 0.18) % 1) + 1) % 1 * (WN - 1)), pa = -(TAU * wind.f * pn * WD) / WN;
      seg(c, cx, cy, cx + wind.x[pn] * Math.cos(pa) * sc, cy - wind.x[pn] * Math.sin(pa) * sc, '#ffcb57', 2);
      dot(c, cx + wind.x[pn] * Math.cos(pa) * sc, cy - wind.x[pn] * Math.sin(pa) * sc, '#ffcb57', 3.5);
      seg(c, cx, cy, cx + cre * sc, cy - cim * sc, '#ffffff', 2.4);
      dot(c, cx + cre * sc, cy - cim * sc, '#ffffff', 6.5, 18);
      txt(c, `f = ${wind.f.toFixed(2)} Hz`, 12, h - 12, '#46e4b0', 12, 'left', 700);
    }
    const mag = 2 * Math.hypot(cre, cim);
    {
      const { c, w, h } = prep($('windCurve'));
      const x0 = 40, x1 = w - 14, top = 34, base = h - 30, pw = x1 - x0, ph = base - top;
      const X = (f) => x0 + (f / 16) * pw, ymax = wind.cmax * 1.18, Y = (v) => base - (v / ymax) * ph;
      grid(c, x0, top, pw, ph, 4, 8);
      for (let f = 0; f <= 16; f += 2) txt(c, String(f), X(f), base + 15, '#7385a6', 10, 'center');
      txt(c, t('axFreqHz'), x1, h - 4, '#8b9dbd', 10, 'right', 650);
      for (let i = 0; i <= 4; i++) txt(c, ((ymax * i) / 4).toFixed(2), x0 - 6, Y((ymax * i) / 4) + 4, '#7385a6', 9.5, 'right');
      comps.forEach((cp, i) => { if (cp.on && cp.a > 0) seg(c, X(cp.f), top, X(cp.f), base, COLORS[i] + '55', 1, [3, 4]); });
      c.beginPath();
      c.moveTo(X(0), base);
      for (let j = 0; j <= 400; j++) c.lineTo(X((j / 400) * 16), Y(wind.curve[j]));
      c.lineTo(X(16), base);
      const g = c.createLinearGradient(0, top, 0, base);
      g.addColorStop(0, 'rgba(70,228,176,.35)'); g.addColorStop(1, 'rgba(70,228,176,0)');
      c.fillStyle = g; c.fill();
      plotFn(c, X(0), X(16), 400, (x, u) => Y(wind.curve[Math.round(u * 400)]));
      stroke(c, '#46e4b0', 2, 8);
      seg(c, X(wind.f), top, X(wind.f), base, '#ffffff88', 1.2);
      dot(c, X(wind.f), Y(mag), '#ffffff', 5.5, 14);
    }
    let match = '';
    comps.forEach((cp, i) => { if (cp.on && cp.a > 0.05 && Math.abs(cp.f - wind.f) < 0.12) match = ` · <span style="color:${COLORS[i]}">✔ ${t('matches')} x${i + 1} (${fmtNum(cp.f)} Hz)</span>`; });
    const s = `2|c(f)| ≈ <b>${mag.toFixed(3)}</b>${match}`;
    if (s !== windStatPrev) { $('windStat').innerHTML = s; windStatPrev = s; }
  });
  refreshers.push(() => { windStatPrev = ''; });

  /* ======================================================== 5.2 DFT */
  function makeWin(type, N, periodic = false) {
    const w = new Float32Array(N), D = periodic ? N : N - 1;
    for (let n = 0; n < N; n++) {
      const r = D > 0 ? n / D : 0;
      w[n] = type === 'hann' ? 0.5 - 0.5 * Math.cos(TAU * r)
        : type === 'hamming' ? 0.54 - 0.46 * Math.cos(TAU * r)
          : type === 'blackman' ? 0.42 - 0.5 * Math.cos(TAU * r) + 0.08 * Math.cos(2 * TAU * r) : 1;
    }
    return w;
  }
  let dftCache = { key: '' };
  function dftCompute() {
    const fs = +$('dftFs').value, D = +$('dftD').value, noise = +$('dftN').value, win = $('dftWin').value;
    const key = [fs, D, noise, win, mixVersion].join('|');
    if (dftCache.key === key) return dftCache;
    const N = Math.max(4, Math.round(fs * D)), r = rng(99), x = new Float32Array(N), w = makeWin(win, N);
    let ws = 0;
    for (let n = 0; n < N; n++) { x[n] = mixSig(n / fs) + noise * gauss(r); ws += w[n]; }
    const K = Math.floor(N / 2), mag = new Float32Array(K + 1);
    for (let k = 0; k <= K; k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) { const a = (TAU * k * n) / N, v = x[n] * w[n]; re += v * Math.cos(a); im -= v * Math.sin(a); }
      mag[k] = (Math.hypot(re, im) * (k === 0 || (k === K && N % 2 === 0) ? 1 : 2)) / ws;
    }
    dftCache = { key, fs, D, N, x, w, mag, K, noise, win };
    return dftCache;
  }
  function dftStats() {
    const d = dftCompute();
    const fmax = Math.max(0, ...comps.filter((cp) => cp.on && cp.a > 0).map((cp) => cp.f));
    const ok = fmax < d.fs / 2;
    $('dftFsOut').textContent = d.fs + ' Hz';
    $('dftDOut').textContent = d.D.toFixed(2) + ' s';
    $('dftNOut').textContent = d.noise.toFixed(2);
    readouts($('dftStats'), [
      ['roN', d.N], ['roDf', (d.fs / d.N).toFixed(3) + ' Hz'], ['roNyquist', (d.fs / 2).toFixed(1) + ' Hz'], ['roBins', d.K + 1],
      ['roHighest', fmax + ' Hz', ok ? 'ok' : 'warn'], ['roStatus', t(ok ? 'stOk' : 'stAlias'), ok ? 'ok' : 'warn'],
    ]);
  }
  const dftSim = addSim($('simDft'), () => {
    const d = dftCompute(), tot = Math.max(mixAmp(), 0.01) + d.noise * 2, db = $('dftScale').value === 'db';
    {
      const { c, w, h } = prep($('dftTime'));
      const x0 = 14, x1 = w - 14, top = 30, ph = h - top - 26, cy = top + ph / 2, pw = x1 - x0;
      const X = (n) => x0 + (n / (d.N - 1)) * pw, Y = (v) => cy - (v / tot) * ph * 0.46;
      grid(c, x0, top, pw, ph, 4, 8);
      seg(c, x0, cy, x1, cy, '#5c6d8c66', 1);
      if (d.win !== 'rect') {
        c.setLineDash([4, 4]);
        plotFn(c, x0, x1, 200, (x, u) => Y(tot * 0.98 * d.w[Math.round(u * (d.N - 1))]));
        stroke(c, '#ffcb5788', 1.2);
        c.setLineDash([]);
      }
      plotFn(c, x0, x1, d.N - 1, (x, u) => Y(d.x[Math.round(u * (d.N - 1))]));
      stroke(c, '#7f90b055', 1);
      const big = d.N > 160;
      for (let n = 0; n < d.N; n++) {
        const v = d.x[n] * d.w[n];
        if (!big) seg(c, X(n), cy, X(n), Y(v), '#45d9f566', 1);
        dot(c, X(n), Y(v), '#45d9f5', big ? 1.6 : 2.6, 0);
      }
      txt(c, `N = ${d.N}`, x1, h - 8, '#7385a6', 10, 'right');
      txt(c, '0', x0, h - 8, '#7385a6', 10, 'left');
      txt(c, d.D.toFixed(2) + ' s', x0 + pw / 2, h - 8, '#7385a6', 10, 'center');
    }
    {
      const { c, w, h } = prep($('dftSpec'));
      const x0 = 44, x1 = w - 14, top = 34, base = h - 30, pw = x1 - x0, ph = base - top, nyq = d.fs / 2;
      const X = (f) => x0 + (f / nyq) * pw;
      const ymax = Math.max(1.6, ...d.mag) * 1.1;
      const Y = db ? (v) => base - ((clamp(20 * Math.log10(v + 1e-9), -80, 6) + 80) / 86) * ph : (v) => base - (v / ymax) * ph;
      grid(c, x0, top, pw, ph, 4, 8);
      const step = nyq > 40 ? 10 : nyq > 16 ? 4 : 2;
      for (let f = 0; f <= nyq + 1e-9; f += step) txt(c, String(f), X(f), base + 15, '#7385a6', 10, 'center');
      txt(c, t('axFreqHz'), x1, h - 4, '#8b9dbd', 10, 'right', 650);
      if (db) [0, -20, -40, -60, -80].forEach((v) => txt(c, v + ' dB', x0 - 6, base - ((v + 80) / 86) * ph + 4, '#7385a6', 9.5, 'right'));
      else for (let i = 0; i <= 4; i++) txt(c, ((ymax * i) / 4).toFixed(2), x0 - 6, base - (i / 4) * ph + 4, '#7385a6', 9.5, 'right');
      comps.forEach((cp, i) => {
        if (!cp.on || cp.a === 0) return;
        if (cp.f <= nyq) seg(c, X(cp.f), top, X(cp.f), base, COLORS[i] + '66', 1, [3, 4]);
        else {
          const fa = Math.abs(cp.f - d.fs * Math.round(cp.f / d.fs));
          seg(c, X(fa), top, X(fa), base, '#ff6b6b', 1.2, [3, 4]);
          txt(c, `alias x${i + 1}`, X(fa) + 4, top + 12 + i * 12, '#ff6b6b', 10, 'left', 700);
        }
      });
      const thin = d.K > 120;
      for (let k = 0; k <= d.K; k++) {
        const f = (k * d.fs) / d.N, y = Y(d.mag[k]);
        seg(c, X(f), base, X(f), y, '#46e4b0cc', thin ? 1 : 2);
        if (!thin) dot(c, X(f), y, '#46e4b0', 2.4, 4);
      }
    }
  }, false);
  ['dftFs', 'dftD', 'dftN', 'dftWin', 'dftScale'].forEach((id) => $(id).addEventListener('input', () => { dftStats(); dftSim.dirty = true; }));
  refreshers.push(dftStats);

  /* ============================================ 6/7. SPECTROGRAM & MEL */
  const FS = 16000;
  const S = { x: null, dur: 0, src: 'vowels', label: '', N: 512, H: 128, win: 'hann', DR: 80, nMels: 64, nMfcc: 13, fmax: 8000, frames: 0, bins: 0, hover: null, hoverK: null, pin: null, ms: 0 };
  const hz2mel = (f) => 2595 * Math.log10(1 + f / 700);
  const mel2hz = (m) => 700 * (Math.pow(10, m / 2595) - 1);

  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let q = re[i]; re[i] = re[j]; re[j] = q; q = im[i]; im[i] = im[j]; im[j] = q; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -TAU / len, wr = Math.cos(ang), wi = Math.sin(ang), half = len >> 1;
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let j = 0; j < half; j++) {
          const a = i + j, b = a + half;
          const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
          const nc = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nc;
        }
      }
    }
  }

  /* ---- sound sources (all synthesised at 16 kHz) ---- */
  const fade = (tt, T, f) => smooth(clamp(tt / f, 0, 1)) * smooth(clamp((T - tt) / f, 0, 1));
  function genVowels() {
    const V = [[730, 1090, 2440], [530, 1840, 2480], [270, 2290, 3010], [570, 840, 2410], [300, 870, 2240]];
    const segD = 0.6, total = segD * V.length, n = Math.round(total * FS), y = new Float32Array(n), r = rng(3);
    const BW = [90, 110, 160, 250], st = [[0, 0], [0, 0], [0, 0], [0, 0]];
    let ph = 0, coef = null;
    for (let i = 0; i < n; i++) {
      const tt = i / FS, vi = Math.min(V.length - 1, Math.floor(tt / segD)), lt = tt - vi * segD;
      if (i % 32 === 0) {
        const prev = V[Math.max(0, vi - 1)], cur = V[vi], m = vi === 0 ? 1 : smooth(clamp(lt / 0.1, 0, 1));
        const F = [0, 1, 2].map((j) => prev[j] + (cur[j] - prev[j]) * m).concat(3500);
        coef = F.map((f, j) => {
          const C = -Math.exp((-TAU * BW[j]) / FS), B = 2 * Math.exp((-Math.PI * BW[j]) / FS) * Math.cos((TAU * f) / FS);
          return [1 - B - C, B, C];
        });
      }
      const f0 = 128 - (18 * tt) / total + 2.5 * Math.sin(TAU * 5.2 * tt);
      ph = (ph + (TAU * f0) / FS) % TAU;
      const K = Math.floor(7000 / f0);
      let s = 0;
      for (let k = 1; k <= K; k++) s += Math.sin(k * ph) / k;
      s += 0.03 * gauss(r);
      let v = s;
      for (let j = 0; j < 4; j++) {
        const [A, B, C] = coef[j], o = A * v + B * st[j][0] + C * st[j][1];
        st[j][1] = st[j][0]; st[j][0] = o; v = o;
      }
      y[i] = v * smooth(clamp(lt / 0.05, 0, 1)) * smooth(clamp((segD - lt) / 0.08, 0, 1));
    }
    return y;
  }
  function genChirp() {
    const T = 3, n = T * FS, y = new Float32Array(n), f0 = 100, f1 = 7600;
    for (let i = 0; i < n; i++) { const tt = i / FS; y[i] = 0.7 * fade(tt, T, 0.02) * Math.sin(TAU * (f0 * tt + ((f1 - f0) * tt * tt) / (2 * T))); }
    return y;
  }
  function genMelody() {
    const notes = [60, 64, 67, 72, 76, 72, 67, 64, 60], d = 0.32, total = notes.length * d + 0.4;
    const n = Math.round(total * FS), y = new Float32Array(n);
    notes.forEach((m, j) => {
      const f = 440 * Math.pow(2, (m - 69) / 12), s0 = Math.round(j * d * FS), len = Math.round((d + 0.3) * FS);
      for (let i = 0; i < len && s0 + i < n; i++) {
        const lt = i / FS;
        const env = lt < 0.01 ? lt / 0.01 : lt < d ? 0.55 + 0.45 * Math.exp(-(lt - 0.01) / 0.08) : 0.55 * Math.exp(-(lt - d) / 0.06);
        let s = 0;
        for (let k = 1; k <= 8 && k * f < 7800; k++) s += Math.pow(0.55, k - 1) * Math.sin(TAU * k * f * lt);
        y[s0 + i] += 0.35 * env * s;
      }
    });
    return y;
  }
  function genBirds() {
    const T = 3, n = T * FS, y = new Float32Array(n);
    const call = (t0, dur, fa, fb, wob) => {
      let ph = 0;
      const s0 = Math.round(t0 * FS), len = Math.round(dur * FS);
      for (let i = 0; i < len && s0 + i < n; i++) {
        const u = i / len, f = fa + (fb - fa) * u + wob * Math.sin(TAU * 45 * (i / FS));
        ph += (TAU * f) / FS;
        y[s0 + i] += 0.6 * Math.pow(Math.sin(Math.PI * u), 2) * Math.sin(ph);
      }
    };
    [0.12, 0.42, 0.72, 1.15, 1.33, 1.51].forEach((t0, i) => call(t0, 0.14 - (i % 3) * 0.015, 6200, 3000, 250));
    for (let k = 0; k < 10; k++) call(1.95 + k * 0.08, 0.05, 3000, 4600, 0);
    return y;
  }
  function genTones() {
    const T = 3, n = T * FS, y = new Float32Array(n), r = rng(11);
    for (let i = 0; i < n; i++) {
      const tt = i / FS, sg = Math.floor(tt), lt = tt - sg, e = fade(lt, 1, 0.02);
      y[i] = e * (sg === 0 ? 0.5 * Math.sin(TAU * 1000 * tt)
        : sg === 1 ? 0.22 * gauss(r)
          : 0.35 * Math.sin(TAU * 440 * tt) + 0.15 * Math.sin(TAU * 880 * tt) + 0.25 * Math.sin(TAU * 2500 * tt));
    }
    return y;
  }
  const GEN = { vowels: genVowels, chirp: genChirp, melody: genMelody, birds: genBirds, tones: genTones };
  function normalize(d) {
    let pk = 0;
    for (const v of d) pk = Math.max(pk, Math.abs(v));
    if (pk > 1e-6) for (let i = 0; i < d.length; i++) d[i] *= 0.9 / pk;
    return d;
  }

  /* ---- analysis ---- */
  function computeSTFT() {
    const { x, N, H } = S, len = x.length, w = makeWin(S.win, N, true), frames = 1 + Math.floor(len / H), bins = N / 2 + 1;
    const pow = new Float32Array(frames * bins), db = new Float32Array(frames * bins);
    const rms = new Float32Array(frames), zcr = new Float32Array(frames), cent = new Float32Array(frames);
    const re = new Float64Array(N), im = new Float64Array(N), off = N / 2;
    let ws = 0;
    for (const v of w) ws += v;
    const norm = 4 / (ws * ws);
    let dbMax = -Infinity;
    for (let m = 0; m < frames; m++) {
      const start = m * H - off;
      let e = 0, z = 0, prev = 0;
      for (let n = 0; n < N; n++) {
        const idx = start + n, v = idx >= 0 && idx < len ? x[idx] : 0;
        re[n] = v * w[n]; im[n] = 0;
        e += v * v;
        if (n && (v >= 0) !== (prev >= 0)) z++;
        prev = v;
      }
      fft(re, im);
      let num = 0, den = 0;
      for (let k = 0; k < bins; k++) {
        const p = (re[k] * re[k] + im[k] * im[k]) * norm, i = m * bins + k;
        pow[i] = p;
        db[i] = 10 * Math.log10(p + 1e-12);
        if (db[i] > dbMax) dbMax = db[i];
        num += p * ((k * FS) / N); den += p;
      }
      rms[m] = Math.sqrt(e / N); zcr[m] = z / N; cent[m] = den > 1e-10 ? num / den : 0;
    }
    Object.assign(S, { frames, bins, pow, db, dbMax, rms, zcr, cent, w });
  }
  function melFilterbank(nMels, N, fmax) {
    const bins = N / 2 + 1, mmax = hz2mel(fmax), pts = [];
    for (let i = 0; i < nMels + 2; i++) pts.push(mel2hz((mmax * i) / (nMels + 1)));
    const fb = [];
    for (let b = 0; b < nMels; b++) {
      const lo = pts[b], c = pts[b + 1], hi = pts[b + 2], wts = new Float32Array(bins);
      let sum = 0;
      for (let k = 0; k < bins; k++) {
        const f = (k * FS) / N;
        const v = f > lo && f < c ? (f - lo) / (c - lo) : f >= c && f < hi ? (hi - f) / (hi - c) : 0;
        wts[k] = v; sum += v;
      }
      if (sum === 0) wts[Math.min(bins - 1, Math.round((c * N) / FS))] = 1;
      const enorm = 2 / (hi - lo);
      for (let k = 0; k < bins; k++) wts[k] *= enorm;
      fb.push({ lo, c, hi, wts });
    }
    return fb;
  }
  function computeMel() {
    const { frames, bins, pow } = S, B = S.nMels;
    S.fb = melFilterbank(B, S.N, S.fmax);
    const mel = new Float32Array(frames * B);
    let mx = -Infinity;
    for (let m = 0; m < frames; m++) {
      for (let b = 0; b < B; b++) {
        const wts = S.fb[b].wts;
        let s = 0;
        for (let k = 0; k < bins; k++) if (wts[k]) s += wts[k] * pow[m * bins + k];
        const v = 10 * Math.log10(s + 1e-12);
        mel[m * B + b] = v;
        if (v > mx) mx = v;
      }
    }
    S.mel = mel; S.melMax = mx;
  }
  function computeMFCC() {
    const B = S.nMels, K = Math.min(S.nMfcc, B), frames = S.frames, out = new Float32Array(frames * K);
    const cos = new Float32Array(K * B);
    for (let i = 0; i < K; i++) for (let b = 0; b < B; b++) cos[i * B + b] = Math.cos((Math.PI * i * (b + 0.5)) / B) * Math.sqrt((i ? 2 : 1) / B);
    const floor = S.melMax - S.DR;
    for (let m = 0; m < frames; m++) {
      for (let i = 0; i < K; i++) {
        let s = 0;
        for (let b = 0; b < B; b++) s += Math.max(S.mel[m * B + b], floor) * cos[i * B + b];
        out[m * K + i] = s;
      }
    }
    S.mfcc = out; S.K = K;
  }
  function toImage(arr, W, Hh, stride, offset, lo, hi, lut) {
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, W); cv.height = Math.max(1, Hh);
    const ctx = cv.getContext('2d'), img = ctx.createImageData(cv.width, cv.height), d = img.data;
    const span = hi - lo || 1;
    for (let m = 0; m < W; m++) {
      for (let k = 0; k < Hh; k++) {
        const u = clamp((arr[m * stride + k + offset] - lo) / span, 0, 1), li = ((u * 255) | 0) * 3, p = ((Hh - 1 - k) * W + m) * 4;
        d[p] = lut[li]; d[p + 1] = lut[li + 1]; d[p + 2] = lut[li + 2]; d[p + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  }
  function renderImages() {
    S.imgLin = toImage(S.db, S.frames, S.bins, S.bins, 0, S.dbMax - S.DR, S.dbMax, LUT_MAGMA);
    S.imgMel = toImage(S.mel, S.frames, S.nMels, S.nMels, 0, S.melMax - S.DR, S.melMax, LUT_MAGMA);
    const K = S.K, F = S.frames, z = new Float32Array(F * K);
    for (let i = 1; i < K; i++) {
      let mu = 0, sd = 0;
      for (let m = 0; m < F; m++) mu += S.mfcc[m * K + i] / F;
      for (let m = 0; m < F; m++) sd += (S.mfcc[m * K + i] - mu) ** 2 / F;
      sd = Math.sqrt(sd) || 1;
      for (let m = 0; m < F; m++) z[m * K + i] = (S.mfcc[m * K + i] - mu) / sd;
    }
    S.imgMfcc = toImage(z, F, K - 1, K, 1, -2.5, 2.5, LUT_DIV);
  }
  function analyse(level) {
    if (!S.x) return;
    const t0 = performance.now();
    if (level <= 0) computeSTFT();
    if (level <= 1) computeMel();
    if (level <= 2) computeMFCC();
    renderImages();
    S.ms = performance.now() - t0;
    S.hover = null; S.hoverK = null;
    if (S.pin != null && S.pin >= S.frames) S.pin = null;
    specStats();
    featLegend();
    markSpec();
  }
  function setSource(name, data, label) {
    specPlayer.stop();
    S.src = name; S.x = normalize(data); S.dur = S.x.length / FS; S.pin = null; S.label = label || '';
    document.querySelectorAll('#srcSeg button').forEach((b) => b.classList.toggle('on', b.dataset.src === name));
    analyse(0);
  }
  const srcLabel = () => (S.label ? S.label : t('src_' + S.src));
  function specStats() {
    if (!S.x) return;
    readouts($('specStats'), [
      ['roFs', '16 kHz'], ['roDuration', S.dur.toFixed(2) + ' s'], ['roWin', `${S.N} (${((S.N / FS) * 1000).toFixed(0)} ms)`],
      ['roHop', `${S.H} (${((S.H / FS) * 1000).toFixed(0)} ms)`], ['roOverlap', Math.max(0, Math.round((1 - S.H / S.N) * 100)) + '%'],
      ['roFrames', S.frames], ['roBins', S.bins], ['roDf', ((FS / S.N)).toFixed(1) + ' Hz'], ['roDt', ((S.H / FS) * 1000).toFixed(1) + ' ms'],
    ]);
    $('specStatus').innerHTML = `${t('source')}: <b>${srcLabel()}</b> · ${t('computedIn')} ${S.ms.toFixed(0)} ms`;
    $('specDROut').textContent = S.DR + ' dB';
    $('nMelsOut').textContent = S.nMels;
    $('nMfccOut').textContent = S.nMfcc;
    $('fmaxOut').textContent = fmtHz(S.fmax);
  }
  const FEAT = [['rms', '#46e4b0', 'ftRms'], ['zcr', '#ffcb57', 'ftZcr'], ['cent', '#45d9f5', 'ftCent']];
  function featLegend() {
    if (!S.x) return;
    const mx = (a) => a.reduce((m, v) => Math.max(m, v), 0);
    const val = { rms: mx(S.rms).toFixed(3), zcr: `${mx(S.zcr).toFixed(3)} (≈ ${fmtHz((mx(S.zcr) * FS) / 2)})`, cent: fmtHz(mx(S.cent)) };
    $('featLegend').innerHTML = FEAT.map(([k, col, lk]) => `<span class="toggle"><span style="width:14px;height:3px;border-radius:2px;background:${col};display:inline-block"></span>${t(lk)} · max ${val[k]}</span>`).join('');
  }

  /* ---- playback ---- */
  const specPlayer = new Player([$('specPlay'), $('melPlay')], (a) => {
    const b = a.createBuffer(1, S.x.length, FS);
    b.getChannelData(0).set(S.x);
    const src = a.createBufferSource();
    src.buffer = b;
    const out = gainOut(a, 0.85);
    src.connect(out);
    src.start();
    const n = { out, sources: [src], t0: a.currentTime };
    src.onended = () => { if (specPlayer.nodes === n) specPlayer.stop(); };
    return n;
  });
  const playTime = () => (specPlayer.nodes ? clamp(AC.currentTime - specPlayer.nodes.t0, 0, S.dur) : null);
  function selFrame() {
    const pt = playTime();
    if (pt != null) return clamp(Math.round((pt * FS) / S.H), 0, S.frames - 1);
    if (S.pin != null) return S.pin;
    if (S.hover != null) return S.hover;
    return Math.floor(S.frames * 0.42);
  }

  /* ---- drawing ---- */
  const TL = 50, TR = 12, TT = 24, TB = 22;
  function timeAxis(c, w, h, labels = true) {
    const pw = w - TL - TR;
    const step = S.dur > 6 ? 1 : S.dur > 2.5 ? 0.5 : 0.25;
    for (let s = 0; s <= S.dur + 1e-9; s += step) {
      const x = TL + (s / S.dur) * pw;
      seg(c, x, TT, x, h - TB, 'rgba(112,137,184,.09)', 1);
      if (labels) txt(c, s.toFixed(step < 0.5 ? 2 : 1), x, h - 7, '#7385a6', 9.5, s === 0 ? 'left' : 'center');
    }
    if (labels) txt(c, 't (s)', TL - 6, h - 7, '#7385a6', 9.5, 'right');
  }
  function overlays(c, w, h) {
    const pw = w - TL - TR, m = selFrame(), pt = playTime();
    const fx = TL + ((m * S.H) / FS / S.dur) * pw;
    seg(c, fx, TT, fx, h - TB, S.pin != null && pt == null ? '#ffcb57' : '#ffffff66', 1, [3, 3]);
    if (pt != null) { const x = TL + (pt / S.dur) * pw; seg(c, x, TT - 4, x, h - TB + 4, '#46e4b0', 2); }
  }
  function drawImage(c, img, w, h) {
    c.imageSmoothingEnabled = true;
    c.drawImage(img, TL, TT, w - TL - TR, h - TT - TB);
    c.strokeStyle = '#26365288'; c.lineWidth = 1; c.strokeRect(TL + 0.5, TT + 0.5, w - TL - TR - 1, h - TT - TB - 1);
  }
  function drawWave() {
    const { c, w, h } = prep($('specWave'));
    const pw = w - TL - TR, ph = h - TT - TB, cy = TT + ph / 2, x = S.x, n = x.length;
    timeAxis(c, w, h, false);
    const m = selFrame(), a = (m * S.H - S.N / 2) / FS, b = (m * S.H + S.N / 2) / FS;
    c.fillStyle = 'rgba(255,203,87,.14)';
    c.fillRect(TL + (Math.max(0, a) / S.dur) * pw, TT, Math.max(2, ((Math.min(S.dur, b) - Math.max(0, a)) / S.dur) * pw), ph);
    c.beginPath();
    for (let px = 0; px < pw; px++) {
      const i0 = Math.floor((px / pw) * n), i1 = Math.max(i0 + 1, Math.floor(((px + 1) / pw) * n));
      let lo = 1, hi = -1;
      for (let i = i0; i < i1 && i < n; i++) { if (x[i] < lo) lo = x[i]; if (x[i] > hi) hi = x[i]; }
      c.moveTo(TL + px + 0.5, cy - hi * ph * 0.48);
      c.lineTo(TL + px + 0.5, cy - lo * ph * 0.48 + 0.5);
    }
    stroke(c, '#7fa0ff', 1);
    overlays(c, w, h);
  }
  function freqAxisLinear(c, w, h) {
    const ph = h - TT - TB, nyq = FS / 2, step = ph > 200 ? 1000 : 2000;
    for (let f = 0; f <= nyq; f += step) {
      const y = TT + ph * (1 - f / nyq);
      txt(c, f === 0 ? '0' : f / 1000 + 'k', TL - 6, y + 3.5, '#7385a6', 9.5, 'right');
    }
    txt(c, 'Hz', 6, TT + 10, '#7385a6', 9.5, 'left');
  }
  function freqAxisMel(c, w, h) {
    const ph = h - TT - TB, mm = hz2mel(S.fmax);
    [0, 250, 500, 1000, 2000, 4000, 8000].filter((f) => f <= S.fmax).forEach((f) => {
      const y = TT + ph * (1 - hz2mel(f) / mm);
      seg(c, TL - 3, y, TL, y, '#7385a6', 1);
      txt(c, f >= 1000 ? f / 1000 + 'k' : String(f), TL - 6, y + 3.5, '#7385a6', 9.5, 'right');
    });
    txt(c, 'Hz', 6, TT + 10, '#7385a6', 9.5, 'left');
  }
  function drawLin() {
    const { c, w, h } = prep($('specLin'));
    drawImage(c, S.imgLin, w, h);
    freqAxisLinear(c, w, h);
    timeAxis(c, w, h);
    if (S.hoverK != null) { const y = TT + (h - TT - TB) * (1 - S.hoverK / (S.bins - 1)); seg(c, TL, y, w - TR, y, '#ffffff55', 1, [3, 3]); }
    overlays(c, w, h);
  }
  function drawFrame() {
    const { c, w, h } = prep($('specFrame'));
    const m = selFrame(), x0 = 40, x1 = w - 12, pw = x1 - x0;
    // windowed frame
    const top = 32, fh = h * 0.3, cy = top + fh / 2, N = S.N, start = m * S.H - N / 2;
    grid(c, x0, top, pw, fh, 2, 4);
    let pk = 1e-6;
    for (let n = 0; n < N; n++) { const i = start + n; if (i >= 0 && i < S.x.length) pk = Math.max(pk, Math.abs(S.x[i])); }
    c.setLineDash([4, 4]);
    plotFn(c, x0, x1, 120, (x, u) => cy - S.w[Math.round(u * (N - 1))] * fh * 0.46);
    stroke(c, '#ffcb5788', 1.2);
    c.setLineDash([]);
    plotFn(c, x0, x1, Math.min(N - 1, pw * 2), (x, u) => {
      const n = Math.round(u * (N - 1)), i = start + n, v = i >= 0 && i < S.x.length ? S.x[i] : 0;
      return cy - ((v * S.w[n]) / pk) * fh * 0.46;
    });
    stroke(c, '#7fa0ff', 1.3);
    txt(c, 'x[n+mH]·w[n]', x1, top + fh + 14, '#8b9dbd', 10, 'right');
    // spectrum of the frame
    const st = top + fh + 44, sb = h - 28, sh = sb - st, bins = S.bins, X = (f) => x0 + (f / (FS / 2)) * pw;
    let fmx = -Infinity, kpk = 0;
    for (let k = 0; k < bins; k++) { const v = S.db[m * bins + k]; if (v > fmx) { fmx = v; kpk = k; } }
    const Y = (v) => st + sh * clamp((fmx - v) / S.DR, 0, 1);
    grid(c, x0, st, pw, sh, 4, 4);
    [0, -S.DR / 2, -S.DR].forEach((v) => txt(c, v.toFixed(0), x0 - 5, Y(fmx + v) + 3.5, '#7385a6', 9, 'right'));
    for (let f = 0; f <= 8000; f += 2000) txt(c, f ? f / 1000 + 'k' : '0', X(f), sb + 13, '#7385a6', 9.5, 'center');
    txt(c, 'Hz', x1, sb + 24, '#7385a6', 9, 'right');
    c.beginPath();
    c.moveTo(X(0), sb);
    for (let k = 0; k < bins; k++) c.lineTo(X((k * FS) / S.N), Y(S.db[m * bins + k]));
    c.lineTo(X(FS / 2), sb);
    const g = c.createLinearGradient(0, st, 0, sb);
    g.addColorStop(0, 'rgba(69,217,245,.35)'); g.addColorStop(1, 'rgba(69,217,245,0)');
    c.fillStyle = g; c.fill();
    plotFn(c, X(0), X(FS / 2), bins - 1, (x, u) => Y(S.db[m * bins + Math.round(u * (bins - 1))]));
    stroke(c, '#45d9f5', 1.3);
    // mel band energies, aligned to their own maximum
    const B = S.nMels;
    let mmx = -Infinity;
    for (let b = 0; b < B; b++) mmx = Math.max(mmx, S.mel[m * B + b]);
    c.beginPath();
    for (let b = 0; b < B; b++) {
      const yy = st + sh * clamp((mmx - S.mel[m * B + b]) / S.DR, 0, 1);
      if (b) c.lineTo(X(S.fb[b].c), yy); else c.moveTo(X(S.fb[b].c), yy);
    }
    stroke(c, '#a68bff', 2, 6);
    if (B <= 64) for (let b = 0; b < B; b++) dot(c, X(S.fb[b].c), st + sh * clamp((mmx - S.mel[m * B + b]) / S.DR, 0, 1), '#a68bff', 2, 0);
    txt(c, t('lgFft'), x0 + 4, st - 18, '#45d9f5', 10.5, 'left', 650);
    txt(c, t('lgMel'), x0 + 4, st - 5, '#a68bff', 10.5, 'left', 650);
    dot(c, X((kpk * FS) / S.N), Y(fmx), '#ffffff', 3.5);
    txt(c, `${t('peak')} ${fmtHz((kpk * FS) / S.N)}`, x1, st - 5, '#ffffff', 10.5, 'right', 700);
    // inspector line
    const tt = (m * S.H) / FS;
    let s = `t = ${tt.toFixed(3)} s · ${t('frameWord')} m = ${m} / ${S.frames - 1}`;
    if (S.hoverK != null && playTime() == null) s += ` · f = ${fmtHz((S.hoverK * FS) / S.N)} · ${S.db[m * bins + S.hoverK].toFixed(1)} dB`;
    s += ` · ${t('ftCent')} ${fmtHz(S.cent[m])} · RMS ${S.rms[m].toFixed(3)}`;
    if (S.pin != null && playTime() == null) s += ` · 📌 ${t('pinned')}`;
    $('specInspect').textContent = s;
  }
  function drawMelCurve() {
    const { c, w, h } = prep($('melCurve'));
    const x0 = 46, x1 = w - 14, top = 30, base = h - 30, pw = x1 - x0, ph = base - top, fm = S.fmax, mm = hz2mel(fm);
    const X = (f) => x0 + (f / fm) * pw, Y = (m) => base - (m / mm) * ph;
    grid(c, x0, top, pw, ph, 4, 4);
    const B = S.nMels, every = Math.ceil((B + 2) / 34);
    for (let i = 0; i < B + 2; i += every) {
      const mv = (mm * i) / (B + 1), f = mel2hz(mv), col = `hsl(${250 + (i / (B + 1)) * 130},85%,65%)`;
      seg(c, x0, Y(mv), X(f), Y(mv), col + '', 0.8);
      seg(c, X(f), Y(mv), X(f), base, col, 0.8);
      dot(c, X(f), base, col, 2, 0);
    }
    plotFn(c, x0, x1, 200, (x, u) => Y(hz2mel(u * fm)));
    stroke(c, '#ffffff', 2.4, 10);
    for (let i = 0; i <= 4; i++) {
      txt(c, fmtHz((fm * i) / 4).replace('.00', ''), X((fm * i) / 4), base + 15, '#7385a6', 9.5, 'center');
      txt(c, ((mm * i) / 4).toFixed(0), x0 - 6, Y((mm * i) / 4) + 3.5, '#7385a6', 9.5, 'right');
    }
    txt(c, 'mel', 8, top + 8, '#7385a6', 9.5, 'left');
    if (fm >= 1000) { dot(c, X(1000), Y(hz2mel(1000)), '#ffcb57', 4.5); txt(c, '1000 Hz ≈ 1000 mel', X(1000) + 8, Y(hz2mel(1000)) - 6, '#ffcb57', 10.5, 'left', 700); }
  }
  function drawBank() {
    const { c, w, h } = prep($('melBank'));
    const x0 = 34, x1 = w - 12, top = 32, base = h - 30, pw = x1 - x0, ph = base - top, nyq = FS / 2;
    const X = (f) => x0 + (f / nyq) * pw;
    grid(c, x0, top, pw, ph, 4, 8);
    const m = selFrame(), bins = S.bins;
    let fmx = -Infinity;
    for (let k = 0; k < bins; k++) fmx = Math.max(fmx, S.db[m * bins + k]);
    c.beginPath();
    c.moveTo(X(0), base);
    for (let k = 0; k < bins; k++) c.lineTo(X((k * FS) / S.N), base - ph * clamp(1 - (fmx - S.db[m * bins + k]) / S.DR, 0, 1));
    c.lineTo(X(nyq), base);
    c.fillStyle = 'rgba(140,155,190,.16)'; c.fill();
    const B = S.nMels;
    S.fb.forEach((f, b) => {
      const col = `hsl(${250 + (b / Math.max(1, B - 1)) * 130},85%,65%)`;
      c.beginPath(); c.moveTo(X(f.lo), base); c.lineTo(X(f.c), top + 4); c.lineTo(X(f.hi), base);
      c.fillStyle = col.replace('hsl', 'hsla').replace('%)', '%,.12)'); c.fill();
      stroke(c, col, 1.1);
    });
    if (S.fmax < nyq) { c.fillStyle = 'rgba(7,12,25,.6)'; c.fillRect(X(S.fmax), top, X(nyq) - X(S.fmax), ph); }
    for (let f = 0; f <= nyq; f += 1000) txt(c, f ? f / 1000 + 'k' : '0', X(f), base + 15, '#7385a6', 9.5, 'center');
    txt(c, 'Hz', x1, h - 4, '#7385a6', 9.5, 'right');
    txt(c, `B = ${B}`, x1, top - 8, '#a68bff', 11, 'right', 700);
  }
  function drawMelSpec() {
    const { c, w, h } = prep($('melSpec'));
    drawImage(c, S.imgMel, w, h);
    freqAxisMel(c, w, h);
    timeAxis(c, w, h);
    overlays(c, w, h);
  }
  function drawMfcc() {
    const { c, w, h } = prep($('mfccCanvas'));
    drawImage(c, S.imgMfcc, w, h);
    const ph = h - TT - TB;
    txt(c, 'c1', TL - 6, TT + ph - 2, '#7385a6', 9.5, 'right');
    txt(c, 'c' + (S.K - 1), TL - 6, TT + 9, '#7385a6', 9.5, 'right');
    timeAxis(c, w, h);
    overlays(c, w, h);
  }
  function drawFeat() {
    const { c, w, h } = prep($('featCanvas'));
    const pw = w - TL - TR, ph = h - TT - TB;
    grid(c, TL, TT, pw, ph, 4, 1);
    timeAxis(c, w, h);
    FEAT.forEach(([k, col]) => {
      const arr = S[k], mx = arr.reduce((a, v) => Math.max(a, v), 1e-9), F = S.frames;
      plotFn(c, TL, TL + pw, Math.min(F - 1, pw), (x, u) => TT + ph * (1 - 0.94 * (arr[Math.round(u * (F - 1))] / mx)));
      stroke(c, col, 1.6, 4);
    });
    txt(c, '1', TL - 6, TT + 9, '#7385a6', 9.5, 'right');
    txt(c, '0', TL - 6, TT + ph, '#7385a6', 9.5, 'right');
    overlays(c, w, h);
  }
  const specSim = addSim($('simSpec'), () => { if (S.x) { drawWave(); drawLin(); drawFrame(); } }, () => specPlayer.on);
  const bankSim = addSim($('simMel'), () => { if (S.x) { drawMelCurve(); drawBank(); } }, () => specPlayer.on);
  const melSim = addSim($('simMelSpec'), () => { if (S.x) { drawMelSpec(); drawMfcc(); drawFeat(); } }, () => specPlayer.on);
  function markSpec() { specSim.dirty = bankSim.dirty = melSim.dirty = true; }

  /* ---- interaction ---- */
  ['specWave', 'specLin', 'melSpec', 'mfccCanvas', 'featCanvas'].forEach((id) => {
    const cv = $(id);
    const frameAt = (e) => {
      const r = cv.getBoundingClientRect(), u = (e.clientX - r.left - TL) / (r.width - TL - TR);
      return u < 0 || u > 1 || !S.x ? null : clamp(Math.round((u * S.dur * FS) / S.H), 0, S.frames - 1);
    };
    cv.addEventListener('pointermove', (e) => {
      S.hover = frameAt(e);
      S.hoverK = null;
      if (id === 'specLin' && S.hover != null) {
        const r = cv.getBoundingClientRect(), v = 1 - (e.clientY - r.top - TT) / (r.height - TT - TB);
        if (v >= 0 && v <= 1) S.hoverK = Math.round(v * (S.bins - 1));
      }
      markSpec();
    });
    cv.addEventListener('pointerleave', () => { S.hover = null; S.hoverK = null; markSpec(); });
    cv.addEventListener('click', (e) => { const f = frameAt(e); S.pin = f == null || S.pin === f ? null : f; markSpec(); });
  });
  document.querySelectorAll('#srcSeg button').forEach((b) => b.addEventListener('click', () => setSource(b.dataset.src, GEN[b.dataset.src]())));
  $('specN').addEventListener('input', () => { S.N = +$('specN').value; analyse(0); });
  $('specHop').addEventListener('input', () => { S.H = +$('specHop').value; specPlayer.stop(); analyse(0); });
  $('specWin').addEventListener('input', () => { S.win = $('specWin').value; analyse(0); });
  $('specDR').addEventListener('input', () => { S.DR = +$('specDR').value; analyse(2); });
  $('nMels').addEventListener('input', () => { S.nMels = +$('nMels').value; analyse(1); });
  $('fmax').addEventListener('input', () => { S.fmax = +$('fmax').value; analyse(1); });
  $('nMfcc').addEventListener('input', () => { S.nMfcc = +$('nMfcc').value; analyse(2); });

  async function decodeTo16k(arrayBuf) {
    const a = ac();
    const buf = await new Promise((res, rej) => a.decodeAudioData(arrayBuf, res, rej));
    const len = Math.max(1, Math.ceil(buf.duration * FS));
    const off = new OfflineAudioContext(1, len, FS);
    const s = off.createBufferSource();
    s.buffer = buf; s.connect(off.destination); s.start();
    const r = await off.startRendering();
    return r.getChannelData(0).slice(0, Math.min(len, FS * 10));
  }
  const recBtn = $('srcRec');
  let recording = false;
  recBtn.addEventListener('click', async () => {
    if (recording) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) { $('specStatus').textContent = t('micUnsupported'); return; }
    let stream;
    try { ac(); stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { $('specStatus').textContent = t('micErrShort'); return; }
    specPlayer.stop();
    recording = true;
    recBtn.classList.add('on');
    const rec = new MediaRecorder(stream), chunks = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop());
      recording = false;
      recBtn.classList.remove('on');
      recBtn.innerHTML = labelOf(recBtn);
      try {
        const data = await decodeTo16k(await new Blob(chunks, { type: rec.mimeType }).arrayBuffer());
        setSource('rec', data, t('src_rec'));
      } catch (e) { $('specStatus').textContent = t('decodeErr'); }
    };
    rec.start();
    let left = 3;
    const tick = () => {
      recBtn.innerHTML = `● ${t('recording')} ${left}`;
      if (left-- > 0) setTimeout(tick, 1000); else rec.stop();
    };
    tick();
  });
  $('srcFile').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    $('specStatus').textContent = t('decoding');
    try { setSource('file', await decodeTo16k(await f.arrayBuffer()), f.name); } catch (err) { $('specStatus').textContent = t('decodeErr'); }
    e.target.value = '';
  });
  refreshers.push(specStats, featLegend);

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

  raw.data = genRaw('ecg');
  setRawMode('ecg');
  loadPreset('default');
  dftStats();
  setSource('vowels', GEN.vowels());
  applyLang();
  onScroll();
  requestAnimationFrame(frame);
})();
