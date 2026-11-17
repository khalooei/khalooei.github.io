/* Unsupervised Lab — distances, clustering and dimensionality reduction implemented from scratch.
 * © Mohammad Khalooei (mohammad.khalooei@sharif.edu)
 * Points are arrays [x1, x2(, x3 …)]. No DOM access here. */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function rng(seed) {
    let s = seed | 0;
    return () => {
      s = (s + 0x6d2b79f5) | 0;
      let q = Math.imul(s ^ (s >>> 15), 1 | s);
      q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q;
      return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
    };
  }
  const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(TAU * r());

  /* ------------------------------------------------------------ metrics */
  const METRICS = {
    euclid: (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); },
    manhattan: (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s; },
    chebyshev: (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s = Math.max(s, Math.abs(a[i] - b[i])); return s; },
    cosine: (a, b) => {
      let ab = 0, aa = 0, bb = 0;
      for (let i = 0; i < a.length; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
      return aa < 1e-12 || bb < 1e-12 ? 1 : 1 - ab / Math.sqrt(aa * bb);
    },
  };
  const minkowski = (p) => (a, b) => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += Math.pow(Math.abs(a[i] - b[i]), p);
    return Math.pow(s, 1 / p);
  };
  /** Mahalanobis distance for 2-D points with inverse covariance [a, b, c] = [[a,b],[b,c]]. */
  const mahalanobis = (inv) => (a, b) => {
    const dx = a[0] - b[0], dy = a[1] - b[1];
    return Math.sqrt(Math.max(0, inv[0] * dx * dx + 2 * inv[1] * dx * dy + inv[2] * dy * dy));
  };
  function cov2(X) {
    const n = Math.max(1, X.length), mu = [0, 0];
    X.forEach((p) => { mu[0] += p[0] / n; mu[1] += p[1] / n; });
    let a = 0, b = 0, c = 0;
    X.forEach((p) => { const dx = p[0] - mu[0], dy = p[1] - mu[1]; a += dx * dx / n; b += dx * dy / n; c += dy * dy / n; });
    return { mu, S: [a, b, c] };
  }
  const inv2 = (S) => { const det = S[0] * S[2] - S[1] * S[1] || 1e-12; return [S[2] / det, -S[1] / det, S[0] / det]; };
  /** eigen-decomposition of a symmetric 2×2 [[a,b],[b,c]] → values (desc) and unit vectors */
  function eig2(S) {
    const [a, b, c] = S, tr = (a + c) / 2, df = Math.sqrt(((a - c) / 2) ** 2 + b * b);
    const l1 = tr + df, l2 = tr - df, th = 0.5 * Math.atan2(2 * b, a - c);
    return { vals: [l1, l2], vecs: [[Math.cos(th), Math.sin(th)], [-Math.sin(th), Math.cos(th)]], angle: th };
  }
  /** Jacobi eigen-decomposition of a small symmetric matrix (array of rows). */
  function eigSym(A) {
    const n = A.length, a = A.map((r) => r.slice()), V = a.map((_, i) => a.map((__, j) => (i === j ? 1 : 0)));
    for (let sweep = 0; sweep < 60; sweep++) {
      let off = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
      if (off < 1e-18) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-15) continue;
        const th = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]), cs = Math.cos(th), sn = Math.sin(th);
        for (let k = 0; k < n; k++) { const x = a[k][p], y = a[k][q]; a[k][p] = cs * x - sn * y; a[k][q] = sn * x + cs * y; }
        for (let k = 0; k < n; k++) { const x = a[p][k], y = a[q][k]; a[p][k] = cs * x - sn * y; a[q][k] = sn * x + cs * y; }
        for (let k = 0; k < n; k++) { const x = V[k][p], y = V[k][q]; V[k][p] = cs * x - sn * y; V[k][q] = sn * x + cs * y; }
      }
    }
    const idx = a.map((_, i) => i).sort((i, j) => a[j][j] - a[i][i]);
    return { vals: idx.map((i) => a[i][i]), vecs: idx.map((i) => V.map((r) => r[i])) };
  }

  /* ----------------------------------------------------------- datasets */
  const CL = {
    blobs3(r, nz) {
      const C = [[-0.5, -0.35], [0.5, -0.35], [0, 0.5]], k = Math.floor(r() * 3), s = 0.09 + nz * 0.25;
      return [C[k][0] + gauss(r) * s, C[k][1] + gauss(r) * s, k];
    },
    blobs5(r, nz) {
      const k = Math.floor(r() * 5), a = (k / 5) * TAU + 0.3, s = 0.07 + nz * 0.18;
      return [0.6 * Math.cos(a) + gauss(r) * s, 0.6 * Math.sin(a) + gauss(r) * s, k];
    },
    varied(r, nz) {
      const C = [[-0.55, 0.45], [0.35, 0.3], [-0.1, -0.5]], S = [0.05, 0.2, 0.1], k = Math.floor(r() * 3), s = S[k] * (0.6 + nz * 1.4);
      return [C[k][0] + gauss(r) * s, C[k][1] + gauss(r) * s, k];
    },
    aniso(r, nz) {
      const C = [[-0.45, -0.1], [0.05, 0.25], [0.5, -0.25]], k = Math.floor(r() * 3), s = 0.05 + nz * 0.1;
      const u = gauss(r) * s * 4.2, v = gauss(r) * s;
      return [C[k][0] + 0.55 * u - 0.15 * v, C[k][1] + 0.55 * u + 0.6 * v, k];
    },
    moons(r, nz) {
      const k = r() < 0.5 ? 0 : 1, th = r() * Math.PI, j = 0.03 + nz * 0.3;
      const x = k ? 1 - Math.cos(th) : Math.cos(th), y = k ? 0.5 - Math.sin(th) : Math.sin(th);
      return [(x - 0.5) * 0.62 + gauss(r) * j, (y - 0.25) * 0.8 + gauss(r) * j, k];
    },
    circles(r, nz) {
      const k = r() < 0.5 ? 0 : 1, th = r() * TAU, rad = k ? 0.35 : 0.8, j = 0.02 + nz * 0.12;
      return [rad * Math.cos(th) + gauss(r) * j, rad * Math.sin(th) + gauss(r) * j, k];
    },
    density(r, nz) {
      const k = r() < 0.5 ? 0 : 1;
      if (k === 0) return [-0.45 + gauss(r) * (0.05 + nz * 0.05), 0.35 + gauss(r) * (0.05 + nz * 0.05), 0];
      return [0.25 + gauss(r) * (0.25 + nz * 0.15), -0.25 + gauss(r) * (0.2 + nz * 0.12), 1];
    },
    uniform(r) { return [r() * 1.8 - 0.9, r() * 1.8 - 0.9, 0]; },
  };
  const CL_LIST = Object.keys(CL);
  const TRUE_K = { blobs3: 3, blobs5: 5, varied: 3, aniso: 3, moons: 2, circles: 2, density: 2, uniform: 1 };
  function makeClusters(name, n, noise, seed) {
    const r = rng(seed * 7919 + CL_LIST.indexOf(name) * 3571 + 11), g = CL[name] || CL.blobs3;
    const X = [], y = [];
    let guard = 0;
    while (X.length < n && guard++ < n * 40) {
      const p = g(r, noise);
      if (Math.abs(p[0]) > 0.98 || Math.abs(p[1]) > 0.98) continue;
      X.push([p[0], p[1]]); y.push(p[2]);
    }
    return { X, y, k: TRUE_K[name] || 3 };
  }
  /** 3-D manifolds for PCA / t-SNE; `t` is the position along the manifold (for colouring). */
  function make3D(name, n, seed) {
    const r = rng(seed * 104729 + name.length), X = [], t = [];
    for (let i = 0; i < n; i++) {
      if (name === 'swiss') {
        const u = 1.5 * Math.PI * (1 + 2 * r()), h = r() * 2 - 1;
        X.push([(u * Math.cos(u)) / 14, h * 0.75, (u * Math.sin(u)) / 14]); t.push((u - 1.5 * Math.PI) / (3 * Math.PI));
      } else if (name === 'scurve') {
        const u = 3 * Math.PI * (r() - 0.5), h = r() * 2 - 1;
        X.push([Math.sin(u) * 0.8, h * 0.9, Math.sign(u) * (Math.cos(u) - 1) * 0.8 * 0.5 + 0]); t.push(u / (3 * Math.PI) + 0.5);
      } else {
        const k = Math.floor(r() * 4), C = [[0.6, 0.6, 0.6], [-0.6, -0.6, 0.6], [-0.6, 0.6, -0.6], [0.6, -0.6, -0.6]];
        X.push(C[k].map((v) => v + gauss(r) * 0.18)); t.push(k / 3);
      }
    }
    return { X, t };
  }

  /* ------------------------------------------------------------ k-means */
  function centroidOf(pts, metric) {
    const d = pts[0].length, c = new Array(d).fill(0);
    if (metric === 'manhattan') {
      for (let j = 0; j < d; j++) {
        const v = pts.map((p) => p[j]).sort((a, b) => a - b), m = v.length;
        c[j] = m % 2 ? v[(m - 1) / 2] : (v[m / 2 - 1] + v[m / 2]) / 2;
      }
      return c;
    }
    pts.forEach((p) => { for (let j = 0; j < d; j++) c[j] += p[j] / pts.length; });
    if (metric === 'cosine') { const nr = Math.hypot(...c) || 1; for (let j = 0; j < d; j++) c[j] = (c[j] / nr) * 0.6; }
    return c;
  }
  function initCenters(X, k, method, r, metric = 'euclid') {
    const dist = METRICS[metric] || METRICS.euclid, n = X.length;
    if (!n) return [];
    if (method === 'random') {
      const idx = X.map((_, i) => i);
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      return idx.slice(0, k).map((i) => X[i].slice());
    }
    const C = [X[Math.floor(r() * n)].slice()];
    const D = X.map((p) => dist(p, C[0]) ** 2);
    while (C.length < k) {
      const tot = D.reduce((a, b) => a + b, 0);
      let u = r() * tot, pick = n - 1;
      for (let i = 0; i < n; i++) { u -= D[i]; if (u <= 0) { pick = i; break; } }
      C.push(X[pick].slice());
      X.forEach((p, i) => { D[i] = Math.min(D[i], dist(p, C[C.length - 1]) ** 2); });
    }
    return C;
  }
  function assign(X, C, metric = 'euclid') {
    const dist = METRICS[metric] || METRICS.euclid;
    return X.map((p) => {
      let b = 0, bd = Infinity;
      C.forEach((c, k) => { const d = dist(p, c); if (d < bd) { bd = d; b = k; } });
      return b;
    });
  }
  function update(X, labels, C, metric = 'euclid') {
    return C.map((c, k) => {
      const pts = X.filter((_, i) => labels[i] === k);
      return pts.length ? centroidOf(pts, metric) : c.slice();
    });
  }
  function inertia(X, labels, C, metric = 'euclid') {
    const dist = METRICS[metric] || METRICS.euclid;
    return X.reduce((s, p, i) => s + dist(p, C[labels[i]]) ** 2, 0);
  }
  function kmeans(X, k, o = {}) {
    const opt = Object.assign({ init: 'kmeans++', metric: 'euclid', restarts: 5, maxIter: 100, seed: 1 }, o);
    const r = rng(opt.seed);
    let best = null;
    for (let s = 0; s < opt.restarts; s++) {
      let C = initCenters(X, k, opt.init, r, opt.metric), L = assign(X, C, opt.metric), it = 0;
      for (; it < opt.maxIter; it++) {
        const C2 = update(X, L, C, opt.metric), L2 = assign(X, C2, opt.metric);
        const moved = C2.some((c, j) => Math.hypot(...c.map((v, d) => v - C[j][d])) > 1e-9);
        C = C2; L = L2;
        if (!moved) break;
      }
      const J = inertia(X, L, C, opt.metric);
      if (!best || J < best.inertia) best = { centers: C, labels: L, inertia: J, iter: it };
    }
    return best || { centers: [], labels: [], inertia: 0, iter: 0 };
  }

  /* --------------------------------------------------- cluster quality */
  /** silhouette per point (noise label −1 is skipped); returns { s: [...], mean } */
  function silhouette(X, labels, metric = 'euclid') {
    const dist = METRICS[metric] || METRICS.euclid, n = X.length, ks = [...new Set(labels.filter((l) => l >= 0))];
    const s = new Array(n).fill(NaN);
    if (ks.length < 2) return { s, mean: NaN };
    let tot = 0, cnt = 0;
    for (let i = 0; i < n; i++) {
      if (labels[i] < 0) continue;
      const sum = {}, num = {};
      for (let j = 0; j < n; j++) {
        if (j === i || labels[j] < 0) continue;
        const l = labels[j];
        sum[l] = (sum[l] || 0) + dist(X[i], X[j]); num[l] = (num[l] || 0) + 1;
      }
      const own = labels[i];
      if (!num[own]) { s[i] = 0; cnt++; continue; }
      const a = sum[own] / num[own];
      let b = Infinity;
      ks.forEach((l) => { if (l !== own && num[l]) b = Math.min(b, sum[l] / num[l]); });
      s[i] = isFinite(b) ? (b - a) / Math.max(a, b) : 0;
      tot += s[i]; cnt++;
    }
    return { s, mean: cnt ? tot / cnt : NaN };
  }
  /** adjusted Rand index between two labelings (noise −1 counts as its own cluster) */
  function ari(a, b) {
    const n = a.length;
    if (n < 2) return NaN;
    const tab = new Map(), ra = new Map(), rb = new Map();
    for (let i = 0; i < n; i++) {
      const k = a[i] + '|' + b[i];
      tab.set(k, (tab.get(k) || 0) + 1); ra.set(a[i], (ra.get(a[i]) || 0) + 1); rb.set(b[i], (rb.get(b[i]) || 0) + 1);
    }
    const c2 = (x) => (x * (x - 1)) / 2;
    let sij = 0, sa = 0, sb = 0;
    tab.forEach((v) => { sij += c2(v); }); ra.forEach((v) => { sa += c2(v); }); rb.forEach((v) => { sb += c2(v); });
    const exp = (sa * sb) / c2(n), mx = (sa + sb) / 2;
    return mx - exp === 0 ? (sij === exp ? 1 : 0) : (sij - exp) / (mx - exp);
  }

  /* ----------------------------------------- agglomerative clustering */
  /** Naive O(n³) agglomerative clustering with Lance–Williams updates.
   *  Returns merges [{a, b, h, size, id}] where cluster ids ≥ n are merged clusters. */
  function agglomerative(X, linkage = 'ward', metric = 'euclid') {
    const n = X.length, dist = METRICS[linkage === 'ward' ? 'euclid' : metric] || METRICS.euclid;
    const D = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let d = dist(X[i], X[j]);
      if (linkage === 'ward') d = d * d;
      D[i][j] = D[j][i] = d;
    }
    const active = new Array(n).fill(true), size = new Array(n).fill(1), id = X.map((_, i) => i), merges = [];
    for (let m = 0; m < n - 1; m++) {
      let bi = -1, bj = -1, bd = Infinity;
      for (let i = 0; i < n; i++) {
        if (!active[i]) continue;
        const Di = D[i];
        for (let j = i + 1; j < n; j++) if (active[j] && Di[j] < bd) { bd = Di[j]; bi = i; bj = j; }
      }
      if (bi < 0) break;
      const ni = size[bi], nj = size[bj];
      for (let k = 0; k < n; k++) {
        if (!active[k] || k === bi || k === bj) continue;
        const dik = D[bi][k], djk = D[bj][k], nk = size[k];
        let v;
        if (linkage === 'single') v = Math.min(dik, djk);
        else if (linkage === 'complete') v = Math.max(dik, djk);
        else if (linkage === 'average') v = (ni * dik + nj * djk) / (ni + nj);
        else v = ((ni + nk) * dik + (nj + nk) * djk - nk * bd) / (ni + nj + nk);
        D[bi][k] = D[k][bi] = v;
      }
      merges.push({ a: id[bi], b: id[bj], h: linkage === 'ward' ? Math.sqrt(2 * bd) : bd, size: ni + nj, id: n + m });
      active[bj] = false; size[bi] = ni + nj; id[bi] = n + m;
    }
    // monotone heights for drawing (centroid-like effects cannot occur with these linkages, but guard anyway)
    for (let m = 1; m < merges.length; m++) merges[m].h = Math.max(merges[m].h, merges[m - 1].h * 0.999999);
    return { n, merges, linkage, metric };
  }
  /** labels after performing the first `m` merges */
  function cutMerges(tree, m) {
    const n = tree.n, parent = Array.from({ length: 2 * n }, (_, i) => i);
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    for (let k = 0; k < Math.min(m, tree.merges.length); k++) {
      const g = tree.merges[k];
      parent[find(g.a)] = g.id; parent[find(g.b)] = g.id;
    }
    const roots = new Map();
    const lab = new Array(n);
    for (let i = 0; i < n; i++) { const r0 = find(i); if (!roots.has(r0)) roots.set(r0, roots.size); lab[i] = roots.get(r0); }
    return lab;
  }
  const mergesForK = (tree, k) => Math.max(0, tree.n - k);
  const mergesBelow = (tree, h) => tree.merges.filter((g) => g.h <= h).length;
  /** leaf order for the dendrogram */
  function leafOrder(tree) {
    const n = tree.n, ch = {};
    tree.merges.forEach((g) => { ch[g.id] = [g.a, g.b]; });
    const out = [];
    const walk = (x) => { if (x < n) { out.push(x); return; } walk(ch[x][0]); walk(ch[x][1]); };
    if (tree.merges.length) walk(tree.merges[tree.merges.length - 1].id); else for (let i = 0; i < n; i++) out.push(i);
    return out;
  }

  /* ------------------------------------------------------------ DBSCAN */
  function dbscan(X, eps, minPts, metric = 'euclid') {
    const dist = METRICS[metric] || METRICS.euclid, n = X.length;
    const nb = X.map((p) => { const L = []; X.forEach((q, j) => { if (dist(p, q) <= eps) L.push(j); }); return L; });
    const core = nb.map((L) => L.length >= minPts);
    const labels = new Array(n).fill(-1), order = [];
    let c = 0;
    for (let i = 0; i < n; i++) {
      if (labels[i] !== -1 || !core[i]) continue;
      const queue = [i];
      labels[i] = c; order.push(i);
      while (queue.length) {
        const p = queue.shift();
        if (!core[p]) continue;
        nb[p].forEach((q) => {
          if (labels[q] === -1) { labels[q] = c; order.push(q); queue.push(q); }
        });
      }
      c++;
    }
    return { labels, core, order, nClusters: c, nNoise: labels.filter((l) => l < 0).length, nb };
  }
  function kDistance(X, k, metric = 'euclid') {
    const dist = METRICS[metric] || METRICS.euclid;
    return X.map((p) => { const d = X.map((q) => dist(p, q)).sort((a, b) => a - b); return d[Math.min(k, d.length - 1)]; }).sort((a, b) => a - b);
  }

  /* --------------------------------------------------- Gaussian mixture */
  function makeGMM(X, k, o = {}) {
    const opt = Object.assign({ cov: 'full', seed: 1 }, o), r = rng(opt.seed), n = X.length;
    const C = initCenters(X, k, 'kmeans++', r);
    const g = {
      k, opt, iter: 0, ll: [],
      w: new Array(k).fill(1 / k), mu: C, S: C.map(() => [0.04, 0, 0.04]),
      R: X.map(() => new Array(k).fill(1 / k)),
    };
    const logN = (p, mu, S) => {
      const det = Math.max(S[0] * S[2] - S[1] * S[1], 1e-12), iv = [S[2] / det, -S[1] / det, S[0] / det];
      const dx = p[0] - mu[0], dy = p[1] - mu[1];
      return -0.5 * (iv[0] * dx * dx + 2 * iv[1] * dx * dy + iv[2] * dy * dy) - 0.5 * Math.log(det) - Math.log(TAU);
    };
    g.logpdf = (p) => {
      const v = g.mu.map((mu, j) => Math.log(g.w[j] + 1e-300) + logN(p, mu, g.S[j]));
      const m = Math.max(...v);
      return { v, lse: m + Math.log(v.reduce((s, x) => s + Math.exp(x - m), 0)) };
    };
    g.estep = () => {
      let L = 0;
      g.R = X.map((p) => { const { v, lse } = g.logpdf(p); L += lse; return v.map((x) => Math.exp(x - lse)); });
      g.ll.push(n ? L / n : 0);
    };
    g.mstep = () => {
      for (let j = 0; j < k; j++) {
        let Nj = 0, mx = 0, my = 0;
        X.forEach((p, i) => { const q = g.R[i][j]; Nj += q; mx += q * p[0]; my += q * p[1]; });
        if (Nj < 1e-8) continue;
        mx /= Nj; my /= Nj;
        let a = 0, b = 0, c = 0;
        X.forEach((p, i) => { const q = g.R[i][j], dx = p[0] - mx, dy = p[1] - my; a += q * dx * dx; b += q * dx * dy; c += q * dy * dy; });
        a /= Nj; b /= Nj; c /= Nj;
        if (opt.cov === 'diag') b = 0;
        if (opt.cov === 'spherical') { a = c = (a + c) / 2; b = 0; }
        if (opt.cov === 'tied') { /* handled below */ }
        g.w[j] = Nj / n; g.mu[j] = [mx, my]; g.S[j] = [a + 1e-4, b, c + 1e-4];
      }
      if (opt.cov === 'tied') {
        const T = [0, 0, 0];
        g.S.forEach((S, j) => { for (let q = 0; q < 3; q++) T[q] += g.w[j] * S[q]; });
        g.S = g.S.map(() => T.slice());
      }
      g.iter++;
    };
    g.labels = () => g.R.map((row) => row.indexOf(Math.max(...row)));
    g.run = (iters = 100) => {
      for (let t = 0; t < iters; t++) {
        g.estep(); g.mstep();
        const L = g.ll;
        if (L.length > 2 && Math.abs(L[L.length - 1] - L[L.length - 2]) < 1e-6) break;
      }
      g.estep();
      return g;
    };
    if (n) g.estep();
    return g;
  }

  /* --------------------------------------------------------- spectral */
  function spectral(X, k, o = {}) {
    const opt = Object.assign({ gamma: 20, knn: 10, seed: 1 }, o), n = X.length, r = rng(opt.seed);
    if (n < k) return { labels: X.map(() => 0) };
    // symmetric kNN-masked RBF affinity
    const W = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) {
      const d = X.map((q, j) => [METRICS.euclid(X[i], q), j]).sort((a, b) => a[0] - b[0]);
      for (let t = 1; t <= Math.min(opt.knn, n - 1); t++) {
        const [dd, j] = d[t], w = Math.exp(-opt.gamma * dd * dd) + 1e-9;
        W[i][j] = Math.max(W[i][j], w); W[j][i] = Math.max(W[j][i], w);
      }
    }
    const deg = W.map((row) => row.reduce((a, b) => a + b, 0) || 1e-12), dm = deg.map((d) => 1 / Math.sqrt(d));
    // subspace iteration on (I + D^-1/2 W D^-1/2) / 2 for the top-k eigenvectors
    let V = Array.from({ length: k }, () => Float64Array.from({ length: n }, () => r() - 0.5));
    const mul = (v) => {
      const out = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        let s = 0;
        const Wi = W[i];
        for (let j = 0; j < n; j++) if (Wi[j]) s += Wi[j] * dm[j] * v[j];
        out[i] = 0.5 * (v[i] + dm[i] * s);
      }
      return out;
    };
    for (let it = 0; it < 220; it++) {
      V = V.map(mul);
      for (let a = 0; a < k; a++) { // Gram–Schmidt
        for (let b = 0; b < a; b++) { let d = 0; for (let i = 0; i < n; i++) d += V[a][i] * V[b][i]; for (let i = 0; i < n; i++) V[a][i] -= d * V[b][i]; }
        let nr = 0; for (let i = 0; i < n; i++) nr += V[a][i] ** 2; nr = Math.sqrt(nr) || 1;
        for (let i = 0; i < n; i++) V[a][i] /= nr;
      }
    }
    const E = X.map((_, i) => { const row = V.map((v) => v[i]), nr = Math.hypot(...row) || 1; return row.map((v) => v / nr); });
    return { labels: kmeans(E, k, { restarts: 8, seed: opt.seed }).labels, embedding: E };
  }

  /* --------------------------------------------------------- mean shift */
  function meanShift(X, bw, o = {}) {
    const opt = Object.assign({ iters: 60 }, o), n = X.length;
    const modes = X.map((p) => {
      let m = p.slice();
      for (let t = 0; t < opt.iters; t++) {
        let sx = 0, sy = 0, sw = 0;
        X.forEach((q) => { const d2 = (q[0] - m[0]) ** 2 + (q[1] - m[1]) ** 2, w = Math.exp(-d2 / (2 * bw * bw)); sx += w * q[0]; sy += w * q[1]; sw += w; });
        const nm = [sx / sw, sy / sw], mv = Math.hypot(nm[0] - m[0], nm[1] - m[1]);
        m = nm;
        if (mv < 1e-5) break;
      }
      return m;
    });
    const centers = [], labels = new Array(n);
    modes.forEach((m, i) => {
      let k = centers.findIndex((c) => Math.hypot(c[0] - m[0], c[1] - m[1]) < bw * 0.5);
      if (k < 0) { centers.push(m); k = centers.length - 1; }
      labels[i] = k;
    });
    return { labels, centers };
  }

  /* --------------------------------------------------------------- PCA */
  function pca(X, dims = 2) {
    const n = X.length, d = X[0].length, mu = new Array(d).fill(0);
    X.forEach((p) => p.forEach((v, j) => { mu[j] += v / n; }));
    const C = Array.from({ length: d }, () => new Array(d).fill(0));
    X.forEach((p) => { for (let a = 0; a < d; a++) for (let b = 0; b < d; b++) C[a][b] += ((p[a] - mu[a]) * (p[b] - mu[b])) / n; });
    const { vals, vecs } = eigSym(C);
    const Y = X.map((p) => vecs.slice(0, dims).map((v) => v.reduce((s, w, j) => s + w * (p[j] - mu[j]), 0)));
    const tot = vals.reduce((a, b) => a + Math.max(0, b), 0) || 1;
    return { mu, vals, vecs, Y, explained: vals.map((v) => Math.max(0, v) / tot) };
  }

  /* ------------------------------------------------------------- t-SNE */
  function makeTSNE(X, o = {}) {
    const opt = Object.assign({ perplexity: 30, lr: 100, seed: 1, exaggeration: 12, exIters: 100 }, o);
    const n = X.length, r = rng(opt.seed);
    const D = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const d = METRICS.euclid(X[i], X[j]) ** 2; D[i][j] = D[j][i] = d; }
    // conditional probabilities with binary search on the precision
    const P = Array.from({ length: n }, () => new Float64Array(n)), target = Math.log(Math.min(opt.perplexity, (n - 1) / 3));
    for (let i = 0; i < n; i++) {
      let lo = -Infinity, hi = Infinity, beta = 1;
      for (let it = 0; it < 60; it++) {
        let sum = 0, H = 0;
        for (let j = 0; j < n; j++) { if (j === i) continue; const p = Math.exp(-D[i][j] * beta); P[i][j] = p; sum += p; }
        sum = sum || 1e-12;
        for (let j = 0; j < n; j++) { if (j === i) continue; P[i][j] /= sum; if (P[i][j] > 1e-12) H -= P[i][j] * Math.log(P[i][j]); }
        if (Math.abs(H - target) < 1e-4) break;
        if (H > target) { lo = beta; beta = hi === Infinity ? beta * 2 : (beta + hi) / 2; }
        else { hi = beta; beta = lo === -Infinity ? beta / 2 : (beta + lo) / 2; }
      }
    }
    const Pj = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) Pj[i][j] = Math.max((P[i][j] + P[j][i]) / (2 * n), 1e-12);
    const Y = X.map(() => [gauss(r) * 1e-2, gauss(r) * 1e-2]), V = X.map(() => [0, 0]), G = X.map(() => [1, 1]);
    const ts = {
      Y, iter: 0, kl: NaN,
      step(m = 1) {
        const num = Array.from({ length: n }, () => new Float64Array(n));
        for (let s = 0; s < m; s++) {
          let Z = 0;
          for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
            const dx = Y[i][0] - Y[j][0], dy = Y[i][1] - Y[j][1], q = 1 / (1 + dx * dx + dy * dy);
            num[i][j] = num[j][i] = q; Z += 2 * q;
          }
          const ex = ts.iter < opt.exIters ? opt.exaggeration : 1, mom = ts.iter < 250 ? 0.5 : 0.8;
          let kl = 0;
          for (let i = 0; i < n; i++) {
            let gx = 0, gy = 0;
            for (let j = 0; j < n; j++) {
              if (i === j) continue;
              const q = num[i][j], mult = 4 * (ex * Pj[i][j] - q / Z) * q;
              gx += mult * (Y[i][0] - Y[j][0]); gy += mult * (Y[i][1] - Y[j][1]);
              if (s === m - 1) kl += Pj[i][j] * Math.log(Pj[i][j] / Math.max(q / Z, 1e-12));
            }
            const gr = [gx, gy];
            for (let d = 0; d < 2; d++) {
              G[i][d] = Math.sign(gr[d]) === Math.sign(V[i][d]) ? G[i][d] * 0.8 : G[i][d] + 0.2;
              G[i][d] = Math.max(G[i][d], 0.01);
              V[i][d] = mom * V[i][d] - opt.lr * G[i][d] * gr[d];
            }
          }
          let cx = 0, cy = 0;
          for (let i = 0; i < n; i++) { Y[i][0] += V[i][0]; Y[i][1] += V[i][1]; cx += Y[i][0] / n; cy += Y[i][1] / n; }
          for (let i = 0; i < n; i++) { Y[i][0] -= cx; Y[i][1] -= cy; }
          ts.iter++;
          if (s === m - 1) ts.kl = kl;
        }
        return ts;
      },
    };
    return ts;
  }

  root.UL = {
    rng, gauss, clamp, METRICS, minkowski, mahalanobis, cov2, inv2, eig2, eigSym,
    CL_LIST, TRUE_K, makeClusters, make3D,
    initCenters, assign, update, inertia, kmeans, centroidOf, silhouette, ari,
    agglomerative, cutMerges, mergesForK, mergesBelow, leafOrder, dbscan, kDistance, makeGMM, spectral, meanShift, pca, makeTSNE,
  };
})(typeof window !== 'undefined' ? window : globalThis);
