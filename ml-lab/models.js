/* ML Lab — learning algorithms implemented from scratch for teaching.
 * © Mohammad Khalooei (mohammad.khalooei@sharif.edu)
 *
 * Every model is binary: labels y ∈ {−1, +1}, inputs x = [x1, x2] ∈ [−1, 1]².
 * Every fitted model exposes   score(x1, x2) → real number (> 0 means class +1)
 *                              prob(x1, x2)  → estimate of P(y = +1 | x) in [0, 1]
 * so the visual layer can treat all of them the same way. No DOM access here. */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const sigmoid = (z) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ------------------------------------------------------------ random */
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

  /* ----------------------------------------------------------- datasets */
  // Each generator returns one labelled point [x1, x2, y] drawn from the distribution.
  const GEN = {
    linear(r, nz) {
      const y = r() < 0.5 ? -1 : 1;
      const c = 0.42 * y;
      return [c * 0.8 + gauss(r) * (0.12 + nz * 0.5), c * 0.6 + gauss(r) * (0.12 + nz * 0.5), y];
    },
    blobs(r, nz) {
      const y = r() < 0.5 ? -1 : 1;
      const s = 0.2 + nz * 0.45;
      return [y * 0.3 + gauss(r) * s, -y * 0.25 + gauss(r) * s, y];
    },
    outliers(r, nz) {
      const p = GEN.linear(r, nz * 0.4);
      if (r() < 0.06) p[2] = -p[2];
      return p;
    },
    xor(r, nz) {
      const a = r() * 2 - 1, b = r() * 2 - 1;
      const x1 = a * 0.9 + gauss(r) * nz * 0.25, x2 = b * 0.9 + gauss(r) * nz * 0.25;
      return [x1, x2, a * b > 0 ? 1 : -1];
    },
    circles(r, nz) {
      const y = r() < 0.5 ? -1 : 1;
      const rad = y > 0 ? 0.32 * Math.sqrt(r()) : 0.62 + r() * 0.28;
      const th = r() * TAU, j = nz * 0.22;
      return [rad * Math.cos(th) + gauss(r) * j, rad * Math.sin(th) + gauss(r) * j, y];
    },
    moons(r, nz) {
      const y = r() < 0.5 ? -1 : 1;
      const th = r() * Math.PI, j = 0.03 + nz * 0.42;
      const x1 = y < 0 ? Math.cos(th) : 1 - Math.cos(th);
      const x2 = y < 0 ? Math.sin(th) : 0.5 - Math.sin(th);
      return [(x1 - 0.5) * 0.62 + gauss(r) * j, (x2 - 0.25) * 0.8 + gauss(r) * j, y];
    },
    spiral(r, nz) {
      const y = r() < 0.5 ? -1 : 1;
      const u = r();
      const rad = 0.08 + u * 0.82, th = u * 3.1 * Math.PI + (y > 0 ? Math.PI : 0), j = 0.015 + nz * 0.12;
      return [rad * Math.cos(th) + gauss(r) * j, rad * Math.sin(th) + gauss(r) * j, y];
    },
    checker(r, nz) {
      const x1 = r() * 1.9 - 0.95, x2 = r() * 1.9 - 0.95;
      const k = Math.floor((x1 + 1) * 2) + Math.floor((x2 + 1) * 2);
      return [x1 + gauss(r) * nz * 0.12, x2 + gauss(r) * nz * 0.12, k % 2 ? 1 : -1];
    },
    stripes(r, nz) {
      const x1 = r() * 1.9 - 0.95, x2 = r() * 1.9 - 0.95;
      const y = Math.sin(3.2 * x1 + 1.4 * Math.sin(2.5 * x2)) > 0 ? 1 : -1;
      return [x1 + gauss(r) * nz * 0.1, x2 + gauss(r) * nz * 0.1, y];
    },
  };
  const DATASETS = Object.keys(GEN);

  /** Build a dataset: { X: [[x1,x2]...], y: [...], Xt, yt } (t = held-out test set). */
  function makeDataset(name, n, noise, seed, labelNoise = 0, testFrac = 0.5) {
    const r = rng(seed * 7919 + DATASETS.indexOf(name) * 104729 + 17);
    const g = GEN[name] || GEN.blobs;
    const draw = (m) => {
      const X = [], y = [];
      // stratify: half of each class so every dataset is balanced
      let pos = 0, neg = 0, guard = 0;
      while (X.length < m && guard++ < m * 50) {
        const p = g(r, noise);
        if (p[2] > 0 ? pos >= Math.ceil(m / 2) : neg >= Math.floor(m / 2)) continue;
        if (Math.abs(p[0]) > 0.98 || Math.abs(p[1]) > 0.98) continue; // resample instead of piling up at the border
        p[2] > 0 ? pos++ : neg++;
        X.push([p[0], p[1]]);
        y.push(r() < labelNoise ? -p[2] : p[2]);
      }
      return { X, y };
    };
    const tr = draw(n), te = draw(Math.max(20, Math.round(n * testFrac)));
    return { X: tr.X, y: tr.y, Xt: te.X, yt: te.y };
  }

  function accuracy(model, X, y) {
    if (!X.length) return NaN;
    let ok = 0;
    for (let i = 0; i < X.length; i++) if ((model.score(X[i][0], X[i][1]) > 0 ? 1 : -1) === y[i]) ok++;
    return ok / X.length;
  }
  function logLoss(model, X, y) {
    let s = 0;
    for (let i = 0; i < X.length; i++) {
      const p = clamp(model.prob(X[i][0], X[i][1]), 1e-7, 1 - 1e-7);
      s -= y[i] > 0 ? Math.log(p) : Math.log(1 - p);
    }
    return s / Math.max(1, X.length);
  }

  /* ================================================================ SVM */
  const KERNELS = {
    linear: () => (a, b) => a[0] * b[0] + a[1] * b[1],
    poly: (p) => (a, b) => Math.pow(p.gamma * (a[0] * b[0] + a[1] * b[1]) + p.coef0, p.degree),
    rbf: (p) => (a, b) => {
      const d0 = a[0] - b[0], d1 = a[1] - b[1];
      return Math.exp(-p.gamma * (d0 * d0 + d1 * d1));
    },
    sigmoid: (p) => (a, b) => Math.tanh(p.gamma * (a[0] * b[0] + a[1] * b[1]) + p.coef0),
  };

  /** Soft-margin SVM trained with SMO and second-order working-set selection
   *  (Fan, Chen & Lin 2005 — the algorithm inside LIBSVM).
   *  params: { kernel, C, gamma, degree, coef0, tol, maxIter } */
  function fitSVM(X, y, params) {
    const p = Object.assign({ kernel: 'rbf', C: 1, gamma: 1, degree: 3, coef0: 1, tol: 1e-3, maxIter: 200000 }, params);
    const n = X.length, C = p.C, K = KERNELS[p.kernel](p);
    const Km = new Float64Array(n * n);
    for (let i = 0; i < n; i++) for (let j = i; j < n; j++) Km[i * n + j] = Km[j * n + i] = K(X[i], X[j]);
    const alpha = new Float64Array(n), G = new Float64Array(n).fill(-1);
    const Q = (i, j) => y[i] * y[j] * Km[i * n + j];
    const TAU_ = 1e-12;
    const up = (t) => alpha[t] >= C - 1e-12, low = (t) => alpha[t] <= 1e-12;
    let iter = 0;
    for (; iter < p.maxIter && n > 1; iter++) {
      let Gmax = -Infinity, i = -1;
      for (let t = 0; t < n; t++) {
        if (y[t] === 1) { if (!up(t) && -G[t] >= Gmax) { Gmax = -G[t]; i = t; } }
        else if (!low(t) && G[t] >= Gmax) { Gmax = G[t]; i = t; }
      }
      if (i < 0) break;
      let Gmax2 = -Infinity, j = -1, objMin = Infinity;
      const Kii = Km[i * n + i];
      for (let t = 0; t < n; t++) {
        if (y[t] === 1) {
          if (!low(t)) {
            const gd = Gmax + G[t];
            if (G[t] >= Gmax2) Gmax2 = G[t];
            if (gd > 0) {
              const qc = Kii + Km[t * n + t] - 2 * y[i] * Q(i, t);
              const od = -(gd * gd) / (qc > 0 ? qc : TAU_);
              if (od <= objMin) { j = t; objMin = od; }
            }
          }
        } else if (!up(t)) {
          const gd = Gmax - G[t];
          if (-G[t] >= Gmax2) Gmax2 = -G[t];
          if (gd > 0) {
            const qc = Kii + Km[t * n + t] + 2 * y[i] * Q(i, t);
            const od = -(gd * gd) / (qc > 0 ? qc : TAU_);
            if (od <= objMin) { j = t; objMin = od; }
          }
        }
      }
      if (Gmax + Gmax2 < p.tol || j < 0) break;
      const ai = alpha[i], aj = alpha[j];
      if (y[i] !== y[j]) {
        let qc = Kii + Km[j * n + j] + 2 * Q(i, j);
        if (qc <= 0) qc = TAU_;
        const delta = (-G[i] - G[j]) / qc, diff = alpha[i] - alpha[j];
        alpha[i] += delta; alpha[j] += delta;
        if (diff > 0) { if (alpha[j] < 0) { alpha[j] = 0; alpha[i] = diff; } }
        else if (alpha[i] < 0) { alpha[i] = 0; alpha[j] = -diff; }
        if (diff > 0) { if (alpha[i] > C) { alpha[i] = C; alpha[j] = C - diff; } }
        else if (alpha[j] > C) { alpha[j] = C; alpha[i] = C + diff; }
      } else {
        let qc = Kii + Km[j * n + j] - 2 * Q(i, j);
        if (qc <= 0) qc = TAU_;
        const delta = (G[i] - G[j]) / qc, sum = alpha[i] + alpha[j];
        alpha[i] -= delta; alpha[j] += delta;
        if (sum > C) { if (alpha[i] > C) { alpha[i] = C; alpha[j] = sum - C; } }
        else if (alpha[j] < 0) { alpha[j] = 0; alpha[i] = sum; }
        if (sum > C) { if (alpha[j] > C) { alpha[j] = C; alpha[i] = sum - C; } }
        else if (alpha[i] < 0) { alpha[i] = 0; alpha[j] = sum; }
      }
      const dai = alpha[i] - ai, daj = alpha[j] - aj;
      for (let t = 0; t < n; t++) G[t] += Q(i, t) * dai + Q(j, t) * daj;
    }
    // bias (rho) exactly as LIBSVM computes it
    let ub = Infinity, lb = -Infinity, nf = 0, sf = 0;
    for (let t = 0; t < n; t++) {
      const yG = y[t] * G[t];
      if (up(t)) { if (y[t] === -1) ub = Math.min(ub, yG); else lb = Math.max(lb, yG); }
      else if (low(t)) { if (y[t] === 1) ub = Math.min(ub, yG); else lb = Math.max(lb, yG); }
      else { nf++; sf += yG; }
    }
    const rho = nf > 0 ? sf / nf : isFinite(ub + lb) ? (ub + lb) / 2 : 0;
    const sv = [], coef = [];
    let nBound = 0;
    for (let t = 0; t < n; t++) if (alpha[t] > 1e-8) { sv.push(t); coef.push(alpha[t] * y[t]); if (up(t)) nBound++; }
    const SX = sv.map((t) => X[t]);
    let w = null;
    if (p.kernel === 'linear') {
      w = [0, 0];
      sv.forEach((t, k) => { w[0] += coef[k] * X[t][0]; w[1] += coef[k] * X[t][1]; });
    }
    const score = w
      ? (a, b) => w[0] * a + w[1] * b - rho
      : (a, b) => {
        const q = [a, b];
        let s = -rho;
        for (let k = 0; k < SX.length; k++) s += coef[k] * K(SX[k], q);
        return s;
      };
    let dualObj = 0;
    for (let t = 0; t < n; t++) dualObj += alpha[t] * (G[t] + 1) * 0.5 - alpha[t];
    return {
      type: 'svm', params: p, alpha, sv, nBound, rho, w, iter, score,
      prob: (a, b) => sigmoid(2 * score(a, b)),
      margin: w ? 2 / Math.hypot(w[0], w[1]) : null,
      dual: -dualObj,
    };
  }

  /* ====================================================== decision trees */
  const IMPURITY = {
    gini: (p) => 2 * p * (1 - p),
    entropy: (p) => (p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p))),
    misclass: (p) => Math.min(p, 1 - p),
  };

  /** CART classification tree with optional sample weights.
   *  opts: { maxDepth, minLeaf, criterion, maxFeatures (1|2), random (Extra-Trees thresholds), r (rng) } */
  function fitTree(X, y, opts = {}, w = null, idx = null) {
    const o = Object.assign({ maxDepth: 4, minLeaf: 1, criterion: 'gini', maxFeatures: 2, random: false, r: Math.random }, opts);
    const imp = IMPURITY[o.criterion] || IMPURITY.gini;
    const W = w || X.map(() => 1);
    const nodes = [];
    function leafStats(ids) {
      let sw = 0, sp = 0;
      for (const i of ids) { sw += W[i]; if (y[i] > 0) sp += W[i]; }
      return { sw, sp, p: sw > 0 ? sp / sw : 0.5 };
    }
    function best(ids, sw, sp) {
      const parent = imp(sp / sw);
      let feats = [0, 1];
      if (o.maxFeatures === 1) feats = [o.r() < 0.5 ? 0 : 1];
      let bestG = 1e-12, bf = -1, bt = 0;
      for (const f of feats) {
        const s = ids.slice().sort((a, b) => X[a][f] - X[b][f]);
        if (o.random) {
          const lo = X[s[0]][f], hi = X[s[s.length - 1]][f];
          if (hi - lo < 1e-9) continue;
          const thr = lo + o.r() * (hi - lo);
          let lw = 0, lp = 0, nl = 0;
          for (const i of s) if (X[i][f] <= thr) { lw += W[i]; if (y[i] > 0) lp += W[i]; nl++; }
          if (nl < o.minLeaf || s.length - nl < o.minLeaf || lw <= 0 || sw - lw <= 0) continue;
          const g = parent - (lw * imp(lp / lw) + (sw - lw) * imp((sp - lp) / (sw - lw))) / sw;
          if (g > bestG) { bestG = g; bf = f; bt = thr; }
          continue;
        }
        let lw = 0, lp = 0;
        for (let k = 0; k < s.length - 1; k++) {
          const i = s[k];
          lw += W[i]; if (y[i] > 0) lp += W[i];
          const v = X[i][f], v2 = X[s[k + 1]][f];
          if (v2 - v < 1e-12) continue;
          if (k + 1 < o.minLeaf || s.length - k - 1 < o.minLeaf) continue;
          const rw = sw - lw;
          if (lw <= 1e-15 || rw <= 1e-15) continue;
          const g = parent - (lw * imp(lp / lw) + rw * imp((sp - lp) / rw)) / sw;
          if (g > bestG + 1e-12) { bestG = g; bf = f; bt = (v + v2) / 2; }
        }
      }
      return { f: bf, t: bt, gain: bestG };
    }
    function grow(ids, depth, box) {
      const st = leafStats(ids);
      const node = { id: nodes.length, depth, n: ids.length, w: st.sw, p: st.p, imp: imp(st.p), box, leaf: true, ids };
      nodes.push(node);
      const pure = st.sp <= 1e-12 || st.sp >= st.sw - 1e-12;
      if (depth >= o.maxDepth || ids.length < 2 * o.minLeaf || pure) return node;
      const b = best(ids, st.sw, st.sp);
      if (b.f < 0) return node;
      const L = [], R = [];
      for (const i of ids) (X[i][b.f] <= b.t ? L : R).push(i);
      if (!L.length || !R.length) return node;
      node.leaf = false; node.f = b.f; node.t = b.t; node.gain = b.gain;
      const bl = box.slice(), br = box.slice();
      if (b.f === 0) { bl[1] = b.t; br[0] = b.t; } else { bl[3] = b.t; br[2] = b.t; }
      node.left = grow(L, depth + 1, bl);
      node.right = grow(R, depth + 1, br);
      return node;
    }
    const all = idx || X.map((_, i) => i);
    const rootN = grow(all, 0, [-Infinity, Infinity, -Infinity, Infinity]);
    const leafOf = (a, b) => {
      let nd = rootN;
      while (!nd.leaf) nd = (nd.f === 0 ? a : b) <= nd.t ? nd.left : nd.right;
      return nd;
    };
    let depth = 0, leaves = 0;
    nodes.forEach((nd) => { depth = Math.max(depth, nd.depth); if (nd.leaf) leaves++; });
    return {
      type: 'tree', root: rootN, nodes, depth, leaves, leafOf,
      prob: (a, b) => leafOf(a, b).p,
      score: (a, b) => leafOf(a, b).p - 0.5,
      path(a, b) {
        const out = [];
        let nd = rootN;
        out.push(nd.id);
        while (!nd.leaf) { nd = (nd.f === 0 ? a : b) <= nd.t ? nd.left : nd.right; out.push(nd.id); }
        return out;
      },
    };
  }

  /** Impurity of every candidate threshold of a node, for the split-scanner chart. */
  function scanSplits(X, y, ids, criterion) {
    const imp = IMPURITY[criterion] || IMPURITY.gini;
    let sp = 0;
    for (const i of ids) if (y[i] > 0) sp++;
    const n = ids.length, parent = imp(sp / n);
    return {
      parent,
      feats: [0, 1].map((f) => {
        const s = ids.slice().sort((a, b) => X[a][f] - X[b][f]);
        const pts = [];
        let lp = 0;
        for (let k = 0; k < n - 1; k++) {
          if (y[s[k]] > 0) lp++;
          const v = X[s[k]][f], v2 = X[s[k + 1]][f];
          if (v2 - v < 1e-12) continue;
          const nl = k + 1, nr = n - nl;
          pts.push([(v + v2) / 2, (nl * imp(lp / nl) + nr * imp((sp - lp) / nr)) / n]);
        }
        return pts;
      }),
    };
  }

  /* ====================================================== random forest */
  function fitForest(X, y, o = {}) {
    const opt = Object.assign({ nTrees: 50, maxDepth: 8, minLeaf: 1, criterion: 'gini', maxFeatures: 1, bootstrap: true, sampleFrac: 1, extra: false, seed: 1 }, o);
    const r = rng(opt.seed), n = X.length, trees = [], inBag = [];
    for (let t = 0; t < opt.nTrees; t++) {
      const m = Math.max(2, Math.round(n * opt.sampleFrac));
      const bag = new Uint8Array(n), ids = [];
      if (opt.bootstrap) for (let k = 0; k < m; k++) { const i = Math.floor(r() * n); ids.push(i); bag[i] = 1; }
      else {
        const perm = X.map((_, i) => i);
        for (let k = n - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [perm[k], perm[j]] = [perm[j], perm[k]]; }
        for (let k = 0; k < Math.min(m, n); k++) { ids.push(perm[k]); bag[perm[k]] = 1; }
      }
      trees.push(fitTree(X, y, { maxDepth: opt.maxDepth, minLeaf: opt.minLeaf, criterion: opt.criterion, maxFeatures: opt.maxFeatures, random: opt.extra, r }, null, ids));
      inBag.push({ bag, ids });
    }
    // out-of-bag accuracy
    let oobOk = 0, oobN = 0;
    for (let i = 0; i < n; i++) {
      let s = 0, c = 0;
      for (let t = 0; t < trees.length; t++) if (!inBag[t].bag[i]) { s += trees[t].prob(X[i][0], X[i][1]); c++; }
      if (c) { oobN++; if ((s / c > 0.5 ? 1 : -1) === y[i]) oobOk++; }
    }
    const prob = (a, b, k = trees.length) => {
      let s = 0;
      for (let t = 0; t < k; t++) s += trees[t].prob(a, b);
      return s / k;
    };
    return {
      type: 'forest', trees, inBag, opt,
      oob: oobN ? oobOk / oobN : NaN,
      prob, score: (a, b) => prob(a, b) - 0.5,
      /** accuracy of the first k trees, for k = 1..T */
      curve(Xs, ys) {
        const T = trees.length, acc = new Float64Array(T), sum = new Float64Array(Xs.length);
        for (let t = 0; t < T; t++) {
          let ok = 0;
          for (let i = 0; i < Xs.length; i++) {
            sum[i] += trees[t].prob(Xs[i][0], Xs[i][1]);
            if ((sum[i] / (t + 1) > 0.5 ? 1 : -1) === ys[i]) ok++;
          }
          acc[t] = ok / Math.max(1, Xs.length);
        }
        return acc;
      },
    };
  }

  /* ============================================================ AdaBoost */
  function fitAdaBoost(X, y, o = {}) {
    const opt = Object.assign({ rounds: 50, depth: 1, lr: 1 }, o);
    const n = X.length;
    let w = new Float64Array(n).fill(1 / n);
    const learners = [], alphas = [], eps = [], weights = [];
    for (let t = 0; t < opt.rounds; t++) {
      weights.push(Float64Array.from(w));
      const tr = fitTree(X, y, { maxDepth: opt.depth, minLeaf: 1, criterion: 'gini' }, Array.from(w));
      const h = X.map((x) => (tr.prob(x[0], x[1]) > 0.5 ? 1 : -1));
      let e = 0;
      for (let i = 0; i < n; i++) if (h[i] !== y[i]) e += w[i];
      e = clamp(e, 1e-10, 1);
      if (e >= 0.5 - 1e-9) { if (!learners.length) { learners.push(tr); alphas.push(1e-3); eps.push(e); } break; }
      const a = opt.lr * 0.5 * Math.log((1 - e) / e);
      learners.push(tr); alphas.push(a); eps.push(e);
      let s = 0;
      for (let i = 0; i < n; i++) { w[i] *= Math.exp(-a * y[i] * h[i]); s += w[i]; }
      for (let i = 0; i < n; i++) w[i] /= s;
      if (e <= 1e-9) break;
    }
    weights.push(Float64Array.from(w));
    const F = (a, b, k = learners.length) => {
      let s = 0;
      for (let t = 0; t < k; t++) s += alphas[t] * (learners[t].prob(a, b) > 0.5 ? 1 : -1);
      return s;
    };
    return {
      type: 'adaboost', learners, alphas, eps, weights, opt, F,
      score: (a, b) => F(a, b), prob: (a, b) => sigmoid(2 * F(a, b)),
      at(k) { return { score: (a, b) => F(a, b, k), prob: (a, b) => sigmoid(2 * F(a, b, k)) }; },
    };
  }

  /* =================================================== gradient boosting */
  /** Regression tree on gradients g and hessians h with XGBoost-style gain and L2-regularised leaves. */
  function fitGradTree(X, g, h, ids, depth, lambda, minLeaf, gammaSplit) {
    function grow(ids, d) {
      let G = 0, H = 0;
      for (const i of ids) { G += g[i]; H += h[i]; }
      const node = { leaf: true, v: -G / (H + lambda), n: ids.length };
      if (d >= depth || ids.length < 2 * minLeaf) return node;
      const base = (G * G) / (H + lambda);
      let bestGain = gammaSplit + 1e-12, bf = -1, bt = 0;
      for (let f = 0; f < 2; f++) {
        const s = ids.slice().sort((a, b) => X[a][f] - X[b][f]);
        let GL = 0, HL = 0;
        for (let k = 0; k < s.length - 1; k++) {
          GL += g[s[k]]; HL += h[s[k]];
          const v = X[s[k]][f], v2 = X[s[k + 1]][f];
          if (v2 - v < 1e-12 || k + 1 < minLeaf || s.length - k - 1 < minLeaf) continue;
          const GR = G - GL, HR = H - HL;
          const gain = 0.5 * ((GL * GL) / (HL + lambda) + (GR * GR) / (HR + lambda) - base);
          if (gain > bestGain) { bestGain = gain; bf = f; bt = (v + v2) / 2; }
        }
      }
      if (bf < 0) return node;
      const L = [], R = [];
      for (const i of ids) (X[i][bf] <= bt ? L : R).push(i);
      return { leaf: false, f: bf, t: bt, left: grow(L, d + 1), right: grow(R, d + 1), n: ids.length };
    }
    const rootN = grow(ids, 0);
    return (a, b) => {
      let nd = rootN;
      while (!nd.leaf) nd = (nd.f === 0 ? a : b) <= nd.t ? nd.left : nd.right;
      return nd.v;
    };
  }

  function fitGradBoost(X, y, o = {}) {
    const opt = Object.assign({ rounds: 100, lr: 0.1, depth: 3, lambda: 1, subsample: 1, minLeaf: 1, seed: 1, Xt: null, yt: null }, o);
    const n = X.length, r = rng(opt.seed);
    const pos = y.filter((v) => v > 0).length;
    const pb = clamp(pos / Math.max(1, n), 0.02, 0.98), F0 = Math.log(pb / (1 - pb));
    const F = new Float64Array(n).fill(F0);
    const Xt = opt.Xt || [], yt = opt.yt || [];
    const Ft = new Float64Array(Xt.length).fill(F0);
    const trees = [], hist = { trainLoss: [], testLoss: [], trainErr: [], testErr: [] }, resid = [];
    const g = new Float64Array(n), h = new Float64Array(n);
    const ll = (Fa, ys) => {
      let s = 0, e = 0;
      for (let i = 0; i < ys.length; i++) {
        const m = ys[i] * Fa[i];
        s += m > 0 ? Math.log1p(Math.exp(-m)) : -m + Math.log1p(Math.exp(m));
        if (m <= 0) e++;
      }
      return [s / Math.max(1, ys.length), e / Math.max(1, ys.length)];
    };
    const record = () => {
      const a = ll(F, y), b = ll(Ft, yt);
      hist.trainLoss.push(a[0]); hist.trainErr.push(a[1]);
      hist.testLoss.push(b[0]); hist.testErr.push(b[1]);
    };
    record();
    for (let t = 0; t < opt.rounds; t++) {
      const rs = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const p = sigmoid(F[i]), y01 = y[i] > 0 ? 1 : 0;
        g[i] = p - y01; h[i] = Math.max(p * (1 - p), 1e-6); rs[i] = y01 - p;
      }
      resid.push(rs);
      let ids = X.map((_, i) => i);
      if (opt.subsample < 1) ids = ids.filter(() => r() < opt.subsample);
      if (ids.length < 2) ids = X.map((_, i) => i);
      const tree = fitGradTree(X, g, h, ids, opt.depth, opt.lambda, opt.minLeaf, 0);
      trees.push(tree);
      for (let i = 0; i < n; i++) F[i] += opt.lr * tree(X[i][0], X[i][1]);
      for (let i = 0; i < Xt.length; i++) Ft[i] += opt.lr * tree(Xt[i][0], Xt[i][1]);
      record();
    }
    const Fx = (a, b, k = trees.length) => {
      let s = F0;
      for (let t = 0; t < k; t++) s += opt.lr * trees[t](a, b);
      return s;
    };
    return {
      type: 'gboost', trees, hist, resid, F0, opt,
      score: (a, b) => Fx(a, b), prob: (a, b) => sigmoid(Fx(a, b)),
      at(k) { return { score: (a, b) => Fx(a, b, k), prob: (a, b) => sigmoid(Fx(a, b, k)) }; },
    };
  }

  /* ================================================================ k-NN */
  const METRICS = {
    euclid: (a, b, c, d) => Math.hypot(a - c, b - d),
    manhattan: (a, b, c, d) => Math.abs(a - c) + Math.abs(b - d),
    chebyshev: (a, b, c, d) => Math.max(Math.abs(a - c), Math.abs(b - d)),
  };
  function fitKNN(X, y, o = {}) {
    const opt = Object.assign({ k: 5, metric: 'euclid', weighted: false }, o);
    const dist = METRICS[opt.metric] || METRICS.euclid;
    const k = Math.min(opt.k, X.length);
    const nearest = (a, b) => {
      const bd = new Float64Array(k).fill(Infinity), bi = new Int32Array(k).fill(-1);
      for (let i = 0; i < X.length; i++) {
        const d = dist(a, b, X[i][0], X[i][1]);
        if (d >= bd[k - 1]) continue;
        let j = k - 1;
        while (j > 0 && bd[j - 1] > d) { bd[j] = bd[j - 1]; bi[j] = bi[j - 1]; j--; }
        bd[j] = d; bi[j] = i;
      }
      return { bd, bi };
    };
    const prob = (a, b) => {
      if (!k) return 0.5;
      const { bd, bi } = nearest(a, b);
      let s = 0, sw = 0;
      for (let j = 0; j < k; j++) {
        if (bi[j] < 0) continue;
        const wt = opt.weighted ? 1 / (bd[j] + 1e-3) : 1;
        sw += wt; if (y[bi[j]] > 0) s += wt;
      }
      return sw ? s / sw : 0.5;
    };
    return { type: 'knn', opt, nearest, prob, score: (a, b) => prob(a, b) - 0.5 };
  }

  /* ================================================ logistic regression */
  function polyTerms(deg) {
    const t = [];
    for (let d = 1; d <= deg; d++) for (let i = d; i >= 0; i--) t.push([i, d - i]);
    return t;
  }
  function polyFeatures(terms, a, b) {
    const f = new Float64Array(terms.length);
    for (let k = 0; k < terms.length; k++) f[k] = Math.pow(a, terms[k][0]) * Math.pow(b, terms[k][1]);
    return f;
  }
  /** Logistic regression on polynomial features, trained incrementally with Adam (call step()). */
  function makeLogReg(X, y, o = {}) {
    const opt = Object.assign({ degree: 1, lambda: 0, lr: 0.1 }, o);
    const terms = polyTerms(opt.degree), D = terms.length;
    const Phi = X.map((x) => polyFeatures(terms, x[0], x[1]));
    const w = new Float64Array(D + 1);
    const m = new Float64Array(D + 1), v = new Float64Array(D + 1);
    let t = 0;
    const lin = (f) => { let s = w[D]; for (let k = 0; k < D; k++) s += w[k] * f[k]; return s; };
    const model = {
      type: 'logreg', opt, terms, w, epoch: 0, loss: [],
      score: (a, b) => lin(polyFeatures(terms, a, b)),
      prob: (a, b) => sigmoid(lin(polyFeatures(terms, a, b))),
      step(nSteps = 1) {
        const n = X.length;
        for (let s = 0; s < nSteps; s++) {
          const gr = new Float64Array(D + 1);
          let L = 0;
          for (let i = 0; i < n; i++) {
            const z = lin(Phi[i]), y01 = y[i] > 0 ? 1 : 0, p = sigmoid(z);
            const mz = y[i] * z;
            L += mz > 0 ? Math.log1p(Math.exp(-mz)) : -mz + Math.log1p(Math.exp(mz));
            const e = p - y01;
            for (let k = 0; k < D; k++) gr[k] += e * Phi[i][k];
            gr[D] += e;
          }
          let reg = 0;
          for (let k = 0; k <= D; k++) {
            gr[k] /= Math.max(1, n);
            if (k < D) { gr[k] += opt.lambda * w[k]; reg += w[k] * w[k]; }
          }
          t++;
          for (let k = 0; k <= D; k++) {
            m[k] = 0.9 * m[k] + 0.1 * gr[k];
            v[k] = 0.999 * v[k] + 0.001 * gr[k] * gr[k];
            const mh = m[k] / (1 - Math.pow(0.9, t)), vh = v[k] / (1 - Math.pow(0.999, t));
            w[k] -= opt.lr * mh / (Math.sqrt(vh) + 1e-8);
          }
          model.epoch++;
          model.loss.push(L / Math.max(1, n) + 0.5 * opt.lambda * reg);
        }
        return model;
      },
    };
    return model;
  }

  /* ================================= Gaussian generative: NB · LDA · QDA */
  function fitGaussian(X, y, o = {}) {
    const opt = Object.assign({ mode: 'nb' }, o);
    const stats = [-1, 1].map((c) => {
      const pts = X.filter((_, i) => y[i] === c);
      const n = Math.max(1, pts.length);
      const mu = [0, 0];
      pts.forEach((p) => { mu[0] += p[0] / n; mu[1] += p[1] / n; });
      const S = [0, 0, 0]; // sxx, sxy, syy
      pts.forEach((p) => {
        const a = p[0] - mu[0], b = p[1] - mu[1];
        S[0] += (a * a) / n; S[1] += (a * b) / n; S[2] += (b * b) / n;
      });
      return { c, n: pts.length, mu, S, prior: pts.length / Math.max(1, X.length) };
    });
    const reg = 1e-3;
    let covs;
    if (opt.mode === 'lda') {
      const N = Math.max(1, X.length), P = [0, 0, 0];
      stats.forEach((s) => { for (let k = 0; k < 3; k++) P[k] += (s.S[k] * s.n) / N; });
      covs = [P, P];
    } else if (opt.mode === 'nb') covs = stats.map((s) => [s.S[0], 0, s.S[2]]);
    else covs = stats.map((s) => s.S);
    covs = covs.map((S) => [S[0] + reg, S[1], S[2] + reg]);
    const parts = stats.map((s, k) => {
      const S = covs[k], det = S[0] * S[2] - S[1] * S[1];
      const inv = [S[2] / det, -S[1] / det, S[0] / det];
      return { mu: s.mu, S, inv, logNorm: -0.5 * Math.log(Math.max(det, 1e-12)) + Math.log(Math.max(s.prior, 1e-6)) };
    });
    const logp = (k, a, b) => {
      const q = parts[k], dx = a - q.mu[0], dy = b - q.mu[1];
      return q.logNorm - 0.5 * (q.inv[0] * dx * dx + 2 * q.inv[1] * dx * dy + q.inv[2] * dy * dy);
    };
    const score = (a, b) => logp(1, a, b) - logp(0, a, b);
    return { type: 'gauss', opt, parts, score, prob: (a, b) => sigmoid(score(a, b)) };
  }

  /* =========================================== multilayer perceptron */
  const ACT = {
    tanh: { f: Math.tanh, d: (yv) => 1 - yv * yv },
    relu: { f: (z) => (z > 0 ? z : 0), d: (yv) => (yv > 0 ? 1 : 0) },
    sigmoid: { f: sigmoid, d: (yv) => yv * (1 - yv) },
    linear: { f: (z) => z, d: () => 1 },
  };
  /** A tiny dense network 2 → hidden... → 1 with logistic output, trained with full-batch Adam. */
  function makeMLP(X, y, o = {}) {
    const opt = Object.assign({ hidden: [8, 8], act: 'tanh', lr: 0.03, lambda: 0, seed: 1 }, o);
    const r = rng(opt.seed), act = ACT[opt.act] || ACT.tanh;
    const sizes = [2, ...opt.hidden, 1];
    const Wt = [], B = [], mW = [], vW = [], mB = [], vB = [];
    for (let l = 0; l < sizes.length - 1; l++) {
      const fi = sizes[l], fo = sizes[l + 1];
      const sc = opt.act === 'relu' ? Math.sqrt(2 / fi) : Math.sqrt(1 / fi);
      Wt.push(Float64Array.from({ length: fi * fo }, () => gauss(r) * sc));
      B.push(new Float64Array(fo).fill(opt.act === 'relu' ? 0.01 : 0));
      mW.push(new Float64Array(fi * fo)); vW.push(new Float64Array(fi * fo));
      mB.push(new Float64Array(fo)); vB.push(new Float64Array(fo));
    }
    const L = Wt.length;
    function forward(a, b, keep) {
      let h = [a, b];
      const acts = keep ? [h] : null;
      for (let l = 0; l < L; l++) {
        const fi = sizes[l], fo = sizes[l + 1], out = new Float64Array(fo), Wl = Wt[l];
        for (let j = 0; j < fo; j++) {
          let s = B[l][j];
          for (let i = 0; i < fi; i++) s += Wl[j * fi + i] * h[i];
          out[j] = l === L - 1 ? s : act.f(s);
        }
        h = out;
        if (keep) acts.push(h);
      }
      return keep ? acts : h[0];
    }
    let t = 0;
    const model = {
      type: 'mlp', opt, sizes, Wt, B, epoch: 0, loss: [],
      score: (a, b) => forward(a, b, false),
      prob: (a, b) => sigmoid(forward(a, b, false)),
      step(nSteps = 1) {
        const n = X.length;
        for (let s = 0; s < nSteps; s++) {
          const gW = Wt.map((w) => new Float64Array(w.length)), gB = B.map((bb) => new Float64Array(bb.length));
          let loss = 0;
          for (let i = 0; i < n; i++) {
            const acts = forward(X[i][0], X[i][1], true);
            const z = acts[L][0], mz = y[i] * z;
            loss += mz > 0 ? Math.log1p(Math.exp(-mz)) : -mz + Math.log1p(Math.exp(mz));
            let delta = new Float64Array([sigmoid(z) - (y[i] > 0 ? 1 : 0)]);
            for (let l = L - 1; l >= 0; l--) {
              const fi = sizes[l], fo = sizes[l + 1], hin = acts[l];
              for (let j = 0; j < fo; j++) {
                gB[l][j] += delta[j];
                for (let k = 0; k < fi; k++) gW[l][j * fi + k] += delta[j] * hin[k];
              }
              if (l > 0) {
                const nd = new Float64Array(fi);
                for (let k = 0; k < fi; k++) {
                  let sum = 0;
                  for (let j = 0; j < fo; j++) sum += Wt[l][j * fi + k] * delta[j];
                  nd[k] = sum * act.d(hin[k]);
                }
                delta = nd;
              }
            }
          }
          t++;
          const b1 = 1 - Math.pow(0.9, t), b2 = 1 - Math.pow(0.999, t);
          let reg = 0;
          for (let l = 0; l < L; l++) {
            for (let k = 0; k < Wt[l].length; k++) {
              const gg = gW[l][k] / n + opt.lambda * Wt[l][k];
              reg += Wt[l][k] * Wt[l][k];
              mW[l][k] = 0.9 * mW[l][k] + 0.1 * gg; vW[l][k] = 0.999 * vW[l][k] + 0.001 * gg * gg;
              Wt[l][k] -= (opt.lr * mW[l][k] / b1) / (Math.sqrt(vW[l][k] / b2) + 1e-8);
            }
            for (let k = 0; k < B[l].length; k++) {
              const gg = gB[l][k] / n;
              mB[l][k] = 0.9 * mB[l][k] + 0.1 * gg; vB[l][k] = 0.999 * vB[l][k] + 0.001 * gg * gg;
              B[l][k] -= (opt.lr * mB[l][k] / b1) / (Math.sqrt(vB[l][k] / b2) + 1e-8);
            }
          }
          model.epoch++;
          model.loss.push(loss / Math.max(1, n) + 0.5 * opt.lambda * reg);
        }
        return model;
      },
      /** hidden activations for the network diagram */
      activations: (a, b) => forward(a, b, true),
    };
    return model;
  }

  root.ML = {
    rng, gauss, sigmoid, clamp, DATASETS, makeDataset, accuracy, logLoss,
    KERNELS, fitSVM, IMPURITY, fitTree, scanSplits, fitForest, fitAdaBoost, fitGradBoost,
    METRICS, fitKNN, polyTerms, makeLogReg, fitGaussian, makeMLP,
  };
})(typeof window !== 'undefined' ? window : globalThis);
