(function () {
  "use strict";

  function seeded(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function makeClusters(n, seed) {
    var rnd = seeded(seed);
    var centers = [
      [0.28, 0.35],
      [0.68, 0.3],
      [0.48, 0.72],
    ];
    var pts = [];
    for (var i = 0; i < n; i++) {
      var c = centers[i % 3];
      pts.push({
        x: c[0] + (rnd() - 0.5) * 0.22,
        y: c[1] + (rnd() - 0.5) * 0.22,
        label: i % 3,
      });
    }
    return pts;
  }

  function draw(canvas, t) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cssW = canvas.clientWidth || 640;
    var cssH = canvas.clientHeight || 280;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "#0d1b2d";
    ctx.fillRect(0, 0, cssW, cssH);

    // grid
    ctx.strokeStyle = "rgba(148,163,184,0.12)";
    ctx.lineWidth = 1;
    for (var g = 1; g < 8; g++) {
      var x = (g / 8) * cssW;
      var y = (g / 8) * cssH;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cssW, y);
      ctx.stroke();
    }

    var pts = makeClusters(90, 42 + Math.floor(t / 40));
    var colors = ["#38bdf8", "#f59e0b", "#34d399"];
    var phase = (t % 360) / 360;

    // decision boundaries soft blobs
    for (var k = 0; k < 3; k++) {
      var cx = [0.28, 0.68, 0.48][k] * cssW;
      var cy = [0.35, 0.3, 0.72][k] * cssH;
      var r = 54 + 8 * Math.sin(phase * Math.PI * 2 + k);
      var grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, r);
      grad.addColorStop(0, colors[k] + "33");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    pts.forEach(function (p, i) {
      var jitter = Math.sin(phase * Math.PI * 2 + i * 0.2) * 2.2;
      var px = p.x * cssW + jitter;
      var py = p.y * cssH;
      ctx.fillStyle = colors[p.label];
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // trend line
    ctx.strokeStyle = "rgba(248,250,252,0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var i = 0; i < 40; i++) {
      var u = i / 39;
      var vx = 0.08 * cssW + u * 0.84 * cssW;
      var vy = cssH * (0.78 - 0.35 * u + 0.04 * Math.sin(u * 8 + phase * 6));
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText("live clustering · regression · decision regions", 14, 22);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("da-live-canvas");
    if (!canvas) return;
    var frame = 0;
    function tick() {
      draw(canvas, frame++);
      requestAnimationFrame(tick);
    }
    tick();
    window.addEventListener("resize", function () {
      draw(canvas, frame);
    });
  });
})();
